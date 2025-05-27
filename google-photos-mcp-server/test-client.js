#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testGooglePhotosServer() {
  console.log("🧪 Testing Google Photos MCP Server...");

  try {
    // Create transport to connect to our server
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      stderr: "inherit"
    });

    // Create client
    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });

    // Connect to server
    await client.connect(transport);
    console.log("✅ Connected to Google Photos MCP Server");

    // Test 1: List available tools
    console.log("\n📋 Testing tools list...");
    const toolsResult = await client.request({
      method: "tools/list"
    });
    console.log("Available tools:", toolsResult.tools.map(t => t.name));

    // Test 2: Search for Seattle photos
    console.log("\n🔍 Testing photo search for 'Seattle'...");
    const searchResult = await client.request({
      method: "tools/call",
      params: {
        name: "search_photos",
        arguments: {
          query: "Seattle",
          limit: 5
        }
      }
    });
    console.log("Search result:", searchResult.content[0].text);

    // Test 3: Get trip photos
    console.log("\n🏔️ Testing trip photos for Seattle...");
    const tripResult = await client.request({
      method: "tools/call",
      params: {
        name: "get_trip_photos",
        arguments: {
          location: "Seattle"
        }
      }
    });
    console.log("Trip photos result:", tripResult.content[0].text);

    // Test 4: Get recent photos
    console.log("\n📸 Testing recent photos...");
    const recentResult = await client.request({
      method: "tools/call",
      params: {
        name: "get_recent_photos",
        arguments: {
          limit: 3
        }
      }
    });
    console.log("Recent photos result:", recentResult.content[0].text);

    // Disconnect
    await client.close();
    console.log("\n✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testGooglePhotosServer(); 