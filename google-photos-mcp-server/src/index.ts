#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  ListToolsResult,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { OAuthManager } from './oauth-manager.js';
import { GooglePhotosAPI } from './google-photos-api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GooglePhotosMCPServer {
  private server: Server;
  private oauthManager: OAuthManager;
  private photosAPI: GooglePhotosAPI;

  constructor() {
    this.server = new Server(
      {
        name: "google-photos-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize OAuth manager with credentials
    const credentialsPath = path.join(__dirname, '../../client_secret_172980907283-5l6f1sl3fu1npicptp4166atbqmhu1st.apps.googleusercontent.com.json');
    this.oauthManager = new OAuthManager(credentialsPath);
    this.photosAPI = new GooglePhotosAPI(this.oauthManager);

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      return {
        tools: [
          {
            name: "get_auth_url",
            description: "Get OAuth authorization URL for Google Photos access",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "exchange_auth_code",
            description: "Exchange authorization code for access tokens",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Authorization code from OAuth callback",
                },
              },
              required: ["code"],
            },
          },
          {
            name: "get_auth_status",
            description: "Check current authentication status",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "revoke_auth",
            description: "Revoke authentication and clear tokens",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "search_photos",
            description: "Search photos by query, date range, or content categories",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query (e.g., 'vacation', 'people', 'food')",
                },
                startDate: {
                  type: "string",
                  description: "Start date in YYYY-MM-DD format",
                },
                endDate: {
                  type: "string",
                  description: "End date in YYYY-MM-DD format",
                },
                pageSize: {
                  type: "number",
                  description: "Number of photos to return (max 100)",
                  maximum: 100,
                },
              },
            },
          },
          {
            name: "get_recent_photos",
            description: "Get recent photos from Google Photos",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Number of recent photos to retrieve (default 20, max 100)",
                  maximum: 100,
                },
              },
            },
          },
          {
            name: "get_albums",
            description: "Get list of photo albums",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "get_album_photos",
            description: "Get photos from a specific album",
            inputSchema: {
              type: "object",
              properties: {
                albumId: {
                  type: "string",
                  description: "Album ID to retrieve photos from",
                },
              },
              required: ["albumId"],
            },
          },
          {
            name: "get_photo_details",
            description: "Get detailed information about a specific photo",
            inputSchema: {
              type: "object",
              properties: {
                photoId: {
                  type: "string",
                  description: "Photo ID to get details for",
                },
              },
              required: ["photoId"],
            },
          },
          {
            name: "get_trip_photos",
            description: "Get photos from a specific trip or location",
            inputSchema: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "Location or trip destination",
                },
                startDate: {
                  type: "string",
                  description: "Trip start date in YYYY-MM-DD format",
                },
                endDate: {
                  type: "string",
                  description: "Trip end date in YYYY-MM-DD format",
                },
              },
              required: ["location"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_auth_url":
            return await this.handleGetAuthUrl();

          case "exchange_auth_code":
            return await this.handleExchangeAuthCode((args?.code as string) || '');

          case "get_auth_status":
            return await this.handleGetAuthStatus();

          case "revoke_auth":
            return await this.handleRevokeAuth();

          case "search_photos":
            return await this.handleSearchPhotos(args || {});

          case "get_recent_photos":
            return await this.handleGetRecentPhotos((args?.limit as number) || 20);

          case "get_albums":
            return await this.handleGetAlbums();

          case "get_album_photos":
            return await this.handleGetAlbumPhotos((args?.albumId as string) || '');

          case "get_photo_details":
            return await this.handleGetPhotoDetails((args?.photoId as string) || '');

          case "get_trip_photos":
            return await this.handleGetTripPhotos(args || {});

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleGetAuthUrl(): Promise<CallToolResult> {
    console.log('🔐 [GET_AUTH_URL] Generating OAuth authorization URL');
    
    try {
      const authUrl = this.oauthManager.generateAuthUrl();
      console.log('✅ [GET_AUTH_URL] Generated auth URL:', authUrl);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              authUrl,
              message: "Visit this URL to authorize Google Photos access"
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('❌ [GET_AUTH_URL] Error generating auth URL:', error);
      throw error;
    }
  }

  private async handleExchangeAuthCode(code: string): Promise<CallToolResult> {
    console.log('🔐 [EXCHANGE_AUTH_CODE] Starting token exchange for code:', code.substring(0, 10) + '...');
    
    try {
      const tokens = await this.oauthManager.exchangeCodeForTokens(code);
      console.log('✅ [EXCHANGE_AUTH_CODE] Successfully exchanged code for tokens');
      console.log('🔑 [EXCHANGE_AUTH_CODE] Access token received:', tokens.access_token ? 'Yes' : 'No');
      console.log('🔄 [EXCHANGE_AUTH_CODE] Refresh token received:', tokens.refresh_token ? 'Yes' : 'No');
      
      const authStatus = await this.oauthManager.getAuthenticationStatus();
      console.log('👤 [EXCHANGE_AUTH_CODE] User authenticated:', authStatus.userEmail || 'Unknown');
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Successfully authenticated with Google Photos",
              userEmail: authStatus.userEmail,
              expiresAt: authStatus.expiresAt
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('❌ [EXCHANGE_AUTH_CODE] Error exchanging code:', error);
      throw error;
    }
  }

  private async handleGetAuthStatus(): Promise<CallToolResult> {
    console.log('🔐 [GET_AUTH_STATUS] Checking authentication status');
    
    try {
      const authStatus = await this.oauthManager.getAuthenticationStatus();
      console.log('✅ [GET_AUTH_STATUS] Auth status:', authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated');
      
      if (authStatus.isAuthenticated) {
        console.log('👤 [GET_AUTH_STATUS] User:', authStatus.userEmail || 'Unknown');
        console.log('⏰ [GET_AUTH_STATUS] Expires:', authStatus.expiresAt ? new Date(authStatus.expiresAt).toISOString() : 'Unknown');
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(authStatus, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('❌ [GET_AUTH_STATUS] Error checking auth status:', error);
      throw error;
    }
  }

  private async handleRevokeAuth(): Promise<CallToolResult> {
    await this.oauthManager.revokeTokens();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Authentication revoked successfully"
          }, null, 2),
        },
      ],
    };
  }

  private async handleSearchPhotos(args: any): Promise<CallToolResult> {
    console.log('🔍 [SEARCH_PHOTOS] Starting photo search with args:', JSON.stringify(args, null, 2));
    
    try {
      const response = await this.photosAPI.searchPhotos({
        query: args?.query,
        startDate: args?.startDate,
        endDate: args?.endDate,
        pageSize: args?.pageSize || 20
      });

      console.log(`📸 [SEARCH_PHOTOS] Found ${response.mediaItems.length} photos from Google Photos API`);
      
      // Add downloadable URLs to photos
      const photosWithUrls = response.mediaItems.map((photo, index) => {
        const downloadUrl = this.photosAPI.getDownloadableUrl(photo.baseUrl, 1024, 768);
        const thumbnailUrl = this.photosAPI.getDownloadableUrl(photo.baseUrl, 300, 200);
        
        console.log(`📷 [SEARCH_PHOTOS] Photo ${index + 1}: ${photo.filename || 'Untitled'} (${photo.id})`);
        console.log(`   📅 Created: ${photo.mediaMetadata?.creationTime || 'Unknown'}`);
        console.log(`   🔗 Download URL: ${downloadUrl}`);
        
        return {
          ...photo,
          downloadUrl,
          thumbnailUrl
        };
      });

      const result = {
        photos: photosWithUrls,
        count: photosWithUrls.length,
        nextPageToken: response.nextPageToken
      };

      console.log(`✅ [SEARCH_PHOTOS] Returning ${photosWithUrls.length} photos with download URLs`);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('❌ [SEARCH_PHOTOS] Error searching photos:', error);
      throw error;
    }
  }

  private async handleGetRecentPhotos(limit: number = 20): Promise<CallToolResult> {
    console.log(`🔍 [GET_RECENT_PHOTOS] Fetching ${limit} recent photos`);
    
    try {
      const response = await this.photosAPI.getRecentPhotos(limit);
      
      console.log(`📸 [GET_RECENT_PHOTOS] Found ${response.mediaItems.length} recent photos from Google Photos API`);
      
      const photosWithUrls = response.mediaItems.map((photo, index) => {
        const downloadUrl = this.photosAPI.getDownloadableUrl(photo.baseUrl, 1024, 768);
        const thumbnailUrl = this.photosAPI.getDownloadableUrl(photo.baseUrl, 300, 200);
        
        console.log(`📷 [GET_RECENT_PHOTOS] Photo ${index + 1}: ${photo.filename || 'Untitled'} (${photo.id})`);
        console.log(`   📅 Created: ${photo.mediaMetadata?.creationTime || 'Unknown'}`);
        console.log(`   🔗 Download URL: ${downloadUrl}`);
        
        return {
          ...photo,
          downloadUrl,
          thumbnailUrl
        };
      });

      const result = {
        photos: photosWithUrls,
        count: photosWithUrls.length
      };

      console.log(`✅ [GET_RECENT_PHOTOS] Returning ${photosWithUrls.length} photos with download URLs`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('❌ [GET_RECENT_PHOTOS] Error getting recent photos:', error);
      throw error;
    }
  }

  private async handleGetAlbums(): Promise<CallToolResult> {
    const response = await this.photosAPI.getAlbums();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            albums: response.albums,
            count: response.albums.length
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetAlbumPhotos(albumId: string): Promise<CallToolResult> {
    const response = await this.photosAPI.getAlbumPhotos(albumId);
    
    const photosWithUrls = response.mediaItems.map(photo => ({
      ...photo,
      downloadUrl: this.photosAPI.getDownloadableUrl(photo.baseUrl, 1024, 768),
      thumbnailUrl: this.photosAPI.getDownloadableUrl(photo.baseUrl, 300, 200)
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            photos: photosWithUrls,
            count: photosWithUrls.length,
            albumId
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetPhotoDetails(photoId: string): Promise<CallToolResult> {
    const photo = await this.photosAPI.getPhotoDetails(photoId);
    
    if (!photo) {
      throw new Error(`Photo with ID ${photoId} not found`);
    }

    const photoWithUrls = {
      ...photo,
      downloadUrl: this.photosAPI.getDownloadableUrl(photo.baseUrl, 1024, 768),
      thumbnailUrl: this.photosAPI.getDownloadableUrl(photo.baseUrl, 300, 200)
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(photoWithUrls, null, 2),
        },
      ],
    };
  }

  private async handleGetTripPhotos(args: any): Promise<CallToolResult> {
    // Search for photos by location and date range
    const searchParams: any = {
      query: args?.location,
      pageSize: 50
    };

    if (args?.startDate) {
      searchParams.startDate = args.startDate;
    }
    if (args?.endDate) {
      searchParams.endDate = args.endDate;
    }

    const response = await this.photosAPI.searchPhotos(searchParams);
    
    const photosWithUrls = response.mediaItems.map(photo => ({
      ...photo,
      downloadUrl: this.photosAPI.getDownloadableUrl(photo.baseUrl, 1024, 768),
      thumbnailUrl: this.photosAPI.getDownloadableUrl(photo.baseUrl, 300, 200),
      tripLocation: args?.location
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            photos: photosWithUrls,
            count: photosWithUrls.length,
            location: args?.location,
            dateRange: {
              startDate: args?.startDate,
              endDate: args?.endDate
            }
          }, null, 2),
        },
      ],
    };
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    // Load existing tokens if available
    await this.oauthManager.loadTokens();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Google Photos MCP server running on stdio");
  }
}

const server = new GooglePhotosMCPServer();
server.run().catch(console.error); 