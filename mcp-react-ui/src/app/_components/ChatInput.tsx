"use client";

import { useState, type FormEvent } from "react";

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
};

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <>
      <div className="border-t border-[var(--gemini-border)] p-4 w-full bg-[var(--gemini-background)]">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
          <div className="relative flex items-center rounded-full border border-[var(--gemini-border)] bg-[var(--gemini-card)] px-4 py-2">
            <button
              type="button"
              className="mr-2 text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Gemini"
              rows={1}
              className="flex-1 resize-none border-none bg-transparent px-0 py-1 text-[var(--gemini-text)] focus:outline-none focus:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="flex space-x-2 ml-2">
              <button 
                type="button"
                className="text-gray-400 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
              
              <button 
                type="button"
                className="text-gray-400 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="text-gray-400 p-1 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9 22 2z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="text-center py-2 text-xs text-gray-500 bg-[var(--gemini-background)] border-t border-[var(--gemini-border)]">
        Gemini can make mistakes, so double-check its responses.
      </div>
    </>
  );
} 