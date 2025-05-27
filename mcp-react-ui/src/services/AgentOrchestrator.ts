import { ReasoningAgent } from './ReasoningAgent';
import { McpClientService } from './McpClientService';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { spawn } from 'child_process';
import path from 'path';

export interface ExecutionPlan {
  reasoning: string;
  actions: Array<{
    server: string;
    tool: string;
    arguments: Record<string, any>;
    description: string;
  }>;
  expectedOutput: string;
}

export interface ToolCallNotification {
  server: string;
  tool: string;
  arguments: Record<string, any>;
  description: string;
  timestamp: number;
}

export type ToolCallCallback = (notification: ToolCallNotification) => void;

export class AgentOrchestrator {
  private reasoningAgent: ReasoningAgent;
  private mcpClient: McpClientService;

  constructor(apiKey: string) {
    this.reasoningAgent = new ReasoningAgent(apiKey);
    this.mcpClient = new McpClientService();
  }

  async processRequest(
    userMessage: string, 
    onToolCall?: ToolCallCallback
  ): Promise<{
    response: string;
    reasoning?: string;
    executionSteps?: string[];
    photos?: any[];
  }> {
    try {
      console.log('🤖 Processing user request:', userMessage);

      // Step 1: Generate execution plan
      const plan = await this.reasoningAgent.createExecutionPlan(userMessage);
      console.log('📋 Generated execution plan:', plan);

      // Step 2: Execute the plan
      const executionResults = await this.executePlan(plan, onToolCall);
      console.log('✅ Execution results:', executionResults);

      // Step 3: Generate final response
      const finalResponse = await this.generateFinalResponse(
        userMessage,
        plan,
        executionResults
      );

      return {
        response: finalResponse,
        reasoning: plan.reasoning,
        executionSteps: executionResults.steps,
        photos: executionResults.photos
      };

    } catch (error) {
      console.error('❌ Error in AgentOrchestrator:', error);
      return {
        response: `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or rephrase your request.`
      };
    }
  }

  private async executePlan(
    plan: ExecutionPlan, 
    onToolCall?: ToolCallCallback
  ): Promise<{
    steps: string[];
    photos: any[];
    data: Record<string, any>;
  }> {
    const steps: string[] = [];
    const allPhotos: any[] = [];
    const executionData: Record<string, any> = {};

    for (const action of plan.actions) {
      try {
        // Notify about tool call
        if (onToolCall) {
          onToolCall({
            server: action.server,
            tool: action.tool,
            arguments: action.arguments,
            description: action.description,
            timestamp: Date.now()
          });
        }

        console.log(`🔧 Executing action: ${action.server}.${action.tool}`);
        
        const result = await this.executeAction(action);
        
        // Store execution data for potential use by subsequent actions
        executionData[`${action.server}_${action.tool}`] = result;
        
        // Extract photos if present
        if (result.photos && Array.isArray(result.photos)) {
          allPhotos.push(...result.photos);
        }
        
        steps.push(`✅ ${action.description}: ${this.summarizeResult(result)}`);
        
      } catch (error) {
        console.error(`❌ Error executing ${action.server}.${action.tool}:`, error);
        steps.push(`❌ ${action.description}: Failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Continue with other actions even if one fails
        continue;
      }
    }

    return {
      steps,
      photos: allPhotos,
      data: executionData
    };
  }

  private async executeAction(action: {
    server: string;
    tool: string;
    arguments: Record<string, any>;
  }): Promise<any> {
    if (action.server === 'ui-generator') {
      // Use existing MCP client for UI generation
      return await this.mcpClient.callTool(action.tool, action.arguments);
    } else if (action.server === 'google-photos') {
      // Use Google Photos MCP server
      return await this.executeGooglePhotosAction(action, onToolCall);
    } else {
      throw new Error(`Unknown server: ${action.server}`);
    }
  }

  private async executeGooglePhotosAction(action: any, onToolCall?: ToolCallCallback): Promise<any> {
    try {
      console.log('🔧 [AGENT_ORCHESTRATOR] Executing Google Photos action:', action.tool);
      console.log('📋 [AGENT_ORCHESTRATOR] Action arguments:', JSON.stringify(action.arguments, null, 2));
      
      onToolCall?.({
        toolName: action.tool,
        arguments: action.arguments || {},
        timestamp: new Date().toISOString()
      });

      // Use HTTP bridge instead of spawning MCP server
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
        
        result.data.photos.forEach((photo: any, index: number) => {
          console.log(`📷 [AGENT_ORCHESTRATOR] Photo ${index + 1}:`, {
            id: photo.id,
            filename: photo.filename || 'Untitled',
            creationTime: photo.mediaMetadata?.creationTime,
            mimeType: photo.mimeType,
            hasDownloadUrl: !!photo.downloadUrl,
            hasThumbnailUrl: !!photo.thumbnailUrl
          });
        });
        
        // Log download URLs for debugging
        console.log('🔗 [AGENT_ORCHESTRATOR] Photo download URLs:');
        result.data.photos.slice(0, 3).forEach((photo: any, index: number) => {
          console.log(`   Photo ${index + 1}: ${photo.downloadUrl || 'No download URL'}`);
        });
      }
      
      if (result.data && result.data.count !== undefined) {
        console.log(`📊 [AGENT_ORCHESTRATOR] Total items found: ${result.data.count}`);
      }

      return result.data;
    } catch (error) {
      console.error(`❌ [AGENT_ORCHESTRATOR] Error executing Google Photos action ${action.tool}:`, error);
      throw error;
    }
  }

  private summarizeResult(result: any): string {
    if (result.photos && Array.isArray(result.photos)) {
      return `Found ${result.photos.length} photos`;
    }
    if (result.albums && Array.isArray(result.albums)) {
      return `Found ${result.albums.length} albums`;
    }
    if (result.count !== undefined) {
      return `Found ${result.count} items`;
    }
    if (result.success) {
      return 'Completed successfully';
    }
    return 'Completed';
  }

  private async generateFinalResponse(
    userMessage: string,
    plan: ExecutionPlan,
    executionResults: { steps: string[]; photos: any[]; data: Record<string, any> }
  ): Promise<string> {
    console.log('🎨 [AGENT_ORCHESTRATOR] Generating final response');
    console.log('📊 [AGENT_ORCHESTRATOR] Execution results summary:', {
      stepsCount: executionResults.steps.length,
      photosCount: executionResults.photos.length,
      dataKeys: Object.keys(executionResults.data)
    });
    
    // If we have photos, pass them to the UI generator
    if (executionResults.photos.length > 0) {
      console.log(`🖼️ [AGENT_ORCHESTRATOR] Passing ${executionResults.photos.length} photos to UI generator`);
      
      // Log details about photos being passed to UI generator
      executionResults.photos.forEach((photo: any, index: number) => {
        console.log(`📷 [AGENT_ORCHESTRATOR] Photo ${index + 1} for UI:`, {
          id: photo.id,
          filename: photo.filename || 'Untitled',
          creationTime: photo.mediaMetadata?.creationTime,
          downloadUrl: photo.downloadUrl ? 'Available' : 'Missing',
          thumbnailUrl: photo.thumbnailUrl ? 'Available' : 'Missing'
        });
      });
      
      try {
        console.log('🔧 [AGENT_ORCHESTRATOR] Calling UI generator with photos...');
        
        const uiResult = await this.mcpClient.callTool('generate_ui_component', {
          photos: executionResults.photos,
          userRequest: userMessage,
          context: `User requested: "${userMessage}". Found ${executionResults.photos.length} photos.`
        });
        
        console.log('✅ [AGENT_ORCHESTRATOR] UI generator completed successfully');
        console.log('📄 [AGENT_ORCHESTRATOR] Generated UI result keys:', Object.keys(uiResult));
        
        return uiResult.html || 'Generated photo dashboard successfully.';
      } catch (error) {
        console.error('❌ [AGENT_ORCHESTRATOR] Error generating UI:', error);
        return `I found ${executionResults.photos.length} photos but encountered an error generating the dashboard. The photos are available for viewing.`;
      }
    }

    // Fallback response
    console.log('📝 [AGENT_ORCHESTRATOR] No photos found, generating text response');
    const stepsSummary = executionResults.steps.join('\n');
    return `I've completed your request. Here's what I did:\n\n${stepsSummary}`;
  }
} 