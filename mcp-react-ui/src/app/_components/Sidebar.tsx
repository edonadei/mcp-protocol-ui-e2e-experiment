"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type SidebarProps = {
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeChat: boolean;
};

export function Sidebar({ onNewChat, isCollapsed, onToggleCollapse, activeChat }: SidebarProps) {
  const [recentChats] = useState([
    { id: "1", title: "A Simple Greeting Exchange" },
    { id: "2", title: "Hey Gemini! Give me some ..." },
    { id: "3", title: "React App Simulates LLM B..." },
    { id: "4", title: "Guggenheim Museums: Arc..." },
    { id: "5", title: "SQLAlchemy Result Type H..." },
  ]);

  return (
    <>
      {/* Always visible hamburger menu */}
      <div className="fixed top-0 left-0 z-20 h-12 flex items-center">
        <button
          onClick={onToggleCollapse}
          className="flex h-12 w-12 items-center justify-center hover:bg-[rgba(255,255,255,0.1)]"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      
      <div 
        className={`flex h-screen flex-col bg-[var(--gemini-sidebar)] border-r border-[var(--gemini-border)] transition-all duration-300 overflow-hidden ${
          isCollapsed ? "w-14" : "w-64"
        }`}
      >
        {isCollapsed ? (
          // Collapsed sidebar with icons only
          <div className="flex flex-col items-center pt-16 h-full">
            <button 
              onClick={onNewChat}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--gemini-hover)] my-2"
              aria-label="New chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            
            <div className="mt-auto mb-6">
              <Link 
                href="/settings"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--gemini-hover)] my-2"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          // Expanded sidebar with full content
          <>
            <div className="p-4 flex justify-between items-center mt-8">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">Gemini</span>
              </div>
            </div>
            
            <div className="px-4">
              <button 
                onClick={onNewChat}
                className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-[var(--gemini-hover)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>New chat</span>
              </button>
            </div>
            
            <div className="mt-6">
              <div className="px-4 py-2 text-xs text-gray-400 uppercase">Recent</div>
              <div className="mt-1">
                {recentChats.map((chat) => (
                  <Link 
                    key={chat.id}
                    href="#" 
                    className="flex items-center px-4 py-2 text-sm hover:bg-[var(--gemini-hover)] transition-colors"
                  >
                    {chat.title}
                  </Link>
                ))}
              </div>
              <button className="flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[var(--gemini-hover)] transition-colors">
                <span>Show more</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            </div>
            
            <div className="mt-auto mb-4">
              <Link 
                href="/settings"
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-[var(--gemini-hover)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Settings & help</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
} 