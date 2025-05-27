#!/usr/bin/env node

/**
 * Simple test to verify the MCP UI Server starts correctly
 */

console.log("🧪 Testing MCP UI Server startup...");

// Import and start the server
import("./index.js").then(() => {
  console.log("✅ Server imported successfully");
}).catch((error) => {
  console.error("❌ Failed to import server:", error);
  process.exit(1);
}); 