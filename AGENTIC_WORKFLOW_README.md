# Agentic MCP Workflow

This project demonstrates an agentic workflow that orchestrates multiple MCP (Model Context Protocol) servers to handle complex user requests. The system uses AI reasoning to determine which servers to call and in what sequence.

## Architecture Overview

```
User Request → Reasoning Agent → Agent Orchestrator → Multiple MCP Servers → UI Generation
```

### Components

1. **Reasoning Agent** (`ReasoningAgent.ts`)
   - Analyzes user requests using Gemini AI
   - Creates execution plans with step-by-step actions
   - Determines which MCP servers to use and in what order

2. **Agent Orchestrator** (`AgentOrchestrator.ts`)
   - Executes the plans created by the Reasoning Agent
   - Coordinates calls between different MCP servers
   - Combines results and generates final responses

3. **MCP Servers**
   - **UI Generator Server** (`mcp-server/`): Generates React UI components using AI
   - **Google Photos Server** (`google-photos-mcp-server/`): Retrieves and manages photos

4. **React App** (`mcp-react-ui/`)
   - Updated to use the agentic workflow
   - Displays reasoning steps and execution results
   - Renders generated UI components

## Use Case Example

**User Request**: "Can you remind me my last trip in Seattle"

**Agentic Workflow**:
1. **Reasoning Agent** analyzes the request and creates a plan:
   - Step 1: Use Google Photos server to find Seattle trip photos
   - Step 2: Download the photos for local access
   - Step 3: Use UI Generator server to create a trip memory dashboard

2. **Agent Orchestrator** executes the plan:
   - Calls Google Photos server → Gets 5 Seattle photos
   - Downloads photos → Updates URLs for local access
   - Calls UI Generator server → Creates interactive photo dashboard

3. **Result**: User sees a beautiful dashboard with their Seattle trip photos

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm 8+
- Google API Key from AI Studio

### 1. Environment Setup

Make sure you have `GOOGLE_API_KEY` set in your environment files:

```bash
# In mcp-react-ui/.env.local
GOOGLE_API_KEY=your_google_api_key_here

# In mcp-server/.env
GOOGLE_API_KEY=your_google_api_key_here

# In google-photos-mcp-server/.env
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. Install Dependencies

```bash
# Install React app dependencies
cd mcp-react-ui
npm install

# Install UI Generator MCP server dependencies
cd ../mcp-server
npm install

# Install Google Photos MCP server dependencies
cd ../google-photos-mcp-server
npm install
```

### 3. Build MCP Servers

```bash
# Build UI Generator server
cd mcp-server
npm run build

# Build Google Photos server
cd ../google-photos-mcp-server
npm run build
```

### 4. Start the Application

```bash
# Start the React app (this will automatically connect to MCP servers)
cd mcp-react-ui
npm run dev
```

The app will be available at `http://localhost:3000`

## How It Works

### Reasoning Agent

The Reasoning Agent uses Gemini AI to analyze user requests and create execution plans. It understands:

- **Available MCP Servers**: UI Generator and Google Photos
- **Server Capabilities**: What each server can do
- **Optimal Sequences**: How to chain operations for best results

Example plan for "Show me photos from my last trip to Seattle":

```json
{
  "reasoning": "User wants to see Seattle trip photos. I need to first retrieve photos from Google Photos, then create a UI to display them.",
  "actions": [
    {
      "type": "mcp_call",
      "server": "google-photos",
      "tool": "get_trip_photos",
      "arguments": { "location": "Seattle" },
      "description": "Retrieve photos from Seattle trip"
    },
    {
      "type": "ui_generation",
      "server": "ui-generator",
      "tool": "create_dashboard",
      "arguments": { "description": "Create photo gallery dashboard" },
      "description": "Generate interactive photo dashboard"
    }
  ],
  "expectedOutput": "Interactive dashboard displaying Seattle trip photos"
}
```

### Agent Orchestrator

The orchestrator executes plans by:

1. **Sequential Execution**: Runs actions in the planned order
2. **Data Passing**: Passes results between servers (e.g., photos from Google Photos to UI Generator)
3. **Error Handling**: Gracefully handles failures with fallbacks
4. **Result Combination**: Merges outputs into a cohesive response

### MCP Servers

#### UI Generator Server
- **Tools**: `generate_ui_component`, `create_dashboard`, `create_form`
- **Capabilities**: Creates React components with Tailwind CSS styling
- **AI Integration**: Uses Gemini to generate contextual UI code

#### Google Photos Server
- **Tools**: `search_photos`, `get_trip_photos`, `download_photos`, `get_photos_by_date`
- **Capabilities**: Photo retrieval, search, and management
- **Mock Data**: Currently uses mock data (can be extended to real Google Photos API)

## Example Interactions

### 1. Trip Memory Request
```
User: "Can you remind me my last trip in seattle"
→ Finds Seattle photos → Downloads them → Creates trip dashboard
```

### 2. Recent Photos Dashboard
```
User: "Create a dashboard with my recent photos"
→ Gets recent photos → Creates photo grid dashboard
```

### 3. Photo Search and Display
```
User: "Show me photos from my last trip to Seattle"
→ Searches Seattle photos → Creates gallery component
```

## Extending the System

### Adding New MCP Servers

1. Create a new MCP server following the existing patterns
2. Update `ReasoningAgent.ts` to include the new server in `availableServers`
3. Add execution logic in `AgentOrchestrator.ts`

### Adding New Capabilities

1. Add new tools to existing MCP servers
2. Update the reasoning prompts to understand new capabilities
3. Extend the orchestrator to handle new data types

## Technical Details

### Message Flow

```
User Input → ChatInterface → AgentOrchestrator → ReasoningAgent → Plan Creation
                ↓
Plan Execution → MCP Server Calls → Result Aggregation → UI Generation → Canvas Display
```

### Data Types

- **AgentPlan**: Contains reasoning and action sequence
- **AgentAction**: Individual step with server, tool, and arguments
- **ExecutionResult**: Result from each action execution
- **AgentResponse**: Final response with generated UI and metadata

### Error Handling

- **Graceful Degradation**: Falls back to basic UI generation if orchestration fails
- **Validation**: Validates plans before execution
- **Logging**: Comprehensive logging for debugging

## Future Enhancements

1. **Real Google Photos Integration**: Replace mock data with actual Google Photos API
2. **More MCP Servers**: Add servers for calendar, email, documents, etc.
3. **Advanced Reasoning**: Improve AI reasoning with more context and examples
4. **Caching**: Add caching for frequently accessed data
5. **User Preferences**: Learn user preferences for better personalization

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure `GOOGLE_API_KEY` is set in environment files
2. **MCP Server Connection**: Check that servers are built and accessible
3. **Port Conflicts**: Ensure no other services are using the required ports

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=mcp:*
```

This will show detailed MCP communication logs. 