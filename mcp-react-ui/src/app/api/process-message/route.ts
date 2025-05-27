import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator, type AgentResponse, type ToolCallNotification } from '../../_services/AgentOrchestrator';
import type { Message } from '../../_components/ChatMessage';

interface ExtendedAgentResponse extends AgentResponse {
  toolCalls?: ToolCallNotification[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, enableToolCallNotifications, useStreaming }: { 
      messages: Message[]; 
      enableToolCallNotifications?: boolean;
      useStreaming?: boolean;
    } = body;

    // Get API key from environment (available on server side)
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is required");
    }

    // If streaming is enabled, use Server-Sent Events
    if (useStreaming && enableToolCallNotifications) {
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        start(controller) {
          // Tool call callback that sends immediate updates
          const toolCallCallback = (notification: ToolCallNotification) => {
            const data = JSON.stringify({
              type: 'tool-call',
              data: notification
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          };

          // Initialize Agent Orchestrator with streaming callback
          const agentOrchestrator = new AgentOrchestrator(apiKey, toolCallCallback);

          // Process the user request
          agentOrchestrator.processUserRequest(messages)
            .then((response: AgentResponse) => {
              // Send final response
              const finalData = JSON.stringify({
                type: 'final-response',
                data: response
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
              controller.close();
            })
            .catch((error) => {
              console.error("❌ Error in streaming process:", error);
              const errorData = JSON.stringify({
                type: 'error',
                data: {
                  text: "I'm sorry, but I encountered an error processing your request. Please try again.",
                  reasoning: "Error occurred during processing",
                  executionSteps: ["❌ Failed to process request"],
                  canvasData: { type: "error" }
                }
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
              controller.close();
            });
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Fallback to non-streaming mode
    const toolCalls: ToolCallNotification[] = [];
    const toolCallCallback = enableToolCallNotifications 
      ? (notification: ToolCallNotification) => {
          toolCalls.push(notification);
        }
      : undefined;

    // Initialize Agent Orchestrator with callback
    const agentOrchestrator = new AgentOrchestrator(apiKey, toolCallCallback);

    // Process the user request
    const response: AgentResponse = await agentOrchestrator.processUserRequest(messages);

    // Include tool calls in the response
    const extendedResponse: ExtendedAgentResponse = {
      ...response,
      toolCalls: enableToolCallNotifications ? toolCalls : undefined
    };

    return NextResponse.json(extendedResponse);

  } catch (error) {
    console.error("❌ Error in process-message API route:", error);
    
    // Return a fallback response
    const fallbackResponse: ExtendedAgentResponse = {
      text: "I'm sorry, but I encountered an error processing your request. Please try again.",
      reasoning: "Error occurred during processing",
      executionSteps: ["❌ Failed to process request"],
      canvasData: { type: "error" }
    };

    return NextResponse.json(fallbackResponse, { status: 500 });
  }
} 