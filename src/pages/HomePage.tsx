import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HomePage({ user }: { user: any }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No need to navigate, App.tsx listener will update the state
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl">
        <div className="text-xl font-bold text-cyan-400">PrimeRent</div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:brightness-110 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="text-center">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Find your next stay.
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          {user 
            ? `Welcome back, ${user.email.split('@')[0]}!` 
            : "Explore luxury rentals at the best prices."}
        </p>
      </div>
    </div>
  );
}