# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Method 1: Clone & Link (Recommended)

```bash
# 1. Create workspace and clone repos
mkdir mcp-ui-workspace && cd mcp-ui-workspace
git clone https://github.com/edonadei/modelcontextprotocol-supports-ui.git
git clone https://github.com/edonadei/typescript-sdk.git  
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git

# 2. Build and link SDK
cd typescript-sdk
npm install && npm run build && npm link

# 3. Setup example
cd ../mcp-ui-dashboard-example
npm install && npm link @modelcontextprotocol/sdk && npm run build

# 4. Run it!
npm run client
```

### Method 2: Git Dependencies

```bash
# 1. Clone example
git clone https://github.com/edonadei/mcp-ui-dashboard-example.git
cd mcp-ui-dashboard-example

# 2. Update package.json
cat > package.json << 'EOF'
{
  "name": "mcp-ui-dashboard-example",
  "dependencies": {
    "@modelcontextprotocol/sdk": "git+https://github.com/edonadei/typescript-sdk.git"
  }
}
EOF

# 3. Install and run
npm install && npm run build && npm run client
```

## ✅ Success Indicators

You should see:
- 🚀 Starting MCP UI Dashboard Client Example
- ✅ Connected to UI Dashboard Server  
- 🎨 Dashboard UI component analysis
- 📝 Form UI component analysis
- 📊 Data analysis with metrics

## 🔧 Troubleshooting

**Build fails?**
```bash
npm run clean && npm run rebuild
```

**Connection issues?**
```bash
node dist/index.js  # Should show "MCP UI Dashboard Server running on stdio"
```

**Missing UI types?**
```bash
npm ls @modelcontextprotocol/sdk  # Should show your forked version
```

## 📚 Full Documentation

- [Complete Setup Guide](SETUP.md) - Detailed instructions
- [README](README.md) - Features and usage
- [Example Output](EXAMPLE_OUTPUT.md) - What to expect

## 🔗 Repository URLs

- **Protocol**: `https://github.com/edonadei/modelcontextprotocol-supports-ui.git`
- **SDK**: `https://github.com/edonadei/typescript-sdk.git`
- **Example**: `https://github.com/edonadei/mcp-ui-dashboard-example.git` 