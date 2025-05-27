"use client";

import { useState, useEffect } from "react";

export function ApiKeyWarning() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function checkApiKey() {
      try {
        const response = await fetch('/api/check-api-key');
        const data = await response.json();
        
        // Debug: Log environment variables
        console.log("Environment check:", {
          hasKey: data.hasKey,
          keyPrefix: data.keyPrefix,
          NODE_ENV: process.env.NODE_ENV,
        });

        setIsVisible(!data.hasKey);
      } catch (error) {
        console.error("Error checking API key:", error);
        setIsVisible(true);
      }
    }

    checkApiKey();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black p-2 z-50 flex items-center justify-between">
      <div>
        <span className="font-bold">API Key Missing:</span> Please check that GOOGLE_API_KEY is properly set in your .env.local file and restart the development server.
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="rounded-full bg-black text-white p-1"
        aria-label="Close warning"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
} 