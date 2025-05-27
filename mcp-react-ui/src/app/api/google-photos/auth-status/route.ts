import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call the HTTP bridge instead of spawning MCP server directly
    const response = await fetch('http://localhost:3001/auth-status');
    
    if (!response.ok) {
      throw new Error(`HTTP bridge responded with status: ${response.status}`);
    }
    
    const authStatus = await response.json();
    return NextResponse.json(authStatus);

  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check authentication status', 
        details: error instanceof Error ? error.message : String(error),
        isAuthenticated: false 
      },
      { status: 500 }
    );
  }
} 