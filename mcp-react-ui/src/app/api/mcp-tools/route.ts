import { NextRequest, NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import path from "path";

export async function GET(req: NextRequest) {
  let client: Client | null = null;
  let transport: StdioClientTransport | null = null;

  try {
    // Create MCP client transport
    const mcpServerPath = path.resolve(process.cwd(), "../mcp-server/dist/index.js");
    transport = new StdioClientTransport({
      command: "node",
      args: [mcpServerPath],
      stderr: "inherit"
    });

    client = new Client({
      name: "mcp-tools-client",
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

    // Get available tools
    const result = await client.request(
      { method: "tools/list" },
      ListToolsResultSchema
    );

    return NextResponse.json({ tools: result.tools });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error getting MCP tools:", errorMessage);
    
    return NextResponse.json(
      { error: "Failed to get MCP tools", tools: [] },
      { status: 500 }
    );
  } finally {
    // Clean up MCP client connection
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error("Error closing MCP client:", error);
      }
    }
  }
} 