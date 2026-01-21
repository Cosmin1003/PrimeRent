import { Link } from 'react-router-dom';

export default function HomePage({ user }: { user: any }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center">
        <div className="max-w-4xl px-6 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New properties available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-black tracking-tight">
            Rent the world's most <br />
            <span className="text-emerald-600 italic">extraordinary</span> homes.
          </h1>

          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {user
              ? `Welcome back, ${user.email}. Where would you like to stay next?`
              : "Experience luxury stays with PrimeRent. From hidden forest cabins to city penthouses."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
              Browse Listings
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-black border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Featured Grid Placeholder (Visual Polish) */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-black">Featured Stays</h2>
            <p className="text-gray-500">Hand-picked properties for you</p>
          </div>
          <Link to="/" className="text-emerald-600 font-bold hover:underline">View all</Link>
        </div>
        
        {/* Simple Skeleton Cards to show the vibe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
                <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 backdrop-blur rounded font-bold text-xs">
                  ★ 4.9
                </div>
              </div>
              <div className="h-4 w-2/3 bg-gray-100 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-50 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}