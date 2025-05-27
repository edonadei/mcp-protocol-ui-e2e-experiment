import React, { useState, useEffect } from 'react';
import { Camera, Settings, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface AuthStatus {
  isAuthenticated: boolean;
  userEmail?: string;
  expiresAt?: number;
}

interface GooglePhotosSettingsProps {
  onAuthStatusChange?: (isAuthenticated: boolean) => void;
}

export const GooglePhotosSettings: React.FC<GooglePhotosSettingsProps> = ({ 
  onAuthStatusChange 
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-photos/auth-status');
      const data = await response.json();
      
      if (response.ok) {
        setAuthStatus(data);
        onAuthStatusChange?.(data.isAuthenticated);
      } else {
        setError(data.error || 'Failed to check authentication status');
      }
    } catch (err) {
      setError('Failed to check authentication status');
      console.error('Auth status check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAuthUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/google-photos/auth-url');
      const data = await response.json();
      
      if (response.ok) {
        setAuthUrl(data.authUrl);
      } else {
        setError(data.error || 'Failed to get authorization URL');
      }
    } catch (err) {
      setError('Failed to get authorization URL');
      console.error('Auth URL error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exchangeAuthCode = async () => {
    if (!authCode.trim()) {
      setError('Please enter the authorization code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/google-photos/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuthStatus({ 
          isAuthenticated: true, 
          userEmail: data.userEmail,
          expiresAt: data.expiresAt 
        });
        setAuthUrl(null);
        setAuthCode('');
        onAuthStatusChange?.(true);
      } else {
        setError(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      setError('Failed to authenticate');
      console.error('Auth exchange error:', err);
    } finally {
      setLoading(false);
    }
  };

  const revokeAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/google-photos/revoke', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuthStatus({ isAuthenticated: false });
        setAuthUrl(null);
        setAuthCode('');
        onAuthStatusChange?.(false);
      } else {
        setError(data.error || 'Failed to revoke authentication');
      }
    } catch (err) {
      setError('Failed to revoke authentication');
      console.error('Auth revoke error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Camera className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Google Photos Integration</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {authStatus.isAuthenticated ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Connected to Google Photos</p>
              {authStatus.userEmail && (
                <p className="text-green-700 text-sm">Account: {authStatus.userEmail}</p>
              )}
              {authStatus.expiresAt && (
                <p className="text-green-700 text-sm">
                  Expires: {formatExpiryDate(authStatus.expiresAt)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={revokeAuth}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Disconnecting...' : 'Disconnect Google Photos'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Connect your Google Photos account to access your photo library and create personalized dashboards.
          </p>

          {!authUrl ? (
            <button
              onClick={getAuthUrl}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Getting Authorization...' : 'Connect Google Photos'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm mb-2">
                  1. Click the link below to authorize access to your Google Photos:
                </p>
                <a
                  href={authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Open Google Authorization
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-2">
                <label htmlFor="authCode" className="block text-sm font-medium text-gray-700">
                  2. Paste the authorization code here:
                </label>
                <input
                  id="authCode"
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Enter authorization code..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exchangeAuthCode}
                  disabled={loading || !authCode.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Connecting...' : 'Complete Connection'}
                </button>
                <button
                  onClick={() => {
                    setAuthUrl(null);
                    setAuthCode('');
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 