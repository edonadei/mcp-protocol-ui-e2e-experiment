"use client";

import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeRenderer } from "./CodeRenderer";
import { SafeReactRenderer } from "./ReactRenderer";

type CanvasProps = {
  isOpen: boolean;
  onClose: () => void;
  content?: React.ReactNode | string;
};

export function Canvas({ isOpen, onClose, content }: CanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeContent, setCodeContent] = useState<string>("");
  const [isReactComponent, setIsReactComponent] = useState(false);
  
  // Refs to store rendered content
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<React.ReactNode | string | null>(null);
  const previewContentRef = useRef<React.ReactNode | null>(null);

  // Function to detect if content is React/JSX code
  const detectReactCode = (content: string): boolean => {
    const hasJsxElements = /(<\w+[^>]*>|<\/\w+>)/.test(content);
    const hasReactFunctions = /function\s+\w+\s*\([^)]*\)\s*{\s*.*return\s*\(/.test(content);
    const hasReactHooks = /use(State|Effect|Ref|Context|Callback|Memo|Reducer)\(/.test(content);
    const hasReactKeywords = /React\.(useState|useEffect|createElement)/.test(content);
    
    return hasJsxElements || hasReactFunctions || hasReactHooks || hasReactKeywords;
  };

  // Function to extract code from various formats
  const extractCode = (content: string): string => {
    // Try to extract from markdown code blocks first
    const codeBlockRegex = /```(?:jsx?|tsx?|react|javascript)?\n([\s\S]*?)```/;
    const codeBlockMatch = codeBlockRegex.exec(content);
    
    if (codeBlockMatch?.[1]) {
      return codeBlockMatch[1].trim();
    }
    
    // If no code blocks, check if the entire content looks like code
    if (detectReactCode(content)) {
      return content.trim();
    }
    
    // Return original content if no code detected
    return content;
  };

  // Initialize component after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set content ref when it changes
  useEffect(() => {
    if (content) {
      console.log("Canvas received content:", typeof content, content);
      contentRef.current = content;
      
      // Reset to preview mode on new content
      setIsCodeView(false);
      
      // Extract code if it's a string
      if (typeof content === 'string') {
        // Since MCP UI always returns React code, extract and prepare it for rendering
        const extractedCode = extractCode(content);
        setCodeContent(extractedCode);
        
        // Always treat as React component since MCP UI always returns React code
        setIsReactComponent(true);
        
        console.log("🎨 Extracted React code for rendering:", extractedCode);
      } else {
        // If it's already a React component, use it directly
        previewContentRef.current = content;
        setIsReactComponent(false);
        setCodeContent("// Pre-rendered React component");
      }
    }
  }, [content]);

  if (!mounted) return null;

  return (
    <div
      className={`canvas-container fixed right-0 top-0 h-full w-[60%] transform transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[var(--gemini-border)] p-4 pt-12">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">🎭 Demo Generated UI</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className={`rounded-lg px-3 py-1 text-sm ${
                isCodeView ? 'bg-[var(--gemini-accent)] text-black' : 'border border-[var(--gemini-border)] hover:bg-[var(--gemini-hover)]'
              }`}
              onClick={() => setIsCodeView(true)}
            >
              Code
            </button>
            <button 
              className={`rounded-lg px-3 py-1 text-sm ${
                !isCodeView ? 'bg-[var(--gemini-accent)] text-black' : 'border border-[var(--gemini-border)] hover:bg-[var(--gemini-hover)]'
              }`}
              onClick={() => setIsCodeView(false)}
            >
              Preview
            </button>
            <button
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 hover:bg-[var(--gemini-hover)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#f8fafd] p-8 dark:bg-[#1e2022]">
          {isCodeView ? (
            // Code view
            <SyntaxHighlighter
              language="jsx"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 8, height: '100%' }}
              showLineNumbers
            >
              {codeContent ?? "// No code available"}
            </SyntaxHighlighter>
          ) : (
            // Preview view
            <div ref={previewRef} className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              {typeof content === 'string' ? (
                // Always use SafeReactRenderer for string content since MCP UI always returns React code
                <SafeReactRenderer code={codeContent} />
              ) : (
                // Use pre-rendered React components directly
                previewContentRef.current ?? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-4"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M8 3v18" />
                      <path d="M16 3v18" />
                      <path d="M3 8h18" />
                      <path d="M3 16h18" />
                    </svg>
                    <p className="text-lg">Canvas Output</p>
                    <p className="mt-2 text-sm">
                      Generated UI will appear here when you ask Gemini to create something visual.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 