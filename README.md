# MCP Protocol UI - Agentic Multi-Server Orchestration

A comprehensive React application that demonstrates agentic workflows using the Model Context Protocol (MCP) to orchestrate multiple servers for complex tasks like photo retrieval and dashboard generation.

## 🏗️ Architecture

This project showcases an **agentic workflow** that can intelligently coordinate multiple MCP servers:

- **Reasoning Agent**: Uses Gemini 2.5 Flash to analyze user requests and create execution plans
- **Agent Orchestrator**: Executes plans by coordinating between multiple MCP servers
- **UI Generator MCP Server**: Generates React components using Gemini AI
- **Google Photos MCP Server**: Integrates with Google Photos API for photo retrieval
- **React Frontend**: Modern Next.js application with real-time streaming and tool call notifications

## 📁 Project Structure

```
mcp-protocol-ui/
├── mcp-react-ui/              # Main React/Next.js application
├── mcp-server/                # UI Generator MCP server
├── google-photos-mcp-server/  # Google Photos integration MCP server
├── typescript-sdk/            # MCP TypeScript SDK
├── modelcontextprotocol/      # MCP protocol documentation and schemas
├── ui-dashboard-example/      # Example MCP server implementation
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Google Cloud Project with Photos Library API enabled
- Google API credentials (OAuth 2.0)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd mcp-protocol-ui
```

### 2. Setup Google Photos Integration

1. **Enable Google Photos Library API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the "Photos Library API" for your project
   - Create OAuth 2.0 credentials (Desktop application type)

2. **Add Credentials**:
   ```bash
   # Copy your OAuth credentials file to the google-photos-mcp-server directory
   cp path/to/your/client_secret_*.json google-photos-mcp-server/
   ```

### 3. Setup Environment Variables

```bash
# In mcp-react-ui directory
cd mcp-react-ui
cp .env.example .env
# Edit .env and add your Google API key:
# GOOGLE_API_KEY=your_gemini_api_key_here
```

### 4. Install Dependencies and Build

```bash
# Install and build TypeScript SDK
cd typescript-sdk
npm install
npm run build

# Install and build MCP Server
cd ../mcp-server
npm install
npm run build

# Install and build Google Photos MCP Server
cd ../google-photos-mcp-server
npm install
npm run build

# Install React app dependencies
cd ../mcp-react-ui
npm install
```

### 5. Start the Application

```bash
# Terminal 1: Start Google Photos HTTP Bridge
cd google-photos-mcp-server
npm run bridge

# Terminal 2: Start React Application
cd mcp-react-ui
npm run dev
```

### 6. Configure Google Photos Authentication

1. Open http://localhost:3000
2. Go to Settings (gear icon in sidebar)
3. Click "Connect Google Photos"
4. Complete OAuth flow
5. Return to main chat interface

## 🎯 Usage Examples

Once set up, you can ask the agentic system to:

- **"Show me photos from my last trip to Seattle"** - Retrieves photos and creates a dashboard
- **"Create a dashboard with my recent photos"** - Gets recent photos and generates UI
- **"Remind me about my vacation memories"** - Searches photos and creates a memory timeline

The system will:
1. 🧠 **Reason** about your request using Gemini 2.5 Flash
2. 🔧 **Execute** tool calls to retrieve photos from Google Photos
3. 🎨 **Generate** a beautiful React dashboard with your photos
4. 📱 **Stream** real-time updates showing each step

## 🛠️ Development

### Key Components

- **`mcp-react-ui/src/services/AgentOrchestrator.ts`** - Main orchestration logic
- **`mcp-react-ui/src/services/ReasoningAgent.ts`** - AI reasoning and planning
- **`google-photos-mcp-server/src/index.ts`** - Google Photos MCP server
- **`mcp-server/src/index.ts`** - UI generation MCP server

### Adding New MCP Servers

1. Create a new directory for your server
2. Implement MCP server using the TypeScript SDK
3. Add server configuration to `AgentOrchestrator.ts`
4. Update reasoning prompts to include new capabilities

### API Routes

- **`/api/process-message`** - Main message processing with streaming
- **`/api/google-photos/*`** - Google Photos authentication and operations

## 🔧 Troubleshooting

### Common Issues

1. **"Photos Library API not enabled"**
   - Enable the API in Google Cloud Console
   - Wait a few minutes for propagation

2. **"Module not found" errors**
   - Run `npm run build` in typescript-sdk first
   - Ensure all dependencies are installed

3. **Authentication failures**
   - Check OAuth credentials file location
   - Verify redirect URIs in Google Cloud Console

4. **HTTP Bridge connection errors**
   - Ensure bridge is running on port 3001
   - Check for port conflicts

### Debug Logging

The application includes comprehensive logging:
- **Agent Orchestrator**: Execution flow and photo processing
- **Google Photos MCP**: API calls and authentication
- **HTTP Bridge**: Tool calls and responses

## 📚 Learn More

- [Model Context Protocol Documentation](./modelcontextprotocol/docs/)
- [MCP TypeScript SDK](./typescript-sdk/)
- [Google Photos Library API](https://developers.google.com/photos/library/guides/overview)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the individual component licenses for details.

## 🙏 Acknowledgments

- Model Context Protocol team for the excellent SDK
- Google Photos API for photo integration capabilities
- Gemini AI for reasoning and UI generation
- Next.js team for the fantastic React framework
