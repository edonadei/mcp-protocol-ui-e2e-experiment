import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { 
  CallToolResultSchema,
  ListToolsResultSchema
} from "@modelcontextprotocol/sdk/types.js";

let client: Client | null = null;
let transport: StdioClientTransport | null = null;
let isConnected = false;

// Initialize the MCP client connection
async function initializeClient(): Promise<void> {
  if (isConnected && client) {
    return;
  }

  try {
    // Create transport that connects to our MCP server
    transport = new StdioClientTransport({
      command: "node",
      args: ["../mcp-server/dist/index.js"],
      stderr: "inherit"
    });

    client = new Client({
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

    await client.connect(transport);
    isConnected = true;
    console.log("✅ Connected to MCP UI Server");
  } catch (error) {
    console.error("❌ Failed to connect to MCP server:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    await initializeClient();
    
    if (!client) {
      throw new Error("MCP client not initialized");
    }

    let result;

    switch (action) {
      case 'call_tool':
        result = await client.request(
          {
            method: "tools/call",
            params: params
          },
          CallToolResultSchema
        );
        break;

      case 'list_tools':
        result = await client.request(
          { method: "tools/list" },
          ListToolsResultSchema
        );
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error("❌ Error in MCP API route:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await initializeClient();
    
    if (!client) {
      throw new Error("MCP client not initialized");
    }

    const result = await client.request(
      { method: "tools/list" },
      ListToolsResultSchema
    );

    return NextResponse.json({ success: true, tools: result.tools });

  } catch (error) {
    console.error("❌ Error listing MCP tools:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 