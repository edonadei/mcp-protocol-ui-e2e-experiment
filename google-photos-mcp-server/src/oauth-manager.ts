import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import type { GooglePhotosCredentials, OAuthTokens, AuthenticationStatus } from './types.js';

export class OAuthManager {
  private oauth2Client: OAuth2Client;
  private credentials: GooglePhotosCredentials;
  private tokensFilePath: string;
  private currentTokens: OAuthTokens | null = null;

  constructor(credentialsPath: string, tokensFilePath: string = './tokens.json') {
    this.tokensFilePath = tokensFilePath;
    this.credentials = this.loadCredentials(credentialsPath);
    
    this.oauth2Client = new OAuth2Client(
      this.credentials.client_id,
      this.credentials.client_secret,
      this.credentials.redirect_uris[0]
    );
  }

  private loadCredentials(credentialsPath: string): GooglePhotosCredentials {
    try {
      const credentialsFile = JSON.parse(readFileSync(credentialsPath, 'utf8'));
      return credentialsFile.installed || credentialsFile.web;
    } catch (error) {
      throw new Error(`Failed to load credentials from ${credentialsPath}: ${error}`);
    }
  }

  async loadTokens(): Promise<boolean> {
    try {
      const tokensData = await fs.readFile(this.tokensFilePath, 'utf8');
      this.currentTokens = JSON.parse(tokensData);
      
      if (this.currentTokens) {
        this.oauth2Client.setCredentials(this.currentTokens);
        return true;
      }
    } catch (error) {
      console.log('No existing tokens found or failed to load tokens');
    }
    return false;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    try {
      await fs.writeFile(this.tokensFilePath, JSON.stringify(tokens, null, 2));
      this.currentTokens = tokens;
      this.oauth2Client.setCredentials(tokens);
    } catch (error) {
      throw new Error(`Failed to save tokens: ${error}`);
    }
  }

  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/photoslibrary.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      const oauthTokens: OAuthTokens = {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || undefined,
        scope: tokens.scope!,
        token_type: tokens.token_type!,
        expiry_date: tokens.expiry_date || undefined
      };
      
      await this.saveTokens(oauthTokens);
      return oauthTokens;
    } catch (error) {
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }
  }

  async refreshTokensIfNeeded(): Promise<boolean> {
    if (!this.currentTokens) {
      return false;
    }

    try {
      // Check if token is expired or will expire in the next 5 minutes
      const now = Date.now();
      const expiryTime = this.currentTokens.expiry_date || 0;
      const fiveMinutes = 5 * 60 * 1000;

      if (expiryTime - now < fiveMinutes) {
        console.log('Refreshing access token...');
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        const refreshedTokens: OAuthTokens = {
          ...this.currentTokens,
          access_token: credentials.access_token!,
          expiry_date: credentials.expiry_date || undefined
        };

        await this.saveTokens(refreshedTokens);
        return true;
      }
      return true;
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      return false;
    }
  }

  async getValidAccessToken(): Promise<string | null> {
    if (!this.currentTokens) {
      return null;
    }

    const isValid = await this.refreshTokensIfNeeded();
    if (!isValid) {
      return null;
    }

    return this.currentTokens.access_token;
  }

  async getAuthenticationStatus(): Promise<AuthenticationStatus> {
    if (!this.currentTokens) {
      return { isAuthenticated: false };
    }

    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { isAuthenticated: false };
    }

    try {
      // Get user info to verify authentication
      const userInfo = await this.oauth2Client.getTokenInfo(accessToken);
      
      return {
        isAuthenticated: true,
        userEmail: userInfo.email,
        scopes: userInfo.scopes,
        expiresAt: this.currentTokens.expiry_date
      };
    } catch (error) {
      console.error('Failed to get authentication status:', error);
      return { isAuthenticated: false };
    }
  }

  async revokeTokens(): Promise<void> {
    if (this.currentTokens?.access_token) {
      try {
        await this.oauth2Client.revokeToken(this.currentTokens.access_token);
      } catch (error) {
        console.error('Failed to revoke tokens:', error);
      }
    }

    // Clear local tokens
    this.currentTokens = null;
    try {
      await fs.unlink(this.tokensFilePath);
    } catch (error) {
      // File might not exist, that's okay
    }
  }

  getOAuth2Client(): OAuth2Client {
    return this.oauth2Client;
  }
} 