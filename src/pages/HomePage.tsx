import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { 
  Heart, 
  MapPin, 
  Star, 
  ArrowRight, 
  Home, 
  Users, 
  CheckCircle, 
  Trophy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Types based on your Supabase Schema
interface Property {
  id: string;
  title: string;
  city: string;
  price_per_night: number;
  main_image: string;
  avg_rating?: number; // Calculated or from a view
}

const HomePage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get Auth Session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // 2. Fetch Featured Properties (Limit 6)
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, title, city, price_per_night, main_image
        `)
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      
      // Note: In a real app, avg_rating would likely come from a DB View 
      // or a separate aggregation query. Adding mock ratings for UI.
      const propertiesWithRatings = data?.map(p => ({ ...p, avg_rating: 4.8 })) || [];
      setProperties(propertiesWithRatings);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-6 py-1 px-4 border-emerald-100 bg-emerald-50 text-emerald-700">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              New properties available
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Find your next <span className="text-emerald-600">extraordinary</span> stay.
            </h1>
            
            <p className="max-w-2xl text-lg text-slate-600 mb-10">
              {user 
                ? `Welcome back, ${user.email}! Ready to book your next adventure?` 
                : "Discover unique homes, luxury villas, and cozy cabins around the world. Your perfect getaway starts here."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                <Link to="/explore">Browse Listings</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 border-slate-200">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED PROPERTIES --- */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Stays</h2>
              <p className="text-slate-500 mt-2">Hand-picked properties for their style and comfort.</p>
            </div>
            <Link to="/explore" className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[400px] bg-slate-200 animate-pulse rounded-2xl" />
              ))
            ) : (
              properties.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/explore/${item.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.main_image || 'https://via.placeholder.com/400x300'} 
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                      <Heart size={18} />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 truncate flex-1">{item.title}</h3>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        {item.avg_rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                      <MapPin size={14} /> {item.city}
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <span className="text-lg font-bold text-slate-900">${item.price_per_night}</span>
                      <span className="text-slate-500 text-sm"> / night</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- STATISTICS --- */}
      <section className="py-16 border-y border-slate-100">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Properties', value: '1,200+', icon: Home },
              { label: 'Happy Guests', value: '15k+', icon: Users },
              { label: 'Bookings', value: '45k+', icon: CheckCircle },
              { label: 'Satisfaction', value: '99%', icon: Trophy },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex p-3 rounded-xl bg-emerald-50 text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-slate-500 text-sm uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {user ? "List your space and earn more" : "Ready to start your journey?"}
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-10">
                Join our community of hosts and travelers. Whether you're looking to book or host, PrimeRent makes it simple.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10">
                  <Link to={user ? "/host/setup" : "/signup"}>
                    {user ? "Become a Host" : "Join PrimeRent Now"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;