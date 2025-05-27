# MCP UI Dashboard Example

This project demonstrates the UI rendering capabilities of the Model Context Protocol (MCP) by implementing a server that can create interactive dashboards, forms, and data visualizations.

## Setup with Forked Repositories

This example uses forked versions of the MCP protocol and TypeScript SDK that include UI rendering extensions. Follow these steps to set up the project:

### Prerequisites

- Node.js 18+ and npm
- Git

### Step 1: Clone the Required Repositories

You'll need to clone three repositories:

```bash
# 1. Clone the forked MCP protocol (contains UI schema extensions)
git clone https://github.com/edonadei/modelcontextprotocol-supports-ui.git
cd modelcontextprotocol-supports-ui

# 2. Clone the forked TypeScript SDK (contains UI type support)
git clone https://github.com/edonadei/typescript-sdk.git

# 3. Clone the UI dashboard example
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git
```

### Step 2: Build the TypeScript SDK

```bash
# Navigate to the TypeScript SDK directory
cd typescript-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Create a global link for local development
npm link
```

### Step 3: Set Up the UI Dashboard Example

```bash
# Navigate to the example directory
cd ../mcp-ui-dashboard-example

# Install dependencies
npm install

# Link to your local TypeScript SDK
npm link @modelcontextprotocol/sdk

# Build the example
npm run build
```

### Step 4: Run the Example

```bash
# Run the enhanced client example with detailed logging
npm run client

# Or run the server standalone
npm start
```

## Alternative Setup Methods

### Method 1: Using Git Dependencies

Update your `package.json` to reference the forked repositories directly:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "git+https://github.com/edonadei/typescript-sdk.git"
  }
}
```

### Method 2: Using Local File Paths

If you have all repositories in the same parent directory:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "file:../typescript-sdk"
  }
}
```

### Method 3: Publishing to npm (Recommended for Distribution)

For easier distribution, consider publishing your forked packages:

```bash
# In the TypeScript SDK directory
npm version patch
npm publish --tag ui-extensions

# Then users can install with:
npm install @edonadei/mcp-sdk-ui
```

## Repository Structure

When set up correctly, your directory structure should look like:

```
parent-directory/
├── modelcontextprotocol-supports-ui/    # Forked MCP protocol with UI extensions
│   └── schema/
│       └── 2025-03-26/
│           └── schema.ts                # Extended schema with UI types
├── typescript-sdk/                     # Forked TypeScript SDK with UI support
│   ├── src/
│   │   └── types.ts                     # UI type definitions
│   └── package.json
└── mcp-ui-dashboard-example/            # This example project
    ├── src/
    │   ├── index.ts                     # MCP server with UI capabilities
    │   └── client-example.ts            # Client with enhanced logging
    └── package.json
```

## Verification

To verify your setup is working correctly:

1. **Check TypeScript compilation**:
   ```bash
   npm run build
   ```

2. **Run the client example**:
   ```bash
   npm run client
   ```

3. **Look for these indicators of success**:
   - ✅ No TypeScript compilation errors
   - ✅ Client connects to server successfully
   - ✅ UI components are generated and analyzed
   - ✅ Enhanced logging shows detailed component breakdowns

## Troubleshooting

### Common Issues

**1. TypeScript compilation errors about UI types**
```bash
# Ensure you're using the forked SDK
npm ls @modelcontextprotocol/sdk
# Should show your local/forked version
```

**2. Module not found errors**
```bash
# Rebuild the TypeScript SDK
cd ../typescript-sdk
npm run build
npm link

# Re-link in the example project
cd ../mcp-ui-dashboard-example
npm link @modelcontextprotocol/sdk
```

**3. Server connection issues**
```bash
# Check that the server builds correctly
npm run build
node dist/index.js
# Should show: "MCP UI Dashboard Server running on stdio"
```

### Getting Help

If you encounter issues:

1. Check that all three repositories are on the correct branches with UI extensions
2. Verify Node.js version compatibility (18+)
3. Ensure all dependencies are installed and built
4. Check the enhanced logging output for specific error details

## Features

### 🎛️ Interactive Dashboards
- **Metrics Cards**: Display key performance indicators with icons and formatting
- **Charts & Graphs**: Line charts, bar charts, pie charts, and area charts
- **Data Tables**: Sortable and filterable tables with pagination
- **Responsive Layout**: Grid-based layouts that adapt to different screen sizes

### 📝 Dynamic Forms
- **Form Builder**: Create forms with various input types (text, email, password, number, date, select, checkbox)
- **Validation**: Built-in form validation with error handling
- **Custom Styling**: Theme support and customizable appearance

### 📊 Data Visualization
- **Real-time Data**: Sample sales, user, and metrics data
- **Multiple Chart Types**: Support for various visualization formats
- **Interactive Elements**: Clickable and hoverable chart components

### 🎨 UI Templates
- **Template System**: Predefined templates for common UI patterns
- **Validation**: Component validation against template schemas
- **Customization**: Support for themes, preferences, and styling overrides

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

## Usage

### Available Tools

#### `create_dashboard`
Creates an interactive dashboard with customizable components.

**Parameters:**
- `title` (string, required): Dashboard title
- `metrics` (boolean, default: true): Include metrics cards
- `charts` (boolean, default: true): Include charts
- `tables` (boolean, default: true): Include data tables
- `theme` (string, default: "light"): Theme ("light" or "dark")

**Example:**
```json
{
  "title": "Sales Dashboard",
  "metrics": true,
  "charts": true,
  "tables": true,
  "theme": "dark"
}
```

#### `create_form`
Creates a dynamic form with validation.

**Parameters:**
- `title` (string, required): Form title
- `fields` (array, required): Form field configurations

**Example:**
```json
{
  "title": "User Registration",
  "fields": [
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "required": true
    },
    {
      "name": "password",
      "type": "password",
      "label": "Password",
      "required": true
    },
    {
      "name": "role",
      "type": "select",
      "label": "Role",
      "options": ["User", "Admin", "Manager"]
    }
  ]
}
```

#### `get_sample_data`
Retrieves sample data for testing UI components.

**Parameters:**
- `type` (string, required): Data type ("sales", "users", or "metrics")

### UI Templates

#### Dashboard Template
- **Root Component**: Container with grid layout
- **Allowed Components**: container, text, card, chart, table, progress
- **Features**: Metrics cards, charts, data tables
- **Styling**: Supports themes and custom CSS

#### Form Template
- **Root Component**: Form with validation
- **Allowed Components**: form, input, select, checkbox, radio, textarea, button, text
- **Features**: Dynamic field generation, validation, submission handling
- **Styling**: Responsive design with customizable themes

#### Data Table Template
- **Root Component**: Table with advanced features
- **Allowed Components**: table, text, button, input
- **Features**: Sorting, filtering, pagination
- **Styling**: Clean, professional appearance

## UI Component Types

The server supports the following UI component types:

- **Layout**: `container`
- **Text**: `text`
- **Interactive**: `button`, `input`, `select`, `checkbox`, `radio`, `textarea`
- **Media**: `image`, `link`
- **Data**: `list`, `table`, `chart`
- **Structure**: `form`, `card`, `modal`, `tabs`, `accordion`
- **Feedback**: `progress`
- **Custom**: `custom`

## Sample Data

The server includes sample data for demonstration:

### Sales Data
```json
[
  { "month": "Jan", "revenue": 45000, "orders": 120 },
  { "month": "Feb", "revenue": 52000, "orders": 135 },
  // ... more months
]
```

### User Data
```json
[
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "Admin",
    "lastLogin": "2024-01-15"
  },
  // ... more users
]
```

### Metrics Data
```json
{
  "totalUsers": 1247,
  "activeUsers": 892,
  "revenue": 328000,
  "growth": 12.5
}
```

## Customization

### Themes
The server supports light and dark themes:
- **Light Theme**: Clean, bright appearance
- **Dark Theme**: Dark background with light text

### Styling
Components support:
- **CSS Classes**: Custom CSS class names
- **Inline Styles**: Direct style properties
- **Grid Layout**: Responsive grid system
- **Flexbox**: Flexible layouts

### Preferences
Client preferences can be set for:
- **Default Theme**: Light or dark
- **Color Scheme**: Primary, secondary, accent colors
- **Typography**: Font family, size, weight
- **Layout**: Density, border radius, shadows
- **Accessibility**: High contrast, reduced motion, screen reader support

## Protocol Methods

### UI Template Methods
- `ui/templates/list`: List available templates
- `ui/templates/get`: Get specific template details
- `ui/render`: Render UI using templates
- `ui/validate`: Validate UI components

### Tool Methods
- `tools/list`: List available tools
- `tools/call`: Execute tools

## Example Client Integration

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Connect to the server
const client = new Client(/* transport */);

// List available UI templates
const templates = await client.request({
  method: "ui/templates/list"
});

// Create a dashboard
const dashboard = await client.request({
  method: "tools/call",
  params: {
    name: "create_dashboard",
    arguments: {
      title: "My Dashboard",
      theme: "dark"
    }
  }
});

// The dashboard.content[0] will contain the UI component
const uiComponent = dashboard.content[0].component;
```

## Security Considerations

- **Template Validation**: All UI components are validated against template schemas
- **Component Restrictions**: Only allowed component types can be used
- **Depth Limits**: Maximum nesting depth prevents infinite recursion
- **Sanitization**: All user input should be sanitized before rendering

## Development

### Project Structure
```
ui-dashboard-example/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building
```bash
npm run build
```

### Running in Development
```bash
npm run dev
```

## Contributing

This example demonstrates the core concepts of MCP UI rendering. You can extend it by:

1. **Adding New Templates**: Create templates for specific use cases
2. **Custom Components**: Implement custom component types
3. **Data Sources**: Connect to real data sources
4. **Interactivity**: Add event handling and state management
5. **Styling**: Enhance themes and styling options

## License

MIT License - see the LICENSE file for details. 