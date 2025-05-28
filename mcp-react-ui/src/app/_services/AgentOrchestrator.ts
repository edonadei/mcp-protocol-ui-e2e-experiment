import { ReasoningAgent } from "./ReasoningAgent";
import type { AgentPlan, AgentAction } from "./ReasoningAgent";
import { McpClientService } from "./McpClientService";

import type { Message } from "../_components/ChatMessage";

export interface ExecutionResult {
  success: boolean;
  data: any;
  error?: string;
  generatedCode?: string;
  componentType?: string;
  canvasData?: Record<string, any>;
}

export interface AgentResponse {
  text: string;
  reasoning: string;
  executionSteps: string[];
  generatedCode?: string;
  componentType?: string;
  canvasData?: Record<string, any>;
  photos?: any[];
}

export interface ToolCallNotification {
  tool: string;
  server: string;
  description: string;
  timestamp: Date;
}

export type ToolCallCallback = (notification: ToolCallNotification) => void;

export class AgentOrchestrator {
  private reasoningAgent: ReasoningAgent;
  private mcpClientService: typeof McpClientService;
  private toolCallCallback?: ToolCallCallback;

  constructor(apiKey: string, toolCallCallback?: ToolCallCallback) {
    this.reasoningAgent = new ReasoningAgent(apiKey);
    this.mcpClientService = McpClientService;
    this.toolCallCallback = toolCallCallback;
  }

  async processUserRequest(messages: Message[]): Promise<AgentResponse> {
    try {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        throw new Error("No user message found");
      }

      console.log("🤖 Analyzing user request:", lastMessage.content);

      // Step 1: Analyze the request and create a plan
      const plan = await this.reasoningAgent.analyzeRequest(lastMessage.content);
      console.log("📋 Generated plan:", plan);

      // Step 2: Execute the plan
      const executionResults = await this.executePlan(plan);
      console.log("✅ Execution results:", executionResults);

      // Step 3: Combine results and generate response
      return this.generateResponse(plan, executionResults);

    } catch (error) {
      console.error("❌ Error in agent orchestrator:", error);
      
      // Fallback to basic MCP service
      const fallbackResponse = await this.mcpClientService.processMessage(messages);
      return {
        text: fallbackResponse.text,
        reasoning: "Fallback to basic UI generation due to orchestration error",
        executionSteps: ["Generated basic UI component"],
        generatedCode: fallbackResponse.generatedCode,
        componentType: fallbackResponse.componentType,
        canvasData: fallbackResponse.canvasData
      };
    }
  }

  private async executePlan(plan: AgentPlan): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    let previousResults: any = {};

    for (const action of plan.actions) {
      console.log(`🔄 Executing action: ${action.description}`);
      
      try {
        const result = await this.executeAction(action, previousResults);
        results.push(result);
        
        // Store results for next action
        if (result.success) {
          previousResults[action.server] = result.data;
        }
      } catch (error) {
        console.error(`❌ Error executing action ${action.description}:`, error);
        results.push({
          success: false,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return results;
  }

  private async executeAction(action: AgentAction, previousResults: any): Promise<ExecutionResult> {
    // Send tool call notification
    if (this.toolCallCallback) {
      this.toolCallCallback({
        tool: action.tool,
        server: action.server,
        description: action.description,
        timestamp: new Date()
      });
    }

    switch (action.server) {
      case "google-photos":
        return await this.executeGooglePhotosAction(action, previousResults);
      
      case "ui-generator":
        return await this.executeUIGeneratorAction(action, previousResults);
      
      default:
        throw new Error(`Unknown server: ${action.server}`);
    }
  }

  private async executeGooglePhotosAction(action: AgentAction, previousResults: any): Promise<ExecutionResult> {
    try {
      console.log('🔧 [AGENT_ORCHESTRATOR] Executing Google Photos action:', action.tool);
      console.log('📋 [AGENT_ORCHESTRATOR] Action arguments:', JSON.stringify(action.arguments, null, 2));
      
      // Use HTTP bridge instead of mock service
      const response = await fetch('http://localhost:3001/call-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: action.tool,
          arguments: action.arguments || {}
        }),
      });

      if (!response.ok) {
        console.error('❌ [AGENT_ORCHESTRATOR] HTTP bridge error:', response.status, response.statusText);
        throw new Error(`HTTP bridge responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ [AGENT_ORCHESTRATOR] Tool call failed:', result.error);
        throw new Error(result.error || 'Tool call failed');
      }

      console.log('✅ [AGENT_ORCHESTRATOR] Google Photos action completed successfully');
      
      // Log photo details if photos were retrieved
      if (result.data && result.data.photos && Array.isArray(result.data.photos)) {
        console.log(`📸 [AGENT_ORCHESTRATOR] Retrieved ${result.data.photos.length} photos from Google Photos`);
      }
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error(`❌ [AGENT_ORCHESTRATOR] Error executing Google Photos action ${action.tool}:`, error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private async executeUIGeneratorAction(action: AgentAction, previousResults: any): Promise<ExecutionResult> {
    // Enhance arguments with data from previous results
    const enhancedArguments = { ...action.arguments };
    
    // If we have photos from previous steps, include them
    const photosData = previousResults["google-photos"];
    if (photosData) {
      enhancedArguments.photos = photosData.photos || photosData.downloadedPhotos;
      enhancedArguments.location = photosData.location;
      enhancedArguments.searchQuery = photosData.searchQuery;
    }

    // Create a mock message for the MCP client
    const mockMessages: Message[] = [
      {
        id: "mock",
        role: "user",
        content: this.createEnhancedPrompt(action, enhancedArguments),
        timestamp: new Date()
      }
    ];

    const mcpResult = await this.mcpClientService.processMessage(mockMessages);
    
    return {
      success: true,
      data: mcpResult,
      generatedCode: mcpResult.generatedCode,
      componentType: mcpResult.componentType,
      canvasData: mcpResult.canvasData
    };
  }

  private createEnhancedPrompt(action: AgentAction, actionArgs: any): string {
    let prompt = actionArgs.description || "Create a UI component";

    if (actionArgs.photos && actionArgs.photos.length > 0) {
      prompt += `\n\nInclude these photos in the component (use the provided URLs, do not use placeholder URLs):`;
      actionArgs.photos.forEach((photo: any, index: number) => {
        prompt += `\n- Photo ${index + 1}: ${photo.filename || photo.name || `photo_${index + 1}`}`;
        if (photo.description) prompt += ` (${photo.description})`;
        if (photo.downloadUrl) prompt += `\n  Image URL: ${photo.downloadUrl}`;
        if (photo.thumbnailUrl) prompt += `\n  Thumbnail URL: ${photo.thumbnailUrl}`;
        if (photo.mediaMetadata?.creationTime) prompt += `\n  Date: ${photo.mediaMetadata.creationTime}`;
      });
      
      prompt += `\n\nIMPORTANT: Use the exact URLs provided above for the images. Do not use placeholder URLs or mock data.`;
    }

    if (actionArgs.location) {
      prompt += `\n\nLocation context: ${actionArgs.location}`;
    }

    if (actionArgs.searchQuery) {
      prompt += `\n\nSearch context: ${actionArgs.searchQuery}`;
    }

    // Add specific instructions based on the tool
    switch (action.tool) {
      case "create_dashboard":
        prompt += `\n\nCreate an interactive dashboard that displays the photos in a beautiful grid layout with:
        - Photo thumbnails with hover effects using the provided downloadUrl/thumbnailUrl
        - Photo metadata (date, location if available) from the actual photo data
        - Filtering and sorting options
        - Responsive design for mobile and desktop
        - Use the exact image URLs provided above, not placeholder images`;
        break;

      case "create_form":
        prompt += `\n\nCreate a form component with proper validation and styling.`;
        break;

      default:
        prompt += `\n\nCreate a modern, interactive component with proper styling and functionality. Use the actual photo data and URLs provided above.`;
    }

    return prompt;
  }

  private generateResponse(plan: AgentPlan, results: ExecutionResult[]): AgentResponse {
    const executionSteps = results.map((result, index) => {
      const action = plan.actions[index];
      if (!action) return "❌ Unknown action";
      return result.success 
        ? `✅ ${action.description}`
        : `❌ ${action.description} (Error: ${result.error})`;
    });

    // Find the UI generation result
    const uiResult = results.find(r => r.generatedCode);
    
    // Find photos data
    const photosResult = results.find(r => r.data?.photos || r.data?.downloadedPhotos);
    const photos = photosResult?.data?.photos || photosResult?.data?.downloadedPhotos;

    let responseText = `I've analyzed your request and executed the following steps:\n\n`;
    responseText += `**Reasoning:** ${plan.reasoning}\n\n`;
    responseText += `**Execution Steps:**\n${executionSteps.join('\n')}\n\n`;
    
    if (photos && photos.length > 0) {
      responseText += `**Found ${photos.length} photos** that match your request.\n\n`;
    }

    responseText += `**Result:** ${plan.expectedOutput}`;

    return {
      text: responseText,
      reasoning: plan.reasoning,
      executionSteps,
      generatedCode: uiResult?.generatedCode,
      componentType: uiResult?.componentType,
      canvasData: uiResult?.canvasData,
      photos
    };
  }
} 