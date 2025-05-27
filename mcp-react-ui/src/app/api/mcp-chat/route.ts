import { type NextRequest, NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { 
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import path from "path";

// Define types for the messages
interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface McpResponse {
  text: string;
  generatedCode?: string;
  componentType?: string;
  canvasData?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  let client: Client | null = null;
  let transport: StdioClientTransport | null = null;

  try {
    // Parse request body
    const body = await req.json() as { messages: Message[] };
    const messages = body.messages;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided or invalid messages format" },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    // Create MCP client transport
    const mcpServerPath = path.resolve(process.cwd(), "../mcp-server/dist/index.js");
    transport = new StdioClientTransport({
      command: "node",
      args: [mcpServerPath],
      stderr: "inherit"
    });

    client = new Client({
      name: "mcp-react-ui-server-client",
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

    // Connect to MCP server
    await client.connect(transport);
    console.log("✅ Connected to MCP UI Server from API route");

    // Always use generate_ui_component for all requests
    const result = await client.request(
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
        if (content.type === "text") {
          responseText = content.text;
        } else if (content.type === "ui") {
          const component = content.component as { props?: { generatedCode?: string } };
          generatedCode = component.props?.generatedCode ?? "";
        }
      }
    }

    const response: McpResponse = {
      text: generatedCode || responseText || "Generated UI component successfully",
      generatedCode: generatedCode,
      componentType: "custom",
      canvasData: { type: "generated-component" }
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error calling MCP server:", errorMessage);
    
    return NextResponse.json({
      text: "I'm sorry, but I encountered an error generating the UI component. Please try again.",
      canvasData: { type: "error" }
    } as McpResponse);
  } finally {
    // Clean up MCP client connection
    if (client) {
      try {
        await client.close();
        console.log("🛑 Disconnected from MCP server");
      } catch (error) {
        console.error("Error closing MCP client:", error);
      }
    }
  }
} 