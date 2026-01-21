import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-black">
            PRIME<span className="text-emerald-600">RENT</span>
          </Link>
          <Link to="/" className="text-gray-500 hover:text-black transition-colors font-medium text-sm">
            Discover
          </Link>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline text-gray-400 text-xs font-medium uppercase tracking-widest">
                {user.email.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-sm font-semibold text-gray-900 hover:text-emerald-600">
                Log in
              </Link>
              <Link 
                to="/auth" 
                className="px-5 py-2.5 bg-black hover:bg-emerald-600 text-white rounded-full text-sm font-bold transition-all duration-300"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}