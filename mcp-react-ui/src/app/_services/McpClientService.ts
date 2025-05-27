import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { 
  CallToolResultSchema,
  ListToolsResultSchema
} from "@modelcontextprotocol/sdk/types.js";
import type { Message } from "../_components/ChatMessage";

export interface McpResponse {
  text: string;
  generatedCode?: string;
  componentType?: string;
  canvasData?: Record<string, unknown>;
}

export class McpClientService {
  private static client: Client | null = null;
  private static transport: StdioClientTransport | null = null;
  private static isConnected = false;

  // Initialize the MCP client connection
  private static async initializeClient(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      // Create transport that connects to our MCP server
      this.transport = new StdioClientTransport({
        command: "node",
        args: ["../mcp-server/dist/index.js"],
        stderr: "inherit"
      });

      this.client = new Client({
        name: "mcp-react-ui-client",
        version: "1.0.0"
      }, {
        capabilities: {
          ui: {
            templates: true,
            rendering: true,
            validation: true
          }
        }
      });

      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log("✅ Connected to MCP UI Server");
    } catch (error) {
      console.error("❌ Failed to connect to MCP server:", error);
      throw error;
    }
  }

  // Process messages and generate UI components using MCP
  static async processMessage(messages: Message[]): Promise<McpResponse> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        throw new Error("MCP client not initialized");
      }

      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        throw new Error("No user message found");
      }

      // Always use generate_ui_component for all requests
      const result = await this.client.request(
        {
          method: "tools/call",
          params: {
            name: "generate_ui_component",
            arguments: {
              description: lastMessage.content,
              type: "custom",
              theme: "light"
            }
          }
        },
        CallToolResultSchema
      );

      // Extract the generated code from the response
      let generatedCode = "";
      let responseText = "";
      
      if (Array.isArray(result.content)) {
        for (const content of result.content) {
          if (content.type === "text" && typeof content.text === "string") {
            responseText = content.text;
          } else if (content.type === "ui" && content.component && typeof content.component === "object") {
            const component = content.component as { props?: { generatedCode?: string } };
            generatedCode = component.props?.generatedCode ?? "";
          }
        }
      }

      return {
        text: responseText || "Generated UI component successfully",
        generatedCode: generatedCode,
        componentType: "custom",
        canvasData: { type: "generated-component" }
      };

    } catch (error) {
      console.error("❌ Error processing message with MCP:", error);
      
      // Fallback to a simple error response
      return {
        text: "I'm sorry, but I encountered an error generating the UI component. Please try again.",
        canvasData: { type: "error" }
      };
    }
  }

  // List available tools from the MCP server
  static async listTools(): Promise<unknown[]> {
    try {
      await this.initializeClient();
      
      if (!this.client) {
        throw new Error("MCP client not initialized");
      }

      const result = await this.client.request(
        { method: "tools/list" },
        ListToolsResultSchema
      );

      return result.tools;
    } catch (error) {
      console.error("❌ Error listing MCP tools:", error);
      return [];
    }
  }
} 