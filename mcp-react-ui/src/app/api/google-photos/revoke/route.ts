import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Call the HTTP bridge instead of spawning MCP server directly
    const response = await fetch('http://localhost:3001/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP bridge responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error revoking auth:', error);
    return NextResponse.json(
      { 
        error: 'Failed to revoke authentication', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 