"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

interface ReactRendererProps {
  code: string;
}

export function ReactRenderer({ code }: ReactRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isParsing, setIsParsing] = useState(true);

  useEffect(() => {
    if (!code) {
      console.error("ReactRenderer: No code provided");
      setError("No code provided");
      return;
    }

    if (!containerRef.current) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      // Extract the actual component code from markdown code blocks if present
      const codeRegex = /```(?:jsx?|tsx?|react|javascript)?\n([\s\S]*?)```/;
      const execResult = codeRegex.exec(code);
      
      const jsxCode = execResult?.[1]?.trim() || code.trim();
      
      console.log("🔧 ReactRenderer processing code:", jsxCode);
      
      // Create a complete HTML document with React, ReactDOM, and Babel
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                overflow: auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              }
              #root {
                width: 100%;
                height: 100%;
                padding: 1rem;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              try {
                // Execute the component code
                ${jsxCode}
                
                // Try to find and render the component
                // Look for function components first
                const functionMatch = ${JSON.stringify(jsxCode)}.match(/function\\s+([A-Za-z][A-Za-z0-9_]*)\\s*\\(/);
                
                if (functionMatch && functionMatch[1]) {
                  const componentName = functionMatch[1];
                  console.log("Found component:", componentName);
                  
                  // Try to get the component from the global scope
                  if (typeof window[componentName] === 'function') {
                    const Component = window[componentName];
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(Component));
                  } else {
                    // Try to evaluate the component directly
                    try {
                      const Component = eval(componentName);
                      if (typeof Component === 'function') {
                        const root = ReactDOM.createRoot(document.getElementById('root'));
                        root.render(React.createElement(Component));
                      } else {
                        throw new Error("Component is not a function");
                      }
                    } catch (evalError) {
                      console.error("Could not evaluate component:", evalError);
                      // Show error message
                      const root = ReactDOM.createRoot(document.getElementById('root'));
                      root.render(
                        React.createElement('div', { 
                          className: "p-4 bg-red-100 text-red-700 rounded-lg" 
                        }, [
                          React.createElement('h3', { 
                            className: "font-bold mb-2"
                          }, "Component Rendering Error"),
                          React.createElement('p', { className: "mb-2" }, 
                            "Found component '" + componentName + "' but couldn't render it."
                          ),
                          React.createElement('p', { className: "text-sm" }, 
                            "Error: " + evalError.message
                          )
                        ])
                      );
                    }
                  }
                } else {
                  // No function component found, show error
                  console.error("No valid React component found in code");
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(
                    React.createElement('div', { 
                      className: "p-4 bg-yellow-100 text-yellow-700 rounded-lg" 
                    }, [
                      React.createElement('h3', { 
                        className: "font-bold mb-2"
                      }, "No Component Found"),
                      React.createElement('p', { className: "mb-2" }, 
                        "Could not find a valid React function component in the provided code."
                      ),
                      React.createElement('p', { className: "text-sm" }, 
                        "Make sure your code defines a function component like: function MyComponent() { return (...); }"
                      )
                    ])
                  );
                }
              } catch (error) {
                // Handle any global errors
                console.error("Error rendering component:", error);
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(
                  React.createElement('div', { 
                    className: "p-4 bg-red-100 text-red-700 rounded-lg" 
                  }, [
                    React.createElement('h3', { 
                      className: "font-bold mb-2"
                    }, "Rendering Error"),
                    React.createElement('p', { className: "mb-2" }, 
                      error.message || "Unknown error occurred while rendering the component"
                    ),
                    React.createElement('details', { className: "mt-2" }, [
                      React.createElement('summary', { className: "cursor-pointer font-medium" }, "Code"),
                      React.createElement('pre', { 
                        className: "mt-2 p-2 bg-gray-800 text-gray-200 rounded text-xs overflow-auto max-h-40" 
                      }, ${JSON.stringify(jsxCode)})
                    ])
                  ])
                );
              }
            </script>
          </body>
        </html>
      `;
      
      // Clean the container first
      const container = containerRef.current;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Create a new iframe
      const iframe = document.createElement('iframe');
      iframe.className = "w-full h-full border-0 rounded-lg";
      iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms');
      
      // Add load handler
      iframe.onload = () => {
        setIsParsing(false);
      };
      
      // Append iframe to container
      container.appendChild(iframe);
      
      // Set the content using srcDoc
      iframe.srcdoc = html;
    } catch (err) {
      console.error("Failed to render component:", err);
      setError(`Could not render component: ${err instanceof Error ? err.message : String(err)}`);
      setIsParsing(false);
    }
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
        <h3 className="font-bold">Rendering Error</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">Check the code for syntax errors.</p>
        <pre className="mt-4 p-2 bg-gray-800 text-gray-200 rounded text-xs overflow-auto max-h-40">
          {code?.substring(0, 500) + (code && code.length > 500 ? '...' : '')}
        </pre>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {isParsing && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
          <p>Loading component...</p>
        </div>
      )}
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ display: isParsing ? 'none' : 'block' }}
      />
    </div>
  );
}

// Create a safer sandbox version for client-side rendering
export const SafeReactRenderer = dynamic(() => Promise.resolve(ReactRenderer), {
  ssr: false
}); 