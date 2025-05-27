import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env";
import { NextRequest, NextResponse } from "next/server";

// Define types for the messages
interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

// System prompt to guide the LLM's responses
const SYSTEM_PROMPT = `You are an expert React developer who specializes in creating Tailwind CSS UI components. Your task is to generate ready-to-use React components based on the user's request.

IMPORTANT GUIDELINES:
1. Return ONLY the JSX code - no explanations or commentary.
2. Create self-contained components that can be directly rendered.
3. Use Tailwind CSS for all styling - never use inline styles or CSS.
4. Include state management with React.useState for interactive elements.
5. Create responsive components using Tailwind's responsive classes.
6. Follow modern, clean design principles with:
   - Proper spacing and padding
   - Readable typography
   - Accessible color contrast
   - Subtle shadows and rounded corners
7. Add realistic placeholder data when needed (don't use lorem ipsum).
8. Ensure proper HTML semantics and accessibility.

COMPONENT STRUCTURE REQUIREMENTS:
- ALWAYS use a basic function component with this structure:
  \`\`\`jsx
  function MyComponent() {
    // State declarations with React.useState
    const [count, setCount] = React.useState(0);
    
    // Event handlers as needed
    function handleClick() {
      setCount(count + 1);
    }
    
    // Return JSX
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Component UI here */}
        <h2 className="text-xl font-bold">My Component</h2>
        <p>Count: {count}</p>
        <button 
          onClick={handleClick}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Increment
        </button>
      </div>
    );
  }
  \`\`\`

CRITICAL REQUIREMENTS:
- DO NOT use import statements - React is already available globally
- DO NOT use export statements
- DO NOT use arrow functions for the main component
- ALWAYS use React.useState instead of destructuring useState
- ALWAYS use React.useEffect instead of destructuring useEffect
- ALWAYS use React.useRef instead of destructuring useRef
- Make sure the component renders UI elements with proper Tailwind styling

RESPONSE FORMAT:
Return ONLY the component code without explanation. The code must be ready to execute as-is in a browser environment where React and ReactDOM are already loaded.`;

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const messages = body.messages as Message[];
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided or invalid messages format" },
        { status: 400 }
      );
    }
    
    // Initialize the Gemini API client
    const apiKey = env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return NextResponse.json(
        { error: "Invalid last message" },
        { status: 400 }
      );
    }
    
    // Format history for the chat
    const history = messages.slice(0, -1).map((msg, index) => {
      if (index === 0 && msg.role === "user") {
        return {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser request: ${msg.content}` }],
        };
      }
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.role === "user" ? `Continuing with the same UI style guidelines. User request: ${msg.content}` : msg.content }],
      };
    });
    
    // Start a chat session
    const chat = model.startChat({
      history: history,
    });
    
    // Prepare message with system prompt if it's the first message
    let messageToSend: string;
    if (messages.length === 1) {
      messageToSend = `${SYSTEM_PROMPT}\n\nUser request: ${lastMessage.content}`;
    } else {
      messageToSend = `Continuing with the same UI style guidelines. User request: ${lastMessage.content}`;
    }
    
    // Generate a response
    const result = await chat.sendMessage(messageToSend);
    const response = result.response;
    const responseText = response.text();
    
    // Return the LLM response
    return NextResponse.json({
      text: responseText
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error calling Gemini API:", errorMessage);
    
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
} 