"use client";

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type MessageRole = "user" | "assistant" | "tool-call";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: Date;
  metadata?: {
    reasoning?: string;
    executionSteps?: string[];
    photos?: any[];
    toolCall?: {
      tool: string;
      server: string;
      description: string;
    };
  };
};

type ChatMessageProps = {
  message: Message;
};

// Component for tool call notifications
function ToolCallMessage({ message }: { message: Message }) {
  const toolCall = message.metadata?.toolCall;
  if (!toolCall) return null;

  return (
    <div className="flex gap-4 p-2 opacity-75">
      <div className="mt-1 flex-shrink-0 text-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-400">
          🔧 <span className="text-yellow-400">{toolCall.tool}</span> tool called on <span className="text-blue-400">{toolCall.server}</span> server
        </div>
      </div>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  // Handle tool call messages
  if (message.role === "tool-call") {
    return <ToolCallMessage message={message} />;
  }

  const isUser = message.role === "user";

  // Function to detect if the content is JSX/TSX code
  const isJsxContent = (content: string) => {
    // Check for JSX patterns like component tags, imports, or export statements
    return (
      content.includes('import') || 
      content.includes('export') || 
      content.includes('function') || 
      content.includes('const') ||
      (content.includes('<') && content.includes('/>'))
    );
  };

  // Process assistant message content
  const processAssistantContent = (content: string) => {
    if (isJsxContent(content)) {
      // If it looks like JSX/TSX code, wrap it in a code block for proper highlighting
      if (!content.startsWith('```')) {
        return '```jsx\n' + content + '\n```';
      }
    }
    return content;
  };

  return (
    <div className={`flex gap-4 p-4 ${isUser ? "" : ""}`}>
      {!isUser && (
        <div className="mt-1 flex-shrink-0 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className={`w-full ${isUser ? "text-white" : "text-white"}`}>
          {isUser ? (
            <div className="bg-[var(--gemini-card)] rounded-lg px-4 py-3 inline-block">
              {message.content}
            </div>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !className;
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ 
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem'
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                a({ node, children, href, ...props }: any) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-semibold"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }
              }}
            >
              {isUser ? message.content : processAssistantContent(message.content)}
            </ReactMarkdown>
          )}
        </div>
        
        {!isUser && (
          <div className="flex mt-2 space-x-2">
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 