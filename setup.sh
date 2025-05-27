#!/bin/bash

# MCP Protocol UI Setup Script
# This script automates the setup process for the entire project

set -e  # Exit on any error

echo "🚀 Setting up MCP Protocol UI..."
echo "=================================="

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Function to run commands in a directory
run_in_dir() {
    local dir=$1
    local cmd=$2
    echo "📁 Running '$cmd' in $dir..."
    (cd "$dir" && eval "$cmd")
}

# Install and build TypeScript SDK
echo ""
echo "🔧 Setting up TypeScript SDK..."
run_in_dir "typescript-sdk" "npm install && npm run build"

# Install and build MCP Server
echo ""
echo "🔧 Setting up MCP Server..."
run_in_dir "mcp-server" "npm install && npm run build"

# Install and build Google Photos MCP Server
echo ""
echo "🔧 Setting up Google Photos MCP Server..."
run_in_dir "google-photos-mcp-server" "npm install && npm run build"

# Install React app dependencies
echo ""
echo "🔧 Setting up React Application..."
run_in_dir "mcp-react-ui" "npm install"

# Create .env file if it doesn't exist
echo ""
echo "📝 Setting up environment variables..."
if [ ! -f "mcp-react-ui/.env" ]; then
    if [ -f "mcp-react-ui/.env.example" ]; then
        cp "mcp-react-ui/.env.example" "mcp-react-ui/.env"
        echo "✅ Created .env file from .env.example"
        echo "⚠️  Please edit mcp-react-ui/.env and add your GOOGLE_API_KEY"
    else
        echo "⚠️  No .env.example found. Please create mcp-react-ui/.env manually"
    fi
else
    echo "✅ .env file already exists"
fi

# Check for Google Photos credentials
echo ""
echo "🔍 Checking for Google Photos credentials..."
cred_files=$(find google-photos-mcp-server -name "client_secret_*.json" 2>/dev/null | wc -l)
if [ "$cred_files" -eq 0 ]; then
    echo "⚠️  No Google Photos credentials found in google-photos-mcp-server/"
    echo "   Please copy your OAuth credentials file to google-photos-mcp-server/"
    echo "   Example: cp path/to/client_secret_*.json google-photos-mcp-server/"
else
    echo "✅ Found Google Photos credentials"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================================="
echo ""
echo "📋 Next steps:"
echo "1. Edit mcp-react-ui/.env and add your GOOGLE_API_KEY"
echo "2. Copy Google Photos OAuth credentials to google-photos-mcp-server/"
echo "3. Enable Google Photos Library API in Google Cloud Console"
echo ""
echo "🚀 To start the application:"
echo "Terminal 1: cd google-photos-mcp-server && npm run bridge"
echo "Terminal 2: cd mcp-react-ui && npm run dev"
echo ""
echo "Then open http://localhost:3000" 