import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call the HTTP bridge instead of spawning MCP server directly
    const response = await fetch('http://localhost:3001/auth-url');
    
    if (!response.ok) {
      throw new Error(`HTTP bridge responded with status: ${response.status}`);
    }
    
    const authUrl = await response.json();
    return NextResponse.json(authUrl);

  } catch (error) {
    console.error('Error getting auth URL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get authentication URL', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 