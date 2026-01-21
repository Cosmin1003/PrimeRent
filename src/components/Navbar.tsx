import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Left: Brand */}
        <div className="flex items-center gap-10">
          <Link to="/" className="group flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter text-black transition-transform group-hover:-translate-y-0.5">
              PRIME<span className="text-emerald-600">RENT</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-black transition-colors font-semibold text-sm"
            >
              Discover
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-black transition-colors font-medium text-sm"
            >
              Properties
            </Link>
          </div>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="hidden sm:inline text-black text-xs font-bold">
                  {user.email.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                // Added "cursor-pointer" below
                className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                to="/auth"
                className="px-8 py-2.5 bg-black hover:bg-emerald-600 text-white rounded-full text-sm font-bold transition-all duration-300 shadow-md hover:shadow-emerald-200/50"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
