import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    // Main container with a subtle slate gradient background
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200 selection:bg-cyan-500/30">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(circle_farthest-side_at_50%_100%,#0f172a,transparent)]" />

      <main className="max-w-md w-full space-y-8 text-center">
        
        {/* Header Section */}
        <header className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Vite + React
          </h1>
          <p className="text-slate-400 font-medium italic">Powered by Tailwind CSS v4</p>
        </header>

        {/* Counter Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm transition-all hover:border-slate-700">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="group relative px-6 py-3 font-bold text-white transition-all active:scale-95"
          >
            {/* Button Background with Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Button Content */}
            <div className="relative bg-slate-950 px-6 py-3 rounded-lg leading-none flex items-center">
              <span className="text-cyan-200">Count is: </span>
              <span className="ml-2 text-white tabular-nums">{count}</span>
            </div>
          </button>

          <p className="mt-6 text-sm text-slate-500">
            Edit <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">src/App.tsx</code> to test Hot Module Replacement.
          </p>
        </div>

        {/* Footer Links */}
        <footer className="flex justify-center gap-6 text-sm font-medium">
          <a href="https://vite.dev" target="_blank" className="hover:text-cyan-400 transition-colors">Vite Docs</a>
          <span className="text-slate-700">|</span>
          <a href="https://react.dev" target="_blank" className="hover:text-blue-400 transition-colors">React Docs</a>
          <span className="text-slate-700">|</span>
          <a href="https://tailwindcss.com" target="_blank" className="hover:text-sky-400 transition-colors">Tailwind v4</a>
        </footer>

      </main>
    </div>
  )
}

export default App