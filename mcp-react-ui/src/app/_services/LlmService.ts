"use client";

import type { Message } from "../_components/ChatMessage";

export interface LlmResponse {
  text: string;
  generatedCode?: string;
  componentType?: string;
  canvasData?: Record<string, any>;
}

export class LlmService {
  static async processMessage(messages: Message[]): Promise<LlmResponse> {
    console.log("Processing messages with MCP:", messages);
    
    try {
      // Call our new MCP API route instead of the old Gemini route
      const response = await fetch('/api/mcp-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error(`MCP API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Received response from MCP server:", data);
      
      return data;
    } catch (error) {
      console.error("❌ Error calling MCP API:", error);
      return {
        text: "I'm sorry, but I encountered an error processing your request. Please try again.",
        canvasData: { type: "error" }
      };
    }
  }
}

// Enhanced MCP service for additional functionality
export class McpService {
  static async renderCanvas(canvasData: Record<string, any>): Promise<React.ReactNode> {
    console.log("Rendering canvas with MCP:", canvasData);
    
    // This could be extended to handle different types of canvas data
    // For now, we'll let the Canvas component handle the rendering
    return null;
  }

  // Get available MCP tools
  static async getAvailableTools(): Promise<any[]> {
    try {
      const response = await fetch('/api/mcp-tools', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get MCP tools: ${response.status}`);
      }
      
      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error("❌ Error getting MCP tools:", error);
      return [];
    }
  }

  // Get available UI templates
  static async getUITemplates(): Promise<any[]> {
    try {
      const response = await fetch('/api/mcp-templates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get UI templates: ${response.status}`);
      }
      
      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error("❌ Error getting UI templates:", error);
      return [];
    }
  }
} 