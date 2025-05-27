"use client";

export function EventDetailsCanvas() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-3">Your Personal Assistant</h1>
        <p className="text-[#5f6368] dark:text-gray-300">Here's a summary based on your request and schedule:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel - Event Details */}
        <div className="bg-white dark:bg-[#303134] rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-[#4285f4] dark:bg-[#8ab4f8] flex items-center justify-center text-white mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] dark:text-white">Event Details</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium text-[#1a1a1a] dark:text-white mb-2">New York Yankees Game</h3>
            <p className="text-[#5f6368] dark:text-gray-300 mb-2">
              The Yankees are playing the Red Sox. A crucial match in the series!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5f6368] dark:text-gray-300">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <span className="text-[#5f6368] dark:text-gray-300 font-medium">Date:</span>
                <div className="text-[#1a1a1a] dark:text-white">June 29, 2025</div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5f6368] dark:text-gray-300">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <span className="text-[#5f6368] dark:text-gray-300 font-medium">Official Time:</span>
                <div className="text-[#1a1a1a] dark:text-white">6:00 PM</div>
                <div className="text-xs text-[#5f6368] dark:text-gray-400">(Expected actual start around 6:30 PM)</div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5f6368] dark:text-gray-300">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <span className="text-[#5f6368] dark:text-gray-300 font-medium">Venue:</span>
                <div className="text-[#1a1a1a] dark:text-white">Yankee Stadium</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-[#5f6368] dark:text-gray-400 italic">
            Information based on official schedule and typical game start patterns.
          </div>
        </div>

        {/* Right Panel - Schedule & Recommendations */}
        <div className="bg-white dark:bg-[#303134] rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-[#4285f4] dark:bg-[#8ab4f8] flex items-center justify-center text-white mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] dark:text-white">Your Schedule & Recommendations</h2>
          </div>

          <div className="bg-blue-50 dark:bg-[rgba(138,180,248,0.08)] rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="font-medium text-blue-600 dark:text-blue-400">New York Yankees Game</span>
            </div>
            <div className="ml-7 text-blue-600 dark:text-blue-400">
              6:00 PM (Likely 6:30 PM) - 9:00 PM
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5f6368] dark:text-gray-300">
                  <path d="M12 19V5" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <div>
                <span className="text-[#5f6368] dark:text-gray-300 font-medium">Travel to Yankee Stadium</span>
                <div className="text-[#1a1a1a] dark:text-white">Estimated duration: 45 minutes.</div>
                <div className="text-[#1a1a1a] dark:text-white">
                  Suggest departing by: <span className="text-blue-600 dark:text-blue-400 font-medium">5:15 PM</span> (to arrive by 6:00 PM).
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 dark:bg-[rgba(251,191,36,0.1)] rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-amber-500 mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-400">Schedule Conflict</h3>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Your meeting "Project Alpha Sync" (6:00 PM - 7:00 PM) overlaps with the event and travel time.
                </p>
                <p className="text-green-600 dark:text-green-400 mt-2">Good news: This meeting can be rescheduled.</p>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                  Consider moving this meeting to attend the New York Yankees game.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 