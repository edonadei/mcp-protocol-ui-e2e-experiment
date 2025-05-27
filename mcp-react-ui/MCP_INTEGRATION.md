# MCP Integration for React UI

This document describes the integration of the Model Context Protocol (MCP) with the React UI application, replacing the direct Gemini API calls with MCP-based UI component generation.

## Overview

The React app now uses an MCP client to connect to our custom MCP server for AI-powered UI component generation. This provides a more structured and extensible approach to UI generation through the MCP protocol.

## Architecture Changes

### 1. MCP Server Integration
- **MCP Server**: Located in `../mcp-server/` - handles UI generation using Gemini AI
- **MCP Client**: Integrated into the React app via API routes
- **Protocol**: Uses the forked MCP SDK with UI extensions from @edonadei's repositories

### 2. New Components and Services

#### API Routes
- `/api/mcp-chat` - Main endpoint for UI generation via MCP
- `/api/mcp-tools` - Lists available MCP tools
- `/api/mcp-templates` - Lists available UI templates

#### Services
- `McpClientService.ts` - Client-side MCP service (for reference, not used directly)
- Updated `LlmService.ts` - Now calls MCP API instead of direct Gemini

#### Updated Components
- `ChatInterface.tsx` - Enhanced to handle MCP responses with generated code
- `ChatInput.tsx` - Fixed TypeScript imports
- `ChatMessage.tsx` - Fixed TypeScript issues

### 3. Response Flow

1. **User Input** → ChatInterface
2. **API Call** → `/api/mcp-chat` 
3. **MCP Connection** → Connects to MCP server via StdioClientTransport
4. **Tool Selection** → Determines appropriate MCP tool based on user request:
   - `generate_ui_component` - General UI components
   - `create_dashboard` - Dashboard layouts
   - `create_form` - Form components
5. **AI Generation** → MCP server uses Gemini AI with specialized prompts
6. **Response Processing** → Extracts generated code and metadata
7. **Canvas Rendering** → Displays generated React components

### 4. Component Type Detection

The system automatically detects component types from user messages:
- **Dashboard**: "dashboard", "analytics", "metrics"
- **Form**: "form", "input", "submit"
- **Button**: "button"
- **Card**: "card"
- **Table**: "table", "list"
- **Chart**: "chart", "graph"
- **Custom**: Default fallback

### 5. Canvas Content Priority

The ChatInterface handles canvas content with the following priority:
1. **Generated Code** - Direct code from MCP server
2. **JSX Detection** - Auto-detected JSX in response text
3. **Canvas Data** - Structured canvas data types
4. **Fallback** - Raw response text

## Dependencies

### Added Dependencies
```json
{
  "@modelcontextprotocol/sdk": "file:../typescript-sdk"
}
```

### MCP Server Dependencies
The MCP server includes:
- Gemini AI integration
- UI-specific prompts and templates
- Three main tools for different UI types
- Full MCP protocol compliance

## Usage

### Starting the Application

1. **Start MCP Server**:
   ```bash
   cd mcp-server
   npm run dev
   ```

2. **Start React App**:
   ```bash
   cd mcp-react-ui
   npm run dev
   ```

### Example Requests

- "Create a dashboard for a fitness tracking app"
- "Design a form for user registration"
- "Build a weather widget component"
- "Make a button with hover effects"

### Response Format

The MCP API returns:
```typescript
interface McpResponse {
  text: string;              // Generated component code or description
  generatedCode?: string;    // Pure React component code
  componentType?: string;    // Type of component generated
  canvasData?: {            // Canvas rendering metadata
    type: "generated-component" | "error"
  };
}
```

## Technical Details

### MCP Protocol Extensions
Uses the forked MCP SDK with UI capabilities:
- `UIContent` and `UIComponent` schemas
- `ui/templates/list` and `ui/render` methods
- Enhanced tool calling with UI-specific parameters

### Error Handling
- Graceful fallbacks for MCP connection failures
- Error messages displayed in chat interface
- Automatic cleanup of MCP client connections

### Performance Considerations
- Each API call creates a new MCP client connection
- Connections are properly closed after each request
- Background processes for both MCP server and React app

## Future Enhancements

1. **Connection Pooling** - Reuse MCP connections for better performance
2. **Template Management** - UI for managing and customizing templates
3. **Component Library** - Save and reuse generated components
4. **Real-time Collaboration** - Multiple users working on the same UI
5. **Version Control** - Track changes to generated components

## Troubleshooting

### Common Issues

1. **MCP Server Not Running**
   - Ensure `npm run dev` is running in `mcp-server/`
   - Check server logs for startup errors

2. **TypeScript Errors**
   - Some linter warnings exist but don't prevent functionality
   - Use `npm run dev` instead of `npm run build` for development

3. **Connection Errors**
   - Verify MCP server path in API routes
   - Check that both servers are running on correct ports

### Debug Logs
- MCP connections logged with ✅ and 🛑 emojis
- Component type detection logged with 🎨 emoji
- Error handling logged with ❌ emoji

## Migration Notes

### From Direct Gemini API
- Old `/api/chat` route still exists but is unused
- `LlmService` now calls `/api/mcp-chat` instead
- Same UI/UX but with MCP protocol benefits

### Breaking Changes
- None for end users
- Developers need to run MCP server alongside React app
- New dependency on forked MCP SDK 