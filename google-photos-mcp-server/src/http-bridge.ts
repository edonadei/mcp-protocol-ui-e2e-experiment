import express from 'express';
import cors from 'cors';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { spawn } from 'child_process';
import path from 'path';
import type { CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let mcpClient: Client | null = null;
let mcpTransport: StdioClientTransport | null = null;

async function initializeMcpClient() {
  if (mcpClient) {
    return mcpClient;
  }

  try {
    const serverPath = path.join(process.cwd(), 'dist', 'index.js');
    
    mcpTransport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      stderr: 'inherit'
    });

    mcpClient = new Client(
      {
        name: "google-photos-http-bridge",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await mcpClient.connect(mcpTransport);
    console.log('MCP client connected successfully');
    return mcpClient;
  } catch (error) {
    console.error('Failed to initialize MCP client:', error);
    throw error;
  }
}

function extractTextFromResult(result: any): string {
  if (result && result.content && Array.isArray(result.content)) {
    const textContent = result.content.find((item: any) => item.type === 'text');
    return textContent?.text || '';
  }
  return '';
}

function parseResultSafely(resultText: string): any {
  try {
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Failed to parse result as JSON:', resultText);
    // If it's not JSON, return an error object
    return {
      error: 'Invalid response format',
      details: resultText,
      success: false
    };
  }
}

// Generic tool call endpoint
app.post('/call-tool', async (req, res) => {
  try {
    const { toolName, arguments: toolArgs } = req.body;
    
    console.log('🔧 [HTTP_BRIDGE] Received tool call:', toolName);
    console.log('📋 [HTTP_BRIDGE] Tool arguments:', JSON.stringify(toolArgs, null, 2));
    
    if (!toolName) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const client = await initializeMcpClient();
    console.log('🔗 [HTTP_BRIDGE] Connected to MCP client, calling tool...');
    
    const result = await client.callTool({
      name: toolName,
      arguments: toolArgs || {}
    });

    console.log('📥 [HTTP_BRIDGE] Received result from MCP server');
    
    // Parse the response safely
    const resultText = extractTextFromResult(result);
    console.log('📄 [HTTP_BRIDGE] Raw result text length:', resultText.length);
    console.log('📄 [HTTP_BRIDGE] Raw result preview:', resultText.substring(0, 200) + '...');
    
    const responseData = parseResultSafely(resultText);

    // Check if the parsed result indicates an error
    if (responseData.error && !responseData.success) {
      console.error('❌ [HTTP_BRIDGE] Tool call failed:', responseData.error);
      return res.status(500).json({ 
        success: false, 
        error: responseData.error,
        details: responseData.details || responseData.error
      });
    }

    console.log('✅ [HTTP_BRIDGE] Tool call successful');
    if (responseData.photos) {
      console.log('📸 [HTTP_BRIDGE] Photos in response:', responseData.photos.length);
    }
    if (responseData.count !== undefined) {
      console.log('📊 [HTTP_BRIDGE] Item count:', responseData.count);
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('❌ [HTTP_BRIDGE] Error calling tool:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to call tool', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Specific endpoints for common operations
app.get('/auth-status', async (req, res) => {
  try {
    const client = await initializeMcpClient();
    const result = await client.callTool({
      name: 'get_auth_status',
      arguments: {}
    });

    const resultText = extractTextFromResult(result);
    const authStatus = parseResultSafely(resultText);
    
    // Always return auth status, even if there's an error
    if (authStatus.error) {
      return res.json({ isAuthenticated: false, error: authStatus.error });
    }
    
    res.json(authStatus);
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({ 
      isAuthenticated: false,
      error: 'Failed to check authentication status',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/auth-url', async (req, res) => {
  try {
    const client = await initializeMcpClient();
    const result = await client.callTool({
      name: 'get_auth_url',
      arguments: {}
    });

    const resultText = extractTextFromResult(result);
    const authUrl = parseResultSafely(resultText);
    
    if (authUrl.error) {
      return res.status(500).json({ 
        error: authUrl.error,
        details: authUrl.details || authUrl.error
      });
    }
    
    res.json(authUrl);
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ 
      error: 'Failed to get authentication URL',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/exchange-code', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const client = await initializeMcpClient();
    const result = await client.callTool({
      name: 'exchange_auth_code',
      arguments: { code }
    });

    const resultText = extractTextFromResult(result);
    console.log('Raw result from MCP server:', resultText); // Debug logging
    const tokens = parseResultSafely(resultText);
    
    if (tokens.error) {
      return res.status(500).json({ 
        error: tokens.error,
        details: tokens.details || tokens.error
      });
    }
    
    res.json(tokens);
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ 
      error: 'Failed to exchange authorization code',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/revoke', async (req, res) => {
  try {
    const client = await initializeMcpClient();
    const result = await client.callTool({
      name: 'revoke_auth',
      arguments: {}
    });

    const resultText = extractTextFromResult(result);
    const response = parseResultSafely(resultText);
    
    if (response.error) {
      return res.status(500).json({ 
        error: response.error,
        details: response.details || response.error
      });
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error revoking auth:', error);
    res.status(500).json({ 
      error: 'Failed to revoke authentication',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down HTTP bridge...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Google Photos MCP HTTP Bridge running on port ${PORT}`);
}); 