export interface GooglePhotosCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  auth_uri: string;
  token_uri: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export interface PhotoItem {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
      focalLength?: number;
      apertureFNumber?: number;
      isoEquivalent?: number;
    };
  };
  filename: string;
  description?: string;
}

export interface Album {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount: string;
  coverPhotoBaseUrl?: string;
  coverPhotoMediaItemId?: string;
}

export interface SearchPhotosParams {
  query?: string;
  startDate?: string;
  endDate?: string;
  albumId?: string;
  pageSize?: number;
  pageToken?: string;
}

export interface PhotosResponse {
  mediaItems: PhotoItem[];
  nextPageToken?: string;
}

export interface AlbumsResponse {
  albums: Album[];
  nextPageToken?: string;
}

export interface AuthenticationStatus {
  isAuthenticated: boolean;
  userEmail?: string;
  scopes?: string[];
  expiresAt?: number;
} 