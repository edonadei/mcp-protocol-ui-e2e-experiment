# MCP UI Server with Gemini AI

A lightweight Model Context Protocol (MCP) server that implements the improved MCP protocol with UI rendering capabilities, powered by Google's Gemini AI for dynamic component generation.

## 🎯 Features

- **AI-Powered UI Generation**: Uses Gemini AI to generate React components with Tailwind CSS
- **MCP UI Extensions**: Implements the enhanced MCP protocol with UI capabilities from [@edonadei's forks](https://github.com/edonadei)
- **Interactive Components**: Generate dashboards, forms, and custom UI components
- **Template System**: Pre-defined UI templates for common use cases
- **Real-time Rendering**: Dynamic UI component rendering and validation
- **Modern Styling**: All components use Tailwind CSS for consistent, responsive design

## 📋 Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Basic familiarity with TypeScript/JavaScript and React

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

Create a `.env` file in the `mcp-server` directory:

```bash
# Copy the example file
cp env.example .env

# Edit .env and add your Gemini API key
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

### 3. Build and Run

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start

# Or run in development mode
npm run dev
```

## 🛠️ Available Tools

The server provides three main tools for UI generation:

### 1. `generate_ui_component`
Generate any React UI component using AI based on natural language descriptions.

**Parameters:**
- `description` (required): Description of the component to generate
- `type` (required): Component type (`dashboard`, `form`, `card`, `table`, `chart`, `button`, `input`, `custom`)
- `theme` (optional): Theme (`light`, `dark`, `auto`) - defaults to `light`
- `data` (optional): Data to populate the component with

**Example:**
```json
{
  "description": "a user profile card with avatar, name, email, and social media links",
  "type": "card",
  "theme": "light",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 2. `create_dashboard`
Create an AI-generated interactive dashboard with metrics and visualizations.

**Parameters:**
- `title` (required): Dashboard title
- `metrics` (optional): Array of metrics to display
- `theme` (optional): Theme (`light`, `dark`, `auto`) - defaults to `light`

**Example:**
```json
{
  "title": "Sales Analytics Dashboard",
  "metrics": [
    {"name": "Revenue", "value": "$125,000", "change": "+12%", "icon": "💰"},
    {"name": "Users", "value": "1,247", "change": "+8%", "icon": "👥"},
    {"name": "Orders", "value": "892", "change": "+15%", "icon": "📦"}
  ],
  "theme": "light"
}
```

### 3. `create_form`
Create an AI-generated dynamic form with validation and modern styling.

**Parameters:**
- `title` (required): Form title
- `fields` (required): Array of form fields
- `theme` (optional): Theme (`light`, `dark`, `auto`) - defaults to `light`

**Example:**
```json
{
  "title": "User Registration Form",
  "fields": [
    {"name": "firstName", "type": "text", "label": "First Name", "required": true, "placeholder": "Enter your first name"},
    {"name": "email", "type": "email", "label": "Email", "required": true, "placeholder": "Enter your email"},
    {"name": "role", "type": "select", "label": "Role", "options": ["User", "Admin", "Manager"]}
  ],
  "theme": "light"
}
```

## 🎨 UI Templates

The server includes three pre-defined UI templates:

### 1. `ai-dashboard`
Interactive dashboard template with metrics, charts, and data tables.
- **Root Component**: `container`
- **Allowed Components**: `container`, `text`, `card`, `chart`, `table`, `progress`, `button`
- **Max Depth**: 5 levels
- **Custom Components**: Allowed

### 2. `ai-form`
Dynamic form template with validation and submission handling.
- **Root Component**: `form`
- **Allowed Components**: `form`, `input`, `select`, `checkbox`, `radio`, `textarea`, `button`, `text`
- **Max Depth**: 3 levels
- **Custom Components**: Allowed

### 3. `ai-component`
Custom component template for any user-specified UI element.
- **Root Component**: `container`
- **Allowed Components**: All standard UI components
- **Max Depth**: 10 levels
- **Custom Components**: Allowed

## 🔧 MCP Protocol Support

This server implements the enhanced MCP protocol with UI extensions:

### Supported Request Types
- `tools/list` - List available tools
- `tools/call` - Execute tool functions
- `ui/templates/list` - List available UI templates
- `ui/templates/get` - Get specific template details
- `ui/render` - Render UI components using templates
- `ui/validate` - Validate UI component structure

### UI Capabilities
- **Templates**: ✅ Template listing and retrieval
- **Rendering**: ✅ Dynamic UI component rendering
- **Validation**: ✅ Component structure validation
- **List Changed**: ✅ Template change notifications

## 🤖 AI Integration

The server uses Google's Gemini AI (`gemini-2.5-flash-preview-05-20`) with a specialized system prompt that:

- Generates React components with Tailwind CSS
- Follows modern design principles
- Ensures accessibility and responsiveness
- Creates self-contained, executable components
- Uses proper React patterns (hooks, event handlers)

### Component Generation Process
1. User provides description and requirements
2. Server constructs specialized prompt for Gemini
3. Gemini generates React JSX code
4. Server wraps code in MCP UI component structure
5. Component is returned with metadata and styling

## 📊 Example Usage

### Using with MCP Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const client = new Client({
  name: "ui-client",
  version: "1.0.0"
});

// Generate a dashboard
const result = await client.callTool({
  name: "create_dashboard",
  arguments: {
    title: "Analytics Dashboard",
    metrics: [
      {name: "Revenue", value: "$50K", change: "+10%", icon: "💰"}
    ]
  }
});

console.log(result.content);
```

### Expected Output Structure

```json
{
  "content": [
    {
      "type": "text",
      "text": "📊 Generated AI Dashboard: Analytics Dashboard"
    },
    {
      "type": "ui",
      "component": {
        "type": "container",
        "properties": {
          "className": "ai-dashboard",
          "title": "Analytics Dashboard",
          "generatedCode": "function Dashboard() { ... }",
          "theme": "light"
        },
        "children": []
      }
    }
  ]
}
```

## 🔍 Component Analysis

Generated components include detailed metadata:

- **Component Type**: Root component type (`container`, `form`, etc.)
- **Generated Code**: Complete React JSX code
- **Theme**: Applied theme (light/dark)
- **Description**: Original user description
- **CSS Classes**: Applied Tailwind classes
- **Validation**: Component structure validation results

## 🛡️ Error Handling

The server includes comprehensive error handling:

- **API Key Validation**: Checks for valid Gemini API key
- **Input Validation**: Validates tool parameters
- **AI Generation Errors**: Handles Gemini API failures gracefully
- **Template Validation**: Validates UI components against schemas
- **Process Management**: Graceful shutdown on SIGINT/SIGTERM

## 🔗 Related Repositories

This server uses the enhanced MCP protocol from:

- **Protocol Extensions**: [modelcontextprotocol-supports-ui](https://github.com/edonadei/modelcontextprotocol-supports-ui)
- **TypeScript SDK**: [typescript-sdk](https://github.com/edonadei/typescript-sdk)
- **Example Implementation**: [mcp-ui-dashboard-example](https://github.com/edonadei/mcp-ui-dashboard-example)

## 📝 Development

### Build Commands

```bash
# Clean build artifacts
npm run clean

# Build TypeScript
npm run build

# Clean and rebuild
npm run rebuild

# Development mode (build + run)
npm run dev
```

### Project Structure

```
mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (create this)
├── env.example           # Environment variables template
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the MCP client
5. Submit a pull request

## 📄 License

MIT License - see the LICENSE file for details.

---

**Ready to build AI-powered UI components with MCP? Start with the Quick Setup above! 🚀** 