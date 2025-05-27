#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { 
  ListToolsResultSchema,
  CallToolResultSchema
} from "@modelcontextprotocol/sdk/types.js";
import path from "path";

/**
 * Simple client to test the MCP UI Server with Gemini AI
 */

async function main() {
  console.log("🚀 Starting Simple MCP UI Client Test");
  console.log("📅 Timestamp:", new Date().toISOString());
  
  // Create client with stdio transport that spawns the server
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.join(process.cwd(), "dist", "index.js")],
    stderr: "inherit"
  });

  const client = new Client({
    name: "simple-mcp-client",
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

  try {
    // Connect to the server
    console.log("🔧 Connecting to MCP UI Server...");
    await client.connect(transport);
    console.log("✅ Connected to MCP UI Server");

    // List available tools
    console.log("🛠️  Listing available tools...");
    const toolsResult = await client.request(
      { method: "tools/list" },
      ListToolsResultSchema
    );
    console.log(`✅ Received ${toolsResult.tools.length} tools from server`);
    
    for (const tool of toolsResult.tools) {
      console.log(`   - ${tool.name}: ${tool.description}`);
    }

    // Test: Generate a simple UI component
    console.log("\n📊 Testing UI component generation...");
    const componentResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "generate_ui_component",
          arguments: {
            description: "a simple button with hover effects",
            type: "button",
            theme: "light"
          }
        }
      },
      CallToolResultSchema
    );

    console.log("🎨 Component generation result:");
    if (Array.isArray(componentResult.content)) {
      for (const content of componentResult.content) {
        if (content.type === "text") {
          console.log(`   ${content.text}`);
        } else if (content.type === "ui") {
          console.log(`   UI Component Type: ${content.component.type}`);
          console.log(`   Generated Code Length: ${content.component.props?.generatedCode?.length || 0} characters`);
        }
      }
    }

    console.log("\n🎉 Simple test completed successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    // Clean up
    await client.close();
    console.log("🛑 Client disconnected");
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\n🛑 Shutting down client...");
  process.exit(0);
});

// Start the client
main().catch((error) => {
  console.error("❌ Failed to start client:", error);
  process.exit(1);
}); 