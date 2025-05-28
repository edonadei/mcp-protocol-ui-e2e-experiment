import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export interface AgentAction {
  type: 'mcp_call' | 'data_processing' | 'ui_generation';
  server: string;
  tool: string;
  arguments: Record<string, unknown>;
  description: string;
}

export interface AgentPlan {
  reasoning: string;
  actions: AgentAction[];
  expectedOutput: string;
}

export interface McpServer {
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
}

export class ReasoningAgent {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private availableServers: McpServer[] = [
    {
      name: "ui-generator",
      description: "Generates React UI components using AI",
      capabilities: ["ui_generation", "dashboard_creation", "form_creation"],
      tools: ["generate_ui_component", "create_dashboard", "create_form"]
    },
    {
      name: "google-photos",
      description: "Retrieves and manages Google Photos",
      capabilities: ["photo_retrieval", "photo_search", "photo_download"],
      tools: ["search_photos", "get_recent_photos", "get_trip_photos", "get_albums", "get_album_photos", "get_photo_details"]
    }
  ];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
  }

  async analyzeRequest(userMessage: string): Promise<AgentPlan> {
    const systemPrompt = `You are an intelligent reasoning agent that analyzes user requests and creates execution plans using available MCP servers.

Available MCP Servers:
${this.availableServers.map(server => 
  `- ${server.name}: ${server.description}
    Capabilities: ${server.capabilities.join(', ')}
    Tools: ${server.tools.join(', ')}`
).join('\n')}

Your task is to analyze the user's request and create a step-by-step execution plan. Consider:
1. What data needs to be retrieved?
2. What processing needs to be done?
3. What UI components need to be generated?
4. What is the optimal sequence of operations?

Return a JSON response with this structure:
{
  "reasoning": "Explanation of your analysis and why you chose this approach",
  "actions": [
    {
      "type": "mcp_call" | "data_processing" | "ui_generation",
      "server": "server_name",
      "tool": "tool_name", 
      "arguments": { "key": "value" },
      "description": "What this step accomplishes"
    }
  ],
  "expectedOutput": "Description of what the user will receive"
}

Examples of user requests and appropriate responses:

User: "Show me photos from my last trip to Seattle"
Response: Use google-photos server to search for Seattle trip photos, then ui-generator to create a photo gallery dashboard.

User: "Create a dashboard with my recent photos"
Response: Use google-photos server to get recent photos, then ui-generator to create a dashboard displaying them.

User: "Can you remind me my last trip in seattle"
Response: Use google-photos server to find Seattle trip photos, download them, then ui-generator to create a trip memory dashboard.

Analyze this user request and provide the execution plan:`;

    try {
      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: `User Request: "${userMessage}"` }
      ]);

      const response = result.response.text();
      
      // Extract JSON from the response
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = jsonRegex.exec(response);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const plan: AgentPlan = JSON.parse(jsonMatch[0]) as AgentPlan;
      
      // Validate the plan
      this.validatePlan(plan);
      
      return plan;
    } catch (error) {
      console.error("Error analyzing request:", error);
      
      // Fallback plan for UI generation only
      return {
        reasoning: "Fallback to basic UI generation due to analysis error",
        actions: [{
          type: "ui_generation",
          server: "ui-generator", 
          tool: "generate_ui_component",
          arguments: { description: userMessage },
          description: "Generate a basic UI component based on the request"
        }],
        expectedOutput: "A generated UI component"
      };
    }
  }

  private validatePlan(plan: AgentPlan): void {
    if (!plan.reasoning || !plan.actions || !plan.expectedOutput) {
      throw new Error("Invalid plan structure");
    }

    for (const action of plan.actions) {
      const server = this.availableServers.find(s => s.name === action.server);
      if (!server) {
        throw new Error(`Unknown server: ${action.server}`);
      }

      if (!server.tools.includes(action.tool)) {
        throw new Error(`Tool ${action.tool} not available on server ${action.server}`);
      }
    }
  }

  getAvailableServers(): McpServer[] {
    return [...this.availableServers];
  }

  addServer(server: McpServer): void {
    this.availableServers.push(server);
  }
} 