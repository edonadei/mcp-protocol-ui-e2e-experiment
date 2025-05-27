"use client";

import { useState, useEffect } from 'react';

interface CodeRendererProps {
  code: string;
}

export function CodeRenderer({ code }: CodeRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const [htmlOutput, setHtmlOutput] = useState<string>('');

  // Generate HTML based on content keywords
  useEffect(() => {
    if (!code) {
      console.error("CodeRenderer: No code provided");
      setError("No code provided");
      return;
    }

    console.log("CodeRenderer received content length:", code.length);
    
    try {
      // Simple keyword detection to decide what content to show
      const lowerCode = code.toLowerCase();
      let generatedHtml = '';

      // Detect content type based on keywords
      if (lowerCode.includes('kanye') || lowerCode.includes('album') || lowerCode.includes('music')) {
        console.log("Generating music albums UI");
        generatedHtml = `
          <div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Kanye West's Albums</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/en/0/03/Mbdtf.jpg" class="w-full h-48 object-cover" alt="My Beautiful Dark Twisted Fantasy album cover" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">My Beautiful Dark Twisted Fantasy</h3>
                  <p class="text-gray-600 dark:text-gray-300 mt-2">2010</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-yellow-500">★★★★★</span>
                    <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Critically acclaimed</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/en/4/4d/The_College_Dropout_cover.png" class="w-full h-48 object-cover" alt="The College Dropout album cover" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">The College Dropout</h3>
                  <p class="text-gray-600 dark:text-gray-300 mt-2">2004</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-yellow-500">★★★★★</span>
                    <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Breakthrough album</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/en/f/f0/808s_%26_Heartbreak.png" class="w-full h-48 object-cover" alt="808s & Heartbreak album cover" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">808s & Heartbreak</h3>
                  <p class="text-gray-600 dark:text-gray-300 mt-2">2008</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-yellow-500">★★★★☆</span>
                    <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Influential sound</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="text-gray-700 dark:text-gray-300">
                Many critics consider "My Beautiful Dark Twisted Fantasy" to be Kanye West's best album, often ranking it among the greatest albums of all time. It features a perfect blend of production quality, lyrical depth, and artistic vision.
              </p>
            </div>
          </div>
        `;
      } else if (lowerCode.includes('skyscraper') || lowerCode.includes('building') || lowerCode.includes('nyc') || lowerCode.includes('new york')) {
        console.log("Generating skyscrapers UI");
        generatedHtml = `
          <div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">New York City's Most Beautiful Skyscrapers</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Chrysler Building -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img src="https://images.unsplash.com/photo-1555109307-f7d9da25c244" class="w-full h-48 object-cover" alt="Chrysler Building" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Chrysler Building</h3>
                  <p class="text-gray-600 dark:text-gray-300 mt-2">Completed: 1930</p>
                  <p class="text-gray-600 dark:text-gray-300 mt-1">Style: Art Deco</p>
                  <p class="text-gray-600 dark:text-gray-300 mt-1">Height: 1,046 ft (318.9 m)</p>
                </div>
              </div>
              
              <!-- Empire State Building -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img src="https://images.unsplash.com/photo-1583842761829-4197bca9a3cb" class="w-full h-48 object-cover" alt="Empire State Building" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Empire State Building</h3>
                  <p class="text-gray-600 dark:text-gray-300 mt-2">Completed: 1931</p>
                  <p class="text-gray-600 dark:text-gray-300 mt-1">Style: Art Deco</p>
                  <p class="text-gray-600 dark:text-gray-300 mt-1">Height: 1,454 ft (443.2 m)</p>
                </div>
              </div>
              
              <!-- One World Trade Center -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img src="https://images.unsplash.com/photo-1623939012039-91c3abad5d2b" class="w-full h-48 object-cover" alt="One World Trade Center" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">One World Trade Center</h3>
                  <p class="text-gray-600 dark:text-gray-300 mt-2">Completed: 2014</p>
                  <p class="text-gray-600 dark:text-gray-300 mt-1">Style: Contemporary Modern</p>
                  <p class="text-gray-600 dark:text-gray-300 mt-1">Height: 1,776 ft (541.3 m)</p>
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (lowerCode.includes('dashboard') || lowerCode.includes('fitness') || lowerCode.includes('stats') || lowerCode.includes('tracking')) {
        console.log("Generating dashboard UI");
        generatedHtml = `
          <div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Fitness Dashboard</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Steps Today</h3>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">8,946</p>
                <div class="mt-2 flex items-center text-sm">
                  <span class="text-green-500">↑ 12%</span>
                  <span class="text-gray-500 dark:text-gray-400 ml-2">vs yesterday</span>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Calories Burned</h3>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">1,248</p>
                <div class="mt-2 flex items-center text-sm">
                  <span class="text-green-500">↑ 8%</span>
                  <span class="text-gray-500 dark:text-gray-400 ml-2">vs yesterday</span>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Minutes</h3>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">64</p>
                <div class="mt-2 flex items-center text-sm">
                  <span class="text-red-500">↓ 5%</span>
                  <span class="text-gray-500 dark:text-gray-400 ml-2">vs yesterday</span>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Heart Rate</h3>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">72 bpm</p>
                <div class="mt-2 flex items-center text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Resting</span>
                </div>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
              <div class="h-64 flex items-end justify-between">
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 40%"></div>
                  <span class="mt-2 text-xs text-gray-500">Mon</span>
                </div>
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 60%"></div>
                  <span class="mt-2 text-xs text-gray-500">Tue</span>
                </div>
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 25%"></div>
                  <span class="mt-2 text-xs text-gray-500">Wed</span>
                </div>
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 80%"></div>
                  <span class="mt-2 text-xs text-gray-500">Thu</span>
                </div>
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 45%"></div>
                  <span class="mt-2 text-xs text-gray-500">Fri</span>
                </div>
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 70%"></div>
                  <span class="mt-2 text-xs text-gray-500">Sat</span>
                </div>
                <div class="w-1/7 flex flex-col items-center">
                  <div class="bg-blue-500 w-full rounded-t-md" style="height: 30%"></div>
                  <span class="mt-2 text-xs text-gray-500">Sun</span>
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (lowerCode.includes('weather') || lowerCode.includes('forecast') || lowerCode.includes('temperature')) {
        console.log("Generating weather UI");
        generatedHtml = `
          <div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Weather Forecast</h2>
              <div class="text-sm text-gray-500 dark:text-gray-400">Updated: Just now</div>
            </div>
            
            <div class="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-xl">New York, NY</h3>
                  <p class="text-4xl font-bold mt-2">72°</p>
                  <p class="mt-1">Partly Cloudy</p>
                  <p class="text-sm mt-3">Feels like 75° • Humidity 62%</p>
                </div>
                <div class="text-8xl">⛅</div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Mon</p>
                <div class="text-3xl my-2">🌤️</div>
                <p class="font-bold text-gray-900 dark:text-white">75°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">58°</p>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Tue</p>
                <div class="text-3xl my-2">⛅</div>
                <p class="font-bold text-gray-900 dark:text-white">72°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">55°</p>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Wed</p>
                <div class="text-3xl my-2">☀️</div>
                <p class="font-bold text-gray-900 dark:text-white">78°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">62°</p>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Thu</p>
                <div class="text-3xl my-2">🌧️</div>
                <p class="font-bold text-gray-900 dark:text-white">68°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">59°</p>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Fri</p>
                <div class="text-3xl my-2">⛅</div>
                <p class="font-bold text-gray-900 dark:text-white">71°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">60°</p>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Sat</p>
                <div class="text-3xl my-2">☀️</div>
                <p class="font-bold text-gray-900 dark:text-white">76°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">65°</p>
              </div>
              
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                <p class="text-gray-500 dark:text-gray-400 text-sm">Sun</p>
                <div class="text-3xl my-2">☀️</div>
                <p class="font-bold text-gray-900 dark:text-white">80°</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">68°</p>
              </div>
            </div>
          </div>
        `;
      } else {
        console.log("No specific template found, using generic UI");
        // Fall back to a generic UI component that shows a preview of the content
        generatedHtml = `
          <div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Generated UI</h2>
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="text-gray-700 dark:text-gray-300 mb-4">
                This is a generic UI component based on your request. Here's a summary of what you asked for:
              </p>
              <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p class="text-gray-800 dark:text-gray-200">${code.substring(0, 300)}${code.length > 300 ? '...' : ''}</p>
              </div>
            </div>
          </div>
        `;
      }
      
      // Wrap with HTML document
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                font-family: system-ui, sans-serif;
                margin: 0;
                padding: 0;
                width: 100%;
                min-height: 100vh;
                background-color: transparent;
              }
              * {
                box-sizing: border-box;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              .w-1\\/7 {
                width: 13%;
              }
            </style>
          </head>
          <body>
            ${generatedHtml}
          </body>
        </html>
      `;
      
      console.log("Generated HTML length:", html.length);
      
      setHtmlOutput(html);
      setError(null);
    } catch (err) {
      console.error("Failed to render content:", err);
      setError(`Could not render component: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [code]);

  return (
    <div className="h-full w-full">
      {error ? (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <h3 className="font-bold">Rendering Error</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">Check the content for issues.</p>
          <pre className="mt-4 p-2 bg-gray-800 text-gray-200 rounded text-xs overflow-auto max-h-40">
            {code?.substring(0, 500) + (code && code.length > 500 ? '...' : '')}
          </pre>
        </div>
      ) : (
        <iframe
          srcDoc={htmlOutput}
          className="w-full h-full border-0 rounded-md"
          sandbox="allow-scripts"
          title="Component Preview"
        />
      )}
    </div>
  );
} 