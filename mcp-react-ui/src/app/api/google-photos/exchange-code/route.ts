import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Call the HTTP bridge instead of spawning MCP server directly
    const response = await fetch('http://localhost:3001/exchange-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP bridge responded with status: ${response.status}`);
    }
    
    const tokens = await response.json();
    return NextResponse.json(tokens);

  } catch (error) {
    console.error('Error exchanging code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to exchange authorization code', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 