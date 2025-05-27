# Setup Guide: MCP UI Dashboard Example with Forked Repositories

This guide explains how to set up and use the MCP UI Dashboard Example with forked versions of the MCP protocol and TypeScript SDK that include UI rendering extensions.

## Quick Start

### Option 1: Clone and Link (Recommended for Development)

```bash
# Create a workspace directory
mkdir mcp-ui-workspace
cd mcp-ui-workspace

# Clone all three repositories
git clone https://github.com/edonadei/modelcontextprotocol-supports-ui.git
git clone https://github.com/edonadei/typescript-sdk.git  
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git

# Build and link the TypeScript SDK
cd typescript-sdk
npm install
npm run build
npm link

# Set up the example project
cd ../mcp-ui-dashboard-example
npm install
npm link @modelcontextprotocol/sdk
npm run build

# Run the example
npm run client
```

### Option 2: Direct Git Dependencies

Update `package.json` in the example project:

```json
{
  "name": "mcp-ui-dashboard-example",
  "dependencies": {
    "@modelcontextprotocol/sdk": "git+https://github.com/edonadei/typescript-sdk.git#main"
  }
}
```

Then run:
```bash
npm install
npm run build
npm run client
```

## Detailed Setup Instructions

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher  
- **Git**: For cloning repositories
- **TypeScript**: Will be installed as dependency

### Repository Dependencies

The UI Dashboard Example depends on these forked repositories:

1. **MCP Protocol UI** ([`modelcontextprotocol-supports-ui`](https://github.com/edonadei/modelcontextprotocol-supports-ui))
   - Contains extended schema with UI component types
   - Defines `UIContent`, `UIComponent`, `UITemplate` types
   - Location: `schema/2025-03-26/schema.ts`

2. **TypeScript SDK UI** ([`typescript-sdk`](https://github.com/edonadei/typescript-sdk))  
   - Contains TypeScript types for UI extensions
   - Exports UI-related schemas and types
   - Location: `src/types.ts`

3. **UI Dashboard Example** (`mcp-ui-dashboard-example`)
   - Demonstrates UI rendering capabilities
   - Includes server and client implementations
   - Contains enhanced logging and examples

### Step-by-Step Setup

#### 1. Prepare Your Workspace

```bash
# Create a dedicated workspace
mkdir mcp-ui-workspace
cd mcp-ui-workspace
```

#### 2. Clone the Repositories

```bash
# Clone the forked MCP protocol
git clone https://github.com/edonadei/modelcontextprotocol-supports-ui.git

# Clone the forked TypeScript SDK
git clone https://github.com/edonadei/typescript-sdk.git

# Clone the UI dashboard example
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git
```

#### 3. Build the TypeScript SDK

```bash
cd typescript-sdk

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Verify the build
ls dist/  # Should contain compiled JavaScript files

# Create a global npm link
npm link
```

#### 4. Set Up the Example Project

```bash
cd ../mcp-ui-dashboard-example

# Install dependencies
npm install

# Link to your local TypeScript SDK
npm link @modelcontextprotocol/sdk

# Verify the link
npm ls @modelcontextprotocol/sdk
# Should show: @modelcontextprotocol/sdk@X.X.X -> ../typescript-sdk

# Build the example
npm run build
```

#### 5. Test the Setup

```bash
# Run the enhanced client example
npm run client

# Expected output should include:
# 🚀 Starting MCP UI Dashboard Client Example
# ✅ Connected to UI Dashboard Server
# 🎨 Dashboard UI component analysis:
# ... detailed logging output
```

## Alternative Installation Methods

### Method 1: Package.json Git Dependencies

Edit `ui-dashboard-example/package.json`:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "git+https://github.com/edonadei/typescript-sdk.git"
  }
}
```

### Method 2: Local File Dependencies

If repositories are in the same parent directory:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "file:../typescript-sdk"
  }
}
```

### Method 3: Published Packages (For Distribution)

Publish your forked SDK to npm:

```bash
cd typescript-sdk

# Update package name to avoid conflicts
# Edit package.json: "name": "@edonadei/mcp-sdk-ui"

npm version patch
npm publish --access public

# Then users can install with:
npm install @edonadei/mcp-sdk-ui
```

## Verification Checklist

After setup, verify everything works:

- [ ] **TypeScript compilation**: `npm run build` succeeds without errors
- [ ] **Server starts**: `npm start` shows "MCP UI Dashboard Server running on stdio"
- [ ] **Client connects**: `npm run client` shows successful connection
- [ ] **UI components generated**: Client output shows dashboard and form creation
- [ ] **Enhanced logging**: Detailed component analysis is displayed

## Troubleshooting

### Common Issues and Solutions

#### 1. TypeScript Compilation Errors

**Error**: `Cannot find module '@modelcontextprotocol/sdk'`

**Solution**:
```bash
# Check if SDK is properly linked
npm ls @modelcontextprotocol/sdk

# If not linked, re-link
npm link @modelcontextprotocol/sdk

# Or reinstall
npm uninstall @modelcontextprotocol/sdk
npm install file:../typescript-sdk
```

#### 2. UI Type Errors

**Error**: `Property 'ui' does not exist on type 'ClientCapabilities'`

**Solution**: Ensure you're using the forked TypeScript SDK with UI extensions:
```bash
cd typescript-sdk
git log --oneline -5  # Should show UI-related commits
npm run build
```

#### 3. Server Connection Issues

**Error**: Client hangs or fails to connect

**Solution**:
```bash
# Test server independently
npm run build
node dist/index.js
# Should output: "MCP UI Dashboard Server running on stdio"

# Check for port conflicts or permission issues
```

#### 4. Missing UI Components

**Error**: Dashboard shows empty or basic components

**Solution**: Verify the server implementation includes UI tools:
```bash
# Check server logs for tool registration
npm run client 2>&1 | grep "Available tools"
# Should show: create_dashboard, create_form, get_sample_data
```

### Debug Commands

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version  
npm --version   # Should be 8+

# Verify TypeScript compilation
npx tsc --noEmit

# Check dependency tree
npm ls --depth=0

# Test SDK import
node -e "console.log(require('@modelcontextprotocol/sdk'))"
```

## Development Workflow

### Making Changes

1. **Modify the TypeScript SDK**:
   ```bash
   cd typescript-sdk
   # Make changes to src/types.ts
   npm run build
   ```

2. **Update the example**:
   ```bash
   cd ../mcp-ui-dashboard-example
   # Changes are automatically picked up via npm link
   npm run build
   npm run client
   ```

### Testing Changes

```bash
# Run the client with enhanced logging
npm run client

# Test specific functionality
npm run build && node dist/index.js

# Check TypeScript types
npx tsc --noEmit --strict
```

## Repository Structure

Your workspace should look like this:

```
mcp-ui-workspace/
├── modelcontextprotocol-supports-ui/
│   ├── schema/
│   │   └── 2025-03-26/
│   │       └── schema.ts              # Extended MCP schema
│   └── README.md
├── typescript-sdk/
│   ├── src/
│   │   ├── types.ts                   # UI type definitions  
│   │   └── ...
│   ├── dist/                          # Compiled output
│   ├── package.json
│   └── README.md
└── mcp-ui-dashboard-example/
    ├── src/
    │   ├── index.ts                   # MCP server
    │   └── client-example.ts          # Enhanced client
    ├── dist/                          # Compiled output
    ├── package.json
    ├── README.md
    └── SETUP.md                       # This file
```

## Getting Help

If you encounter issues not covered here:

1. **Check the enhanced logging output** for specific error details
2. **Verify all repositories are on the correct branches** with UI extensions
3. **Ensure Node.js and npm versions** meet requirements
4. **Review the TypeScript compilation output** for type errors
5. **Test each component independently** (protocol → SDK → example)

## Contributing

To contribute improvements:

1. Fork the relevant repository from [edonadei's GitHub](https://github.com/edonadei)
2. Create a feature branch
3. Make your changes
4. Test with the full setup
5. Submit a pull request

Remember to test your changes across all three repositories to ensure compatibility. 