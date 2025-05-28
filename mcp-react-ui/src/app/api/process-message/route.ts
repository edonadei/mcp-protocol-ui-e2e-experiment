import { NextRequest, NextResponse } from 'next/server';
import type { Message } from '../../_components/ChatMessage';

// Mock demo code - Goofy Seattle Photo Gallery
const DEMO_REACT_CODE = `// Individual Photo Component
const GoofyPhoto = ({ src, alt, index }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);

  // Apply a random rotation and a slight offset to make it "goofy"
  // Ensure rotation is different for each image but consistent for that image on re-renders
  const randomRotation = (index * 15 % 40) - 20; // Consistent rotation based on index (-20 to 20 deg)
  const randomXOffset = (index % 2 === 0 ? 1 : -1) * (index * 5 % 20); // Slight horizontal offset
  const randomYOffset = (index % 2 !== 0 ? 1 : -1) * (index * 5 % 15); // Slight vertical offset

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('Failed to load image:', src);
    setIsLoading(false);
  };

  return (
    <div
      className="relative m-4 p-2 bg-white shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl rounded-lg"
      style={{
        transform: \`rotate(\${randomRotation}deg) translateX(\${randomXOffset}px) translateY(\${randomYOffset}px)\`,
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className="rounded-md w-full h-auto max-w-xs sm:max-w-sm md:max-w-md object-cover"
        style={{ minHeight: '200px', opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
      />
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        Seattle Memories #{index + 1}
      </div>
    </div>
  );
};

// Main App Component
function SeattlePhotoGallery() {
  // Original Google Photos URLs - now proxied through our API
  const originalUrls = [
    "https://lh3.googleusercontent.com/pw/AP1GczO38bPaWs9QBOU1s1QenZeKSAt6DCDz48jJbV5FK54ycbbbRT_6P12NXDiKV11TpsXSR-E2EKjmDgHRWlrraEhsWIZlhVgQdtVT43KoUfnChgZSyGyaKXUbRuRLTjLQDd-yVOnopyTCWFFzrI1zWH094g=w3024-h1702-s-no-gm?authuser=0",
    "https://lh3.googleusercontent.com/pw/AP1GczMZJFLQwd6DejbJ4WFB7WH-sJ3GgaOf4X-lOMO8Zy6r5gZRarA8cn-zXmHB4Usq3tzfwQxLZ5oCSsZU1yPlHGh7xNApkFZRquwen9nYUcE6kQG4gfpnN2353VqY3TFKtDQY6twsffDMsH9d4Vkx0z3BWg=w1286-h1714-s-no-gm?authuser=0",
    "https://lh3.googleusercontent.com/pw/AP1GczNzSGKbe2sprHtYnRy5PQQMzHaukTdNfN0qjwUFHTD6k6EC8YltesMA3RhO19-2O7kECdChUkeGKrSRmTJaVtHWduXp_O67zkntczM1rHSGRfbAC-P9o8mkhaCoJyY7Zlh4WnKH-P7yFTrhEYOwDdY0sw=w1286-h1714-s-no-gm?authuser=0",
    "https://lh3.googleusercontent.com/pw/AP1GczO8ed0iM-8jwu9sm6fc7nGOrzM4kBBWdQWfoagG92ngUGaFMTGa7DabOxJqAaulWAgNSMAVjVHq1V4PjGuACfp5latCSr4BO-yDG191eU-OkQKsgl6Vx10o5U2jAzFV5kYRrJ5tnNG3Dn4PPUQ1gAzzgw=w1438-h1916-s-no-gm?authuser=0",
  ];

  // Convert to proxied URLs
  const imageUrls = originalUrls.map(url => 
    \`/api/image-proxy?url=\${encodeURIComponent(url)}\`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 py-8 px-4 flex flex-col items-center font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          My Goofy Seattle Adventures! 🤪
        </h1>
        <p className="text-xl text-indigo-100 mt-2">
          A fun little gallery of my trip memories.
        </p>
      </header>

      <div className="flex flex-wrap justify-center items-center max-w-4xl">
        {imageUrls.map((url, index) => (
          <GoofyPhoto
            key={index}
            src={url}
            alt={\`Seattle Trip Photo \${index + 1}\`}
            index={index}
          />
        ))}
      </div>

      <footer className="mt-12 text-center text-indigo-200">
        <p>&copy; {new Date().getFullYear()} My Awesome Photo App. Keep exploring!</p>
      </footer>
    </div>
  );
}`;

interface ProcessMessageRequest {
  messages: Message[];
  enableToolCallNotifications?: boolean;
  useStreaming?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ProcessMessageRequest;
    const { messages, enableToolCallNotifications, useStreaming } = body;
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return NextResponse.json({ error: 'No valid message found' }, { status: 400 });
    }
    
    console.log("🎭 DEMO MODE: Simulating realistic reasoning flow for:", lastMessage.content);

    // Enhanced mock response with detailed reasoning
    const mockResponse = {
      text: "🎨 I've analyzed your request and created a fun and goofy photo gallery showcasing your Seattle adventures! The photos are displayed with playful rotations and hover effects to make browsing your memories more entertaining. Each photo loads through a secure proxy to ensure they display properly.",
      generatedCode: DEMO_REACT_CODE,
      componentType: "photo-gallery",
      canvasData: { type: "generated-component" },
      reasoning: `I approached this request by first understanding that you want to see your photos in a fun way. I decided to create a goofy photo gallery because:

1. **Visual Appeal**: A photo gallery is perfect for showcasing memories
2. **Interactive Elements**: Added hover effects and animations for engagement  
3. **Playful Design**: Used random rotations to make it "goofy" as requested
4. **Technical Solution**: Implemented image proxy to handle CORS issues with Google Photos
5. **User Experience**: Added loading states and smooth transitions

The component uses React hooks for state management and Tailwind CSS for styling, creating a responsive and visually appealing experience.`,
      executionSteps: [
        "🎭 Activated demo mode",
        "🔍 Analyzed user request for photo gallery requirements",
        "🎨 Designed goofy photo layout with rotations",
        "🖼️ Implemented image proxy for Google Photos",
        "✨ Added hover animations and transitions",
        "🎪 Applied gradient background and styling",
        "✅ Generated complete React component"
      ]
    };

    if (useStreaming && enableToolCallNotifications) {
      // Return enhanced streaming response with realistic flow
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        start(controller) {
          let step = 0;
          
          const toolCalls = [
            {
              tool: 'analyze_request',
              server: 'reasoning-agent',
              description: 'Analyzing user request for photo gallery requirements',
              baseDelay: 600,
              variance: 400 // 600ms ± 400ms = 200-1000ms
            },
            {
              tool: 'search_photos',
              server: 'google-photos-mcp',
              description: 'Searching for Seattle trip photos in Google Photos',
              baseDelay: 1000,
              variance: 600 // 1000ms ± 600ms = 400-1600ms
            },
            {
              tool: 'design_layout',
              server: 'ui-designer-agent',
              description: 'Designing goofy photo gallery layout with animations',
              baseDelay: 1200,
              variance: 800 // 1200ms ± 800ms = 400-2000ms
            },
            {
              tool: 'generate_ui_component',
              server: 'react-generator-mcp',
              description: 'Generating React component with Tailwind CSS styling',
              baseDelay: 1800,
              variance: 1000 // 1800ms ± 1000ms = 800-2800ms
            },
            {
              tool: 'optimize_images',
              server: 'image-proxy-service',
              description: 'Setting up image proxy to handle CORS restrictions',
              baseDelay: 700,
              variance: 500 // 700ms ± 500ms = 200-1200ms
            }
          ];

          const sendToolCall = (toolCall: typeof toolCalls[0]) => {
            const toolCallData = {
              type: 'tool-call',
              data: {
                tool: toolCall.tool,
                server: toolCall.server,
                description: toolCall.description,
                timestamp: new Date().toISOString()
              }
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolCallData)}\n\n`));
          };

          const getRandomDelay = (baseDelay: number, variance: number) => {
            // Generate random delay within the variance range
            const randomOffset = (Math.random() - 0.5) * 2 * variance;
            return Math.max(200, Math.round(baseDelay + randomOffset)); // Minimum 200ms
          };

          const processNextStep = () => {
            if (step < toolCalls.length) {
              const currentToolCall = toolCalls[step];
              if (currentToolCall) {
                sendToolCall(currentToolCall);
                step++;
                
                const randomDelay = getRandomDelay(currentToolCall.baseDelay, currentToolCall.variance);
                setTimeout(processNextStep, randomDelay);
              }
            } else {
              // Send final response after all tool calls with random delay
              const finalDelay = getRandomDelay(800, 400); // 800ms ± 400ms = 400-1200ms
              setTimeout(() => {
                const finalData = {
                  type: 'final-response',
                  data: mockResponse
                };
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
                controller.close();
              }, finalDelay);
            }
          };

          // Start the process
          processNextStep();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Return regular JSON response with simulated delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json(mockResponse);
    }

  } catch (error) {
    console.error("❌ Error in demo mode:", error);
    
    return NextResponse.json({
      text: "I'm sorry, but I encountered an error in demo mode. Please try again.",
      canvasData: { type: "error" }
    }, { status: 500 });
  }
} 