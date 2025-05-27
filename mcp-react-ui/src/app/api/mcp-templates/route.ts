import { NextRequest, NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListUITemplatesResultSchema } from "@modelcontextprotocol/sdk/types.js";
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
      name: "mcp-templates-client",
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

    // Get available UI templates
    const result = await client.request(
      { method: "ui/templates/list" },
      ListUITemplatesResultSchema
    );

    return NextResponse.json({ templates: result.templates });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error getting UI templates:", errorMessage);
    
    return NextResponse.json(
      { error: "Failed to get UI templates", templates: [] },
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