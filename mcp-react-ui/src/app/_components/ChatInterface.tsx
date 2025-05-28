"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { Sidebar } from "./Sidebar";
import { ChatInput } from "./ChatInput";
import { ChatMessage, type Message } from "./ChatMessage";
import { Canvas } from "./Canvas";
import { SampleInteractiveKaleidoscope } from "./SampleCanvasContent";
import { SampleDocumentContent } from "./SampleDocumentContent";
import { EventDetailsCanvas } from "./EventDetailsCanvas";
import type { AgentResponse } from "../_services/AgentOrchestrator";

// Define types for canvas data
interface CanvasDataDocument {
  type: "document";
  content: {
    title: string;
    sections: Array<{ title: string; points: string[] }>;
  };
}

interface CanvasDataEvent {
  type: "event";
  details: {
    name: string;
    date: string;
    time: string;
    venue: string;
    conflict: {
      meeting: string;
      time: string;
      canReschedule: boolean;
    };
  };
}

interface CanvasDataKaleidoscope {
  type: "kaleidoscope";
}

interface CanvasDataGeneratedComponent {
  type: "generated-component";
}

interface CanvasDataError {
  type: "error";
}

type CanvasData = CanvasDataDocument | CanvasDataEvent | CanvasDataKaleidoscope | CanvasDataGeneratedComponent | CanvasDataError;

// Type guard function to check if data is CanvasDataDocument
const isDocumentData = (data: CanvasData): data is CanvasDataDocument => {
  return data.type === "document";
};

// Type guard function to check if data is CanvasDataEvent
const isEventData = (data: CanvasData): data is CanvasDataEvent => {
  return data.type === "event";
};

// Type guard function to check if data is CanvasDataKaleidoscope
const isKaleidoscopeData = (data: CanvasData): data is CanvasDataKaleidoscope => {
  return data.type === "kaleidoscope";
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasContent, setCanvasContent] = useState<React.ReactNode | string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to detect if the content contains JSX code
  const isJsxContent = (content: string) => {
    return (
      content.includes('<div') || 
      content.includes('<button') || 
      content.includes('<section') ||
      content.includes('<form') ||
      content.includes('function') && content.includes('return') && content.includes('<') ||
      /import\s+React|import\s+{\s*[^}]*useState[^}]*\s*}/.test(content)
    );
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-collapse sidebar when starting a chat if on smaller screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && messages.length > 0) {
        setIsSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [messages.length]);

  // Listen for album creation from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Type guard for the message data
      const isAlbumCreationMessage = (data: unknown): data is { type: 'album-creation-started'; albumRequest: string } => {
        return (
          typeof data === 'object' &&
          data !== null &&
          'type' in data &&
          'albumRequest' in data &&
          (data as { type: unknown }).type === 'album-creation-started' &&
          typeof (data as { albumRequest: unknown }).albumRequest === 'string'
        );
      };

      // Only handle messages from our iframe
      if (isAlbumCreationMessage(event.data)) {
        console.log('🎨 Album creation started in iframe, triggering tool calls');
        
        // Store the album request to avoid TypeScript issues
        const albumRequest = event.data.albumRequest;
        
        // Handle the album creation asynchronously
        const handleAlbumCreation = async () => {
          // Create a synthetic user message for the album creation
          const albumCreationMessage: Message = {
            id: uuidv4(),
            role: "user",
            content: albumRequest,
            timestamp: new Date(),
          };

          // Add the message to show user intent
          setMessages((prev) => [...prev, albumCreationMessage]);
          setIsLoading(true);

          try {
            // Make API call for album creation
            const response = await fetch('/api/process-message', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                messages: [...messages, albumCreationMessage],
                enableToolCallNotifications: true,
                useStreaming: true,
                isAlbumCreation: true
              }),
            });

            if (!response.ok) {
              throw new Error(`API request failed: ${response.statusText}`);
            }

            // Handle streaming response for album creation
            if (response.headers.get('content-type')?.includes('text/event-stream')) {
              const reader = response.body?.getReader();
              const decoder = new TextDecoder();

              if (reader) {
                let finalResponse: AgentResponse | null = null;

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value);
                  const lines = chunk.split('\n');

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      try {
                        const data = JSON.parse(line.slice(6)) as {
                          type: 'tool-call' | 'final-response' | 'error';
                          data: {
                            tool?: string;
                            server?: string;
                            description?: string;
                            timestamp?: string;
                            text?: string;
                            reasoning?: string;
                            executionSteps?: string[];
                            canvasData?: Record<string, unknown>;
                            generatedCode?: string;
                            componentType?: string;
                            photos?: unknown[];
                          };
                        };
                        
                        if (data.type === 'tool-call' && data.data.tool && data.data.server && data.data.description && data.data.timestamp) {
                          // Add tool call message immediately
                          const toolCallMessage: Message = {
                            id: uuidv4(),
                            role: "tool-call" as const,
                            content: "",
                            timestamp: new Date(data.data.timestamp),
                            metadata: {
                              toolCall: {
                                tool: data.data.tool,
                                server: data.data.server,
                                description: data.data.description
                              }
                            }
                          };
                          
                          setMessages((prev) => [...prev, toolCallMessage]);
                        } else if (data.type === 'final-response') {
                          finalResponse = data.data as AgentResponse;
                        } else if (data.type === 'error') {
                          finalResponse = data.data as AgentResponse;
                        }
                      } catch (e) {
                        console.error('Error parsing SSE data:', e);
                      }
                    }
                  }
                }

                // Process final response
                if (finalResponse) {
                  // Create assistant message from response
                  const assistantMessage: Message = {
                    id: uuidv4(),
                    role: "assistant",
                    content: finalResponse.text,
                    timestamp: new Date(),
                    metadata: {
                      reasoning: finalResponse.reasoning,
                      executionSteps: finalResponse.executionSteps,
                      photos: finalResponse.photos
                    }
                  };

                  setMessages((prev) => [...prev, assistantMessage]);
                }
              }
            }
          } catch (error) {
            console.error("❌ Error processing album creation:", error);
            
            // Show error message
            const errorMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: "I encountered an error while creating the album. Please try again.",
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, errorMessage]);
          } finally {
            setIsLoading(false);
          }
        };

        // Execute the async handler
        handleAlbumCreation().catch(console.error);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [messages]); // Include messages in dependency array to get current state

  const handleNewChat = () => {
    setMessages([]);
    setIsCanvasOpen(false);
    setCanvasContent(null);
    setIsSidebarCollapsed(false);
  };

  const handleSendMessage = async (content: string) => {
    // Create a new user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Add user message to messages
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Auto-collapse sidebar when first message is sent
    if (messages.length === 0 && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }

    try {
      // Use streaming for real-time tool call notifications
      const response = await fetch('/api/process-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          enableToolCallNotifications: true,
          useStreaming: true
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let finalResponse: AgentResponse | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)) as {
                    type: 'tool-call' | 'final-response' | 'error';
                    data: {
                      tool?: string;
                      server?: string;
                      description?: string;
                      timestamp?: string;
                      text?: string;
                      reasoning?: string;
                      executionSteps?: string[];
                      canvasData?: Record<string, unknown>;
                      generatedCode?: string;
                      componentType?: string;
                      photos?: unknown[];
                    };
                  };
                  
                  if (data.type === 'tool-call' && data.data.tool && data.data.server && data.data.description && data.data.timestamp) {
                    // Add tool call message immediately
                    const toolCallMessage: Message = {
                      id: uuidv4(),
                      role: "tool-call" as const,
                      content: "",
                      timestamp: new Date(data.data.timestamp),
                      metadata: {
                        toolCall: {
                          tool: data.data.tool,
                          server: data.data.server,
                          description: data.data.description
                        }
                      }
                    };
                    
                    setMessages((prev) => [...prev, toolCallMessage]);
                  } else if (data.type === 'final-response') {
                    finalResponse = data.data as AgentResponse;
                  } else if (data.type === 'error') {
                    finalResponse = data.data as AgentResponse;
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }

          // Process final response
          if (finalResponse) {
            await processFinalResponse(finalResponse);
          }
        }
      } else {
        // Fallback to non-streaming response
        const jsonResponse = await response.json() as AgentResponse & { toolCalls?: Array<{ tool: string; server: string; description: string; timestamp: string }> };
        await processFinalResponse(jsonResponse);
      }

    } catch (error) {
      console.error("❌ Error processing message:", error);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process the final response
  const processFinalResponse = async (response: AgentResponse & { toolCalls?: Array<{ tool: string; server: string; description: string; timestamp: string }> }) => {
    // Add tool call messages if they exist (for non-streaming fallback)
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolCallMessages: Message[] = response.toolCalls.map(toolCall => ({
        id: uuidv4(),
        role: "tool-call" as const,
        content: "",
        timestamp: new Date(toolCall.timestamp),
        metadata: {
          toolCall: {
            tool: toolCall.tool,
            server: toolCall.server,
            description: toolCall.description
          }
        }
      }));
      
      setMessages((prev) => [...prev, ...toolCallMessages]);
      
      // Small delay to show tool calls before the final response
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Create assistant message from response
    const assistantMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: response.text,
      timestamp: new Date(),
      metadata: {
        reasoning: response.reasoning,
        executionSteps: response.executionSteps,
        photos: response.photos
      }
    };

    setMessages((prev) => [...prev, assistantMessage]);
    
    // Always open the canvas for all responses
    setIsCanvasOpen(true);
    
    // Simplified canvas content logic - MCP UI always returns React code
    let canvasContent: React.ReactNode | string = response.text;
    
    // Priority 1: Use generated code from MCP if available
    if (response.generatedCode) {
      console.log("🎨 Using MCP generated code for canvas:", response.componentType);
      canvasContent = response.generatedCode;
    }
    // Priority 2: Check for canvas data with generated component type
    else if (response.canvasData?.type === "generated-component") {
      console.log("📊 Using canvas data generated component");
      canvasContent = response.generatedCode ?? response.text;
    }
    // Priority 3: Check if response text contains code (fallback)
    else if (response.text.includes('```') || response.text.includes('function')) {
      console.log("🔍 Detected code in response text, using for canvas");
      canvasContent = response.text;
    }
    // Priority 4: Handle legacy canvas data types (non-MCP)
    else if (response.canvasData) {
      console.log("📊 Using legacy canvas data:", response.canvasData.type);
      
      if (response.canvasData.type === "kaleidoscope") {
        canvasContent = <SampleInteractiveKaleidoscope />;
      } else if (response.canvasData.type === "document") {
        const docData = response.canvasData as CanvasDataDocument;
        canvasContent = (
          <SampleDocumentContent 
            title={docData.content.title} 
            sections={docData.content.sections} 
          />
        );
      } else if (response.canvasData.type === "event") {
        canvasContent = <EventDetailsCanvas />;
      } else {
        canvasContent = response.text;
      }
    }
    
    // Set the canvas content
    setCanvasContent(canvasContent);
    
    console.log("🖼️ Canvas content set:", typeof canvasContent, canvasContent);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        onNewChat={handleNewChat} 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
        activeChat={messages.length > 0}
      />
      
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isCanvasOpen ? "pr-[60%]" : ""
        }`}
      >
        <div className="flex-1 overflow-y-auto pt-12">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <h1 className="text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-5xl font-bold text-transparent">
                Agentic MCP Demo
              </h1>
              <h2 className="mt-6 text-lg text-[var(--gemini-text)]">Ask me to create something fun!</h2>
              
              <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 max-w-3xl">
                {[
                  {
                    title: "Show me my photos",
                    description: "in a fun and goofy way",
                  },
                  {
                    title: "Create a photo gallery",
                    description: "with playful animations",
                  },
                  {
                    title: "Build something cool",
                    description: "and interactive for me",
                  },
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    className="flex flex-col rounded-lg border border-[var(--gemini-border)] p-4 text-left transition-colors hover:bg-[var(--gemini-hover)]"
                    onClick={() => handleSendMessage(`${suggestion.title} ${suggestion.description}`)}
                  >
                    <span className="text-sm text-gray-400">{suggestion.title}</span>
                    <span className="mt-1 text-[var(--gemini-text)]">{suggestion.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-24">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--gemini-accent)]"></div>
                  <div className="mx-1 h-2 w-2 animate-pulse rounded-full bg-[var(--gemini-accent)] delay-200"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--gemini-accent)] delay-500"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
      
      <Canvas 
        isOpen={isCanvasOpen} 
        onClose={() => setIsCanvasOpen(false)} 
        content={canvasContent}
      />
    </div>
  );
} 