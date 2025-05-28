import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the MCP bridge directly
    const response = await fetch('http://localhost:3001/call-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: 'get_trip_photos',
        arguments: { location: 'Dallas' }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP bridge responded with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Tool call failed');
    }

    // Return just the first 3 photos with their key properties
    const photos = result.data.photos.slice(0, 3).map((photo: any) => ({
      id: photo.id,
      filename: photo.filename,
      downloadUrl: photo.downloadUrl,
      thumbnailUrl: photo.thumbnailUrl,
      hasDownloadUrl: !!photo.downloadUrl,
      hasThumbnailUrl: !!photo.thumbnailUrl,
      creationTime: photo.mediaMetadata?.creationTime
    }));

    return NextResponse.json({
      success: true,
      count: result.data.photos.length,
      samplePhotos: photos
    });

  } catch (error) {
    console.error('Error testing photos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test photos', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 