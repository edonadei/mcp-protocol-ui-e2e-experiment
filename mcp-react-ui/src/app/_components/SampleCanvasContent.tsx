"use client";

// This is a sample component that could be rendered inside the Canvas
// representing what Gemini might generate for a UI request

export function SampleInteractiveKaleidoscope() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-medium">Interactive Kaleidoscope</h2>
      
      <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-2">
        <div className="h-full w-full rounded-lg bg-[rgba(0,0,0,0.3)] p-4">
          <div className="flex h-full items-center justify-center">
            <div className="h-3/4 w-3/4 animate-spin-slow rounded-full bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 opacity-80 blur-sm"></div>
            <div className="absolute h-1/2 w-1/2 animate-spin-slow-reverse rounded-full bg-gradient-to-r from-yellow-400 via-orange-300 to-red-400 opacity-80 blur-sm"></div>
            <div className="absolute h-1/3 w-1/3 animate-pulse rounded-full bg-white opacity-70 blur-sm"></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 rounded-lg bg-[rgba(255,255,255,0.06)] p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Speed</label>
          <input
            type="range"
            min="1"
            max="100"
            defaultValue="50"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium">Color Theme</label>
          <div className="flex gap-2">
            {["#FF5E5E", "#5E8EFF", "#5EFFC4", "#FFDE5E", "#C45EFF"].map((color) => (
              <button
                key={color}
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium">Pattern</label>
          <select className="w-full rounded-md bg-[var(--gemini-card)] p-2 text-[var(--gemini-text)]">
            <option>Geometric</option>
            <option>Spiral</option>
            <option>Wave</option>
            <option>Starburst</option>
          </select>
        </div>
        
        <button className="w-full rounded-md bg-[var(--gemini-accent)] p-2 text-black font-medium">
          Generate New Pattern
        </button>
      </div>
    </div>
  );
} 