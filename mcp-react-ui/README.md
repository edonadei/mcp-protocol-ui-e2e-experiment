# MCP React UI

This is a React application built with the [T3 Stack](https://create.t3.gg/) that integrates with Model Context Protocol (MCP) servers, specifically the Google Photos MCP server.

## Features

- **MCP Integration**: Connect to MCP servers for enhanced AI capabilities
- **Google Photos Integration**: Browse and interact with your Google Photos library
- **Automatic Bridge Startup**: The HTTP bridge for MCP communication starts automatically during development

## Getting Started

### Prerequisites

1. Node.js 18+ and npm
2. Google Photos API credentials (OAuth 2.0)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   This command automatically:
   - Builds and starts the Google Photos MCP HTTP bridge on port 3001
   - Starts the Next.js development server on port 3000

### Available Scripts

- `npm run dev` - Start both the MCP bridge and React app (recommended for development)
- `npm run dev:ui-only` - Start only the React app (if you want to run the bridge separately)
- `npm run bridge` - Build and start only the MCP HTTP bridge
- `npm run status` - Check if both services are running
- `npm run build` - Build the production version
- `npm run start` - Start the production server

### MCP Bridge

The application uses an HTTP bridge to communicate with the Google Photos MCP server. The bridge:
- Runs on `http://localhost:3001`
- Provides REST endpoints for MCP tool calls
- Handles OAuth authentication with Google Photos
- Automatically starts when running `npm run dev`

If you need to run the bridge separately:
```bash
npm run bridge
```

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - Type-safe APIs
- [Prisma](https://prisma.io) - Database ORM
- [Model Context Protocol](https://modelcontextprotocol.io) - AI integration

## Troubleshooting

### "Connection refused" errors
If you see connection refused errors when trying to access Google Photos, ensure:
1. The MCP bridge is running on port 3001
2. You have valid Google Photos API credentials
3. The Google Photos Library API is enabled in your Google Cloud Console

### Bridge not starting automatically
If the bridge doesn't start with `npm run dev`, try:
1. Running `npm run bridge` separately in another terminal
2. Checking that the `google-photos-mcp-server` directory exists at `../google-photos-mcp-server`
3. Ensuring the bridge builds successfully with `cd ../google-photos-mcp-server && npm run build`

## Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [T3 Stack Documentation](https://create.t3.gg/)
- [Google Photos Library API](https://developers.google.com/photos/library/guides/overview)
