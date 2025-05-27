'use client';

import React from 'react';
import { GooglePhotosSettings } from '../../components/GooglePhotosSettings';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const handleAuthStatusChange = (isAuthenticated: boolean) => {
    console.log('Google Photos auth status changed:', isAuthenticated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
          
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-700" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Configure your integrations and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Google Photos Integration */}
          <section>
            <GooglePhotosSettings onAuthStatusChange={handleAuthStatusChange} />
          </section>

          {/* Future settings sections can be added here */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Integrations
            </h3>
            <p className="text-gray-600 text-sm">
              More integrations and settings will be available here in the future.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 