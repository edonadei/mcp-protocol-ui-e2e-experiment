#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListUITemplatesRequestSchema,
  GetUITemplateRequestSchema,
  RenderUIRequestSchema,
  ValidateUIRequestSchema,
  UITemplate,
  UIComponent,
  UIComponentType,
  CallToolResult,
  CallToolRequest,
  GetUITemplateRequest,
  RenderUIRequest,
  ValidateUIRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * MCP Server with UI rendering capabilities using Gemini AI
 * 
 * This server provides:
 * - AI-powered UI component generation using Gemini
 * - Interactive dashboard creation
 * - Dynamic form building
 * - Data visualization components
 * - Real-time UI rendering
 */

// System prompt for Gemini AI (adapted from the route.ts file)
const UI_GENERATION_PROMPT = `You are an expert React developer who specializes in creating Tailwind CSS UI components for MCP (Model Context Protocol) applications. Your task is to generate ready-to-use React components based on the user's request.

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

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("❌ GOOGLE_API_KEY environment variable is required");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// UI Templates for the MCP server
const templates: UITemplate[] = [
  {
    name: "ai-dashboard",
    description: "AI-generated interactive dashboard with metrics, charts, and data tables",
    schema: {
      rootComponent: "container" as UIComponentType,
      allowedComponents: ["container", "text", "card", "chart", "table", "progress", "button"] as UIComponentType[],
      componentSchemas: {
        container: {
          properties: {
            layout: { type: "string", enum: ["grid", "flex", "stack"] },
            columns: { type: "number", minimum: 1, maximum: 12 }
          }
        },
        card: {
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            variant: { type: "string", enum: ["default", "outlined", "elevated"] }
          }
        },
        chart: {
          properties: {
            type: { type: "string", enum: ["line", "bar", "pie", "area", "doughnut"] },
            data: { type: "array" },
            xAxis: { type: "string" },
            yAxis: { type: "string" }
          },
          required: ["type", "data"]
        }
      },
      maxDepth: 5,
      allowCustomComponents: true,
      styling: {
        allowInlineStyles: true,
        allowArbitraryClasses: true
      }
    }
  },
  {
    name: "ai-form",
    description: "AI-generated dynamic form with validation and modern styling",
    schema: {
      rootComponent: "form" as UIComponentType,
      allowedComponents: ["form", "input", "select", "checkbox", "radio", "textarea", "button", "text"] as UIComponentType[],
      componentSchemas: {
        form: {
          properties: {
            action: { type: "string" },
            method: { type: "string", enum: ["GET", "POST"] },
            validation: { type: "object" }
          }
        },
        input: {
          properties: {
            type: { type: "string", enum: ["text", "email", "password", "number", "date", "tel", "url"] },
            placeholder: { type: "string" },
            required: { type: "boolean" },
            validation: { type: "object" }
          },
          required: ["type"]
        }
      },
      maxDepth: 3,
      allowCustomComponents: true
    }
  },
  {
    name: "ai-component",
    description: "AI-generated custom component based on user specifications",
    schema: {
      rootComponent: "container" as UIComponentType,
      allowedComponents: ["container", "text", "button", "input", "card", "table", "chart", "form", "select", "checkbox", "radio", "textarea", "progress"] as UIComponentType[],
      componentSchemas: {},
      maxDepth: 10,
      allowCustomComponents: true,
      styling: {
        allowInlineStyles: true,
        allowArbitraryClasses: true
      }
    }
  }
];

// Create the MCP server
const server = new Server(
  {
    name: "mcp-ui-ai-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      ui: {
        templates: true,
        rendering: true,
        validation: true,
        listChanged: true,
      },
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_ui_component",
        description: "Generate a React UI component using AI based on user specifications",
        inputSchema: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Description of the UI component to generate (e.g., 'a user profile card with avatar and contact info')"
            },
            type: {
              type: "string",
              enum: ["dashboard", "form", "card", "table", "chart", "button", "input", "custom"],
              description: "Type of component to generate"
            },
            theme: {
              type: "string",
              enum: ["light", "dark", "auto"],
              default: "light",
              description: "Theme for the component"
            },
            data: {
              type: "object",
              description: "Optional data to populate the component with"
            }
          },
          required: ["description", "type"]
        }
      },
      {
        name: "create_dashboard",
        description: "Create an AI-generated interactive dashboard with metrics and visualizations",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Dashboard title"
            },
            metrics: {
              type: "array",
              description: "Array of metrics to display",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  change: { type: "string" },
                  icon: { type: "string" }
                }
              }
            },
            theme: {
              type: "string",
              enum: ["light", "dark", "auto"],
              default: "light"
            }
          },
          required: ["title"]
        }
      },
      {
        name: "create_form",
        description: "Create an AI-generated dynamic form with validation",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Form title"
            },
            fields: {
              type: "array",
              description: "Array of form fields",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  label: { type: "string" },
                  required: { type: "boolean" },
                  placeholder: { type: "string" },
                  options: { type: "array" }
                }
              }
            },
            theme: {
              type: "string",
              enum: ["light", "dark", "auto"],
              default: "light"
            }
          },
          required: ["title", "fields"]
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "generate_ui_component":
      return await generateUIComponent(args);
    case "create_dashboard":
      return await createAIDashboard(args);
    case "create_form":
      return await createAIForm(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available UI templates
server.setRequestHandler(ListUITemplatesRequestSchema, async () => {
  return {
    templates: templates
  };
});

// Get specific UI template
server.setRequestHandler(GetUITemplateRequestSchema, async (request: GetUITemplateRequest) => {
  const template = templates.find(t => t.name === request.params.name);
  if (!template) {
    throw new Error(`Template '${request.params.name}' not found`);
  }
  return { template };
});

// Render UI using templates
server.setRequestHandler(RenderUIRequestSchema, async (request: RenderUIRequest) => {
  const { templateName, data, context, preferences } = request.params;
  
  switch (templateName) {
    case "ai-dashboard":
      return await renderAIDashboard(data, context, preferences);
    case "ai-form":
      return await renderAIForm(data, context, preferences);
    case "ai-component":
      return await renderAIComponent(data, context, preferences);
    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
});

// Validate UI components
server.setRequestHandler(ValidateUIRequestSchema, async (request: ValidateUIRequest) => {
  const { component, templateName } = request.params;
  const template = templates.find(t => t.name === templateName);
  
  if (!template) {
    return {
      valid: false,
      errors: [`Template '${templateName}' not found`]
    };
  }

  // Basic validation - in a real implementation, you'd validate against the schema
  const errors: string[] = [];
  
  if (!component.type) {
    errors.push("Component type is required");
  }
  
  if (template.schema.allowedComponents && !template.schema.allowedComponents.includes(component.type)) {
    errors.push(`Component type '${component.type}' is not allowed in template '${templateName}'`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
});

// AI-powered UI generation functions
async function generateUIComponent(args: any): Promise<CallToolResult> {
  try {
    const { description, type, theme = "light", data } = args;
    
    let prompt = `${UI_GENERATION_PROMPT}\n\nGenerate a ${type} component: ${description}`;
    
    if (data) {
      prompt += `\n\nUse this data in the component: ${JSON.stringify(data, null, 2)}`;
    }
    
    if (theme === "dark") {
      prompt += "\n\nUse dark theme classes (dark:bg-gray-800, dark:text-white, etc.)";
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedCode = response.text();

    // Create a UI component structure
    const uiComponent: UIComponent = {
      type: "container" as UIComponentType,
      props: {
        className: `ai-generated-${type} ${theme === "dark" ? "dark" : ""}`,
        generatedCode: generatedCode,
        description: description,
        theme: theme
      },
      children: []
    };

    return {
      content: [
        {
          type: "text",
          text: `✅ Generated ${type} component: ${description}`
        },
        {
          type: "ui",
          component: uiComponent
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error generating UI component: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
}

async function createAIDashboard(args: any): Promise<CallToolResult> {
  try {
    const { title, metrics = [], theme = "light" } = args;
    
    let prompt = `${UI_GENERATION_PROMPT}\n\nCreate a modern dashboard component with the title "${title}".`;
    
    if (metrics.length > 0) {
      prompt += `\n\nInclude these metrics: ${JSON.stringify(metrics, null, 2)}`;
    } else {
      prompt += "\n\nInclude sample metrics like revenue, users, orders, and growth rate.";
    }
    
    prompt += "\n\nThe dashboard should have:\n- A header with the title\n- Metric cards in a grid layout\n- Charts or visualizations\n- Modern, clean design with Tailwind CSS";
    
    if (theme === "dark") {
      prompt += "\n\nUse dark theme styling.";
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedCode = response.text();

    const uiComponent: UIComponent = {
      type: "container" as UIComponentType,
      props: {
        className: `ai-dashboard ${theme === "dark" ? "dark" : ""}`,
        title: title,
        generatedCode: generatedCode,
        theme: theme
      },
      children: []
    };

    return {
      content: [
        {
          type: "text",
          text: `📊 Generated AI Dashboard: ${title}`
        },
        {
          type: "ui",
          component: uiComponent
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating dashboard: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
}

async function createAIForm(args: any): Promise<CallToolResult> {
  try {
    const { title, fields, theme = "light" } = args;
    
    let prompt = `${UI_GENERATION_PROMPT}\n\nCreate a modern form component with the title "${title}".`;
    
    prompt += `\n\nInclude these form fields: ${JSON.stringify(fields, null, 2)}`;
    
    prompt += "\n\nThe form should have:\n- Proper validation styling\n- Modern input designs\n- Submit button\n- Responsive layout\n- Accessible labels and placeholders";
    
    if (theme === "dark") {
      prompt += "\n\nUse dark theme styling.";
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedCode = response.text();

    const uiComponent: UIComponent = {
      type: "form" as UIComponentType,
      props: {
        className: `ai-form ${theme === "dark" ? "dark" : ""}`,
        title: title,
        generatedCode: generatedCode,
        theme: theme
      },
      children: []
    };

    return {
      content: [
        {
          type: "text",
          text: `📝 Generated AI Form: ${title}`
        },
        {
          type: "ui",
          component: uiComponent
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating form: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
}

// Template rendering functions
async function renderAIDashboard(data: any, context: any, preferences: any) {
  const prompt = `${UI_GENERATION_PROMPT}\n\nCreate a dashboard component using this data: ${JSON.stringify(data, null, 2)}`;
  
  try {
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();
    
    return {
      component: {
        type: "container" as UIComponentType,
        props: {
          className: "ai-rendered-dashboard",
          generatedCode: generatedCode
        },
        children: []
      }
    };
  } catch (error) {
    throw new Error(`Failed to render AI dashboard: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function renderAIForm(data: any, context: any, preferences: any) {
  const prompt = `${UI_GENERATION_PROMPT}\n\nCreate a form component using this data: ${JSON.stringify(data, null, 2)}`;
  
  try {
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();
    
    return {
      component: {
        type: "form" as UIComponentType,
        props: {
          className: "ai-rendered-form",
          generatedCode: generatedCode
        },
        children: []
      }
    };
  } catch (error) {
    throw new Error(`Failed to render AI form: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function renderAIComponent(data: any, context: any, preferences: any) {
  const prompt = `${UI_GENERATION_PROMPT}\n\nCreate a custom component using this data: ${JSON.stringify(data, null, 2)}`;
  
  try {
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();
    
    return {
      component: {
        type: "container" as UIComponentType,
        props: {
          className: "ai-rendered-component",
          generatedCode: generatedCode
        },
        children: []
      }
    };
  } catch (error) {
    throw new Error(`Failed to render AI component: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Start the server
async function main() {
  console.log("🚀 Starting MCP UI Server with Gemini AI");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("🤖 AI Model: gemini-2.5-flash-preview-05-20");
  console.log("🎨 UI Templates:", templates.length);
  console.log("🛠️  Available Tools: 3");
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log("✅ MCP UI Server with Gemini AI running on stdio");
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log("\n🛑 Shutting down MCP UI Server...");
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log("\n🛑 Shutting down MCP UI Server...");
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("❌ Failed to start MCP UI Server:", error);
  process.exit(1);
}); 