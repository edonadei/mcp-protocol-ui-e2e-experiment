import { google } from 'googleapis';
import type { OAuthManager } from './oauth-manager.js';
import type { 
  PhotoItem, 
  Album, 
  SearchPhotosParams, 
  PhotosResponse, 
  AlbumsResponse 
} from './types.js';

export class GooglePhotosAPI {
  private oauthManager: OAuthManager;

  constructor(oauthManager: OAuthManager) {
    this.oauthManager = oauthManager;
  }

  private async makePhotosRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const accessToken = await this.oauthManager.getValidAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const baseUrl = 'https://photoslibrary.googleapis.com/v1';
    const url = `${baseUrl}${endpoint}`;

    const options: any = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchPhotos(params: {
    query?: string;
    startDate?: string;
    endDate?: string;
    pageSize?: number;
  }): Promise<{ mediaItems: PhotoItem[]; nextPageToken?: string }> {
    console.log('🌐 [GOOGLE_PHOTOS_API] Starting searchPhotos with params:', JSON.stringify(params, null, 2));
    
    const accessToken = await this.oauthManager.getValidAccessToken();
    if (!accessToken) {
      console.error('❌ [GOOGLE_PHOTOS_API] No valid access token available');
      throw new Error('Not authenticated with Google Photos');
    }

    console.log('🔑 [GOOGLE_PHOTOS_API] Using access token:', accessToken.substring(0, 20) + '...');

    try {
      const requestBody: any = {
        pageSize: params.pageSize || 20,
      };

      // Add filters if provided
      if (params.query || params.startDate || params.endDate) {
        requestBody.filters = {};
        
        if (params.query) {
          console.log('🔍 [GOOGLE_PHOTOS_API] Adding content filter for query:', params.query);
          requestBody.filters.contentFilter = {
            includedContentCategories: this.getContentCategories(params.query)
          };
        }

        if (params.startDate || params.endDate) {
          console.log('📅 [GOOGLE_PHOTOS_API] Adding date filter:', { startDate: params.startDate, endDate: params.endDate });
          requestBody.filters.dateFilter = {
            ranges: [{
              startDate: params.startDate ? this.parseDate(params.startDate) : undefined,
              endDate: params.endDate ? this.parseDate(params.endDate) : undefined,
            }]
          };
        }
      }

      console.log('📤 [GOOGLE_PHOTOS_API] Making API request to search endpoint');
      console.log('📋 [GOOGLE_PHOTOS_API] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 [GOOGLE_PHOTOS_API] API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GOOGLE_PHOTOS_API] API error response:', errorText);
        throw new Error(`Google Photos API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 [GOOGLE_PHOTOS_API] API response data keys:', Object.keys(data));
      console.log('📸 [GOOGLE_PHOTOS_API] Found media items:', data.mediaItems?.length || 0);
      
      if (data.mediaItems) {
        data.mediaItems.forEach((item: any, index: number) => {
          console.log(`📷 [GOOGLE_PHOTOS_API] Item ${index + 1}:`, {
            id: item.id,
            filename: item.filename,
            mimeType: item.mimeType,
            creationTime: item.mediaMetadata?.creationTime,
            hasBaseUrl: !!item.baseUrl
          });
        });
      }

      return {
        mediaItems: data.mediaItems || [],
        nextPageToken: data.nextPageToken,
      };
    } catch (error) {
      console.error('❌ [GOOGLE_PHOTOS_API] Error in searchPhotos:', error);
      throw error;
    }
  }

  async getPhotosByDateRange(startDate: string, endDate: string): Promise<PhotosResponse> {
    return this.searchPhotos({ startDate, endDate });
  }

  async getAlbums(): Promise<AlbumsResponse> {
    try {
      const response = await this.makePhotosRequest('/albums?pageSize=50');

      return {
        albums: this.transformAlbums(response.albums || []),
        nextPageToken: response.nextPageToken
      };
    } catch (error) {
      console.error('Error getting albums:', error);
      throw new Error(`Failed to get albums: ${error}`);
    }
  }

  async getAlbumPhotos(albumId: string): Promise<PhotosResponse> {
    try {
      const requestBody = {
        albumId,
        pageSize: 50
      };

      const response = await this.makePhotosRequest('/mediaItems:search', 'POST', requestBody);

      return {
        mediaItems: this.transformMediaItems(response.mediaItems || []),
        nextPageToken: response.nextPageToken
      };
    } catch (error) {
      console.error('Error getting album photos:', error);
      throw new Error(`Failed to get album photos: ${error}`);
    }
  }

  async getRecentPhotos(limit: number = 20): Promise<{ mediaItems: PhotoItem[] }> {
    console.log(`🌐 [GOOGLE_PHOTOS_API] Getting ${limit} recent photos`);
    
    const accessToken = await this.oauthManager.getValidAccessToken();
    if (!accessToken) {
      console.error('❌ [GOOGLE_PHOTOS_API] No valid access token available');
      throw new Error('Not authenticated with Google Photos');
    }

    console.log('🔑 [GOOGLE_PHOTOS_API] Using access token:', accessToken.substring(0, 20) + '...');

    try {
      const url = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${limit}`;
      console.log('📤 [GOOGLE_PHOTOS_API] Making API request to:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('📥 [GOOGLE_PHOTOS_API] API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GOOGLE_PHOTOS_API] API error response:', errorText);
        throw new Error(`Google Photos API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 [GOOGLE_PHOTOS_API] API response data keys:', Object.keys(data));
      console.log('📸 [GOOGLE_PHOTOS_API] Found media items:', data.mediaItems?.length || 0);
      
      if (data.mediaItems) {
        data.mediaItems.forEach((item: any, index: number) => {
          console.log(`📷 [GOOGLE_PHOTOS_API] Item ${index + 1}:`, {
            id: item.id,
            filename: item.filename,
            mimeType: item.mimeType,
            creationTime: item.mediaMetadata?.creationTime,
            hasBaseUrl: !!item.baseUrl
          });
        });
      }

      return {
        mediaItems: data.mediaItems || [],
      };
    } catch (error) {
      console.error('❌ [GOOGLE_PHOTOS_API] Error in getRecentPhotos:', error);
      throw error;
    }
  }

  async getPhotoDetails(mediaItemId: string): Promise<PhotoItem | null> {
    try {
      const response = await this.makePhotosRequest(`/mediaItems/${mediaItemId}`);

      if (response) {
        return this.transformMediaItem(response);
      }
      return null;
    } catch (error) {
      console.error('Error getting photo details:', error);
      throw new Error(`Failed to get photo details: ${error}`);
    }
  }

  private transformMediaItems(items: any[]): PhotoItem[] {
    return items.map(item => this.transformMediaItem(item));
  }

  private transformMediaItem(item: any): PhotoItem {
    return {
      id: item.id,
      productUrl: item.productUrl,
      baseUrl: item.baseUrl,
      mimeType: item.mimeType,
      mediaMetadata: {
        creationTime: item.mediaMetadata.creationTime,
        width: item.mediaMetadata.width,
        height: item.mediaMetadata.height,
        photo: item.mediaMetadata.photo ? {
          cameraMake: item.mediaMetadata.photo.cameraMake,
          cameraModel: item.mediaMetadata.photo.cameraModel,
          focalLength: item.mediaMetadata.photo.focalLength,
          apertureFNumber: item.mediaMetadata.photo.apertureFNumber,
          isoEquivalent: item.mediaMetadata.photo.isoEquivalent
        } : undefined
      },
      filename: item.filename || `photo_${item.id}`,
      description: item.description
    };
  }

  private transformAlbums(albums: any[]): Album[] {
    return albums.map(album => ({
      id: album.id,
      title: album.title,
      productUrl: album.productUrl,
      mediaItemsCount: album.mediaItemsCount,
      coverPhotoBaseUrl: album.coverPhotoBaseUrl,
      coverPhotoMediaItemId: album.coverPhotoMediaItemId
    }));
  }

  private parseDate(dateString: string): any {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  private getContentCategories(query: string): string[] {
    const queryLower = query.toLowerCase();
    const categories: string[] = [];

    // Map common search terms to Google Photos content categories
    if (queryLower.includes('people') || queryLower.includes('person')) {
      categories.push('PEOPLE');
    }
    if (queryLower.includes('animal') || queryLower.includes('pet')) {
      categories.push('ANIMALS');
    }
    if (queryLower.includes('food')) {
      categories.push('FOOD');
    }
    if (queryLower.includes('landscape') || queryLower.includes('nature')) {
      categories.push('LANDSCAPES');
    }
    if (queryLower.includes('city') || queryLower.includes('building')) {
      categories.push('CITYSCAPES');
    }
    if (queryLower.includes('travel') || queryLower.includes('vacation')) {
      categories.push('TRAVEL');
    }
    if (queryLower.includes('selfie')) {
      categories.push('SELFIES');
    }

    // If no specific categories found, return empty array to search all
    return categories;
  }

  // Helper method to get a downloadable URL for a photo
  getDownloadableUrl(baseUrl: string, width?: number, height?: number): string {
    let url = baseUrl;
    
    if (width && height) {
      url += `=w${width}-h${height}`;
    } else if (width) {
      url += `=w${width}`;
    } else if (height) {
      url += `=h${height}`;
    } else {
      // Default to a reasonable size for web display
      url += '=w1024-h768';
    }
    
    return url;
  }
} 