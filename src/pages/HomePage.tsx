import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import {
  Heart,
  MapPin,
  Star,
  ArrowRight,
  Home,
  Users,
  CheckCircle,
  Search,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorite } from '@/hooks/useFavorite';

interface FeaturedProperty {
  id: string;
  title: string;
  city: string;
  price_per_night: number;
  main_image: string;
  avg_rating: number;
}

interface Stats {
  properties: number;
  guests: number;
  bookings: number;
  cities: number;
}

/** Small wrapper so each card can use the useFavorite hook independently */
function FavoriteButton({ propertyId, userId }: { propertyId: string; userId: string | undefined }) {
  const { isFavorited, toggleFavorite } = useFavorite(propertyId, userId);
  return (
    <button
      onClick={(e) => toggleFavorite(e)}
      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-colors shadow-sm"
    >
      <Heart
        size={18}
        className={isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}
      />
    </button>
  );
}

interface HomePageProps {
  user?: any;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Stats>({ properties: 0, guests: 0, bookings: 0, cities: 0 });
  const [popularCities, setPopularCities] = useState<{ city: string; count: number; image: string }[]>([]);

  useEffect(() => {
    fetchFeaturedProperties();
    fetchStats();
    fetchPopularCities();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      // Fetch properties with their reviews to compute avg_rating client-side
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, price_per_night, main_image, reviews(rating)')
        .eq('is_active', true);

      if (error) throw error;

      // Compute avg_rating from joined reviews and sort by it
      const withRatings: FeaturedProperty[] = (data || []).map((p: any) => {
        const ratings: number[] = (p.reviews || []).map((r: { rating: number }) => r.rating);
        const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        return { id: p.id, title: p.title, city: p.city, price_per_night: p.price_per_night, main_image: p.main_image, avg_rating: avg };
      });

      withRatings.sort((a, b) => b.avg_rating - a.avg_rating);
      setProperties(withRatings.slice(0, 6));
    } catch (error) {
      console.error('Error loading featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [propCount, bookingCount, guestCount, cityCount] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('city').eq('is_active', true),
      ]);

      const uniqueCities = new Set((cityCount.data || []).map((p: { city: string }) => p.city));

      setStats({
        properties: propCount.count ?? 0,
        bookings: bookingCount.count ?? 0,
        guests: guestCount.count ?? 0,
        cities: uniqueCities.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const fetchPopularCities = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('city, main_image')
        .eq('is_active', true);

      if (error) throw error;

      // Group by city and count
      const cityMap = new Map<string, { count: number; image: string }>();
      (data || []).forEach((p) => {
        const existing = cityMap.get(p.city);
        if (existing) {
          existing.count += 1;
        } else {
          cityMap.set(p.city, { count: 1, image: p.main_image });
        }
      });

      const sorted = Array.from(cityMap.entries())
        .map(([city, info]) => ({ city, count: info.count, image: info.image }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      setPopularCities(sorted);
    } catch (error) {
      console.error('Error loading popular cities:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore${searchQuery.trim() ? `?city=${encodeURIComponent(searchQuery.trim())}` : ''}`);
  };

  const formatStat = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
    return String(n);
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
              {stats.properties > 0 ? `${stats.properties} properties available` : 'New properties available'}
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Find your next <span className="text-emerald-600">extraordinary</span> stay.
            </h1>

            <p className="max-w-2xl text-lg text-slate-600 mb-10">
              {user
                ? `Welcome back! Ready to book your next adventure?`
                : 'Discover unique homes, luxury villas, and cozy cabins. Your perfect getaway starts here.'}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-xl mb-8">
              <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden pl-5 pr-2 py-1">
                <MapPin size={18} className="text-emerald-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent border-none outline-none placeholder:text-slate-400"
                />
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5">
                  <Search size={16} className="mr-1" /> Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                <Link to="/explore">Browse All Listings</Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg" className="px-8 border-slate-200">
                  <Link to="/auth">Sign Up Free</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- POPULAR CITIES --- */}
      {popularCities.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Popular Destinations</h2>
              <p className="text-slate-500 mt-2">Explore top cities our guests love.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCities.map((c) => (
                <Link
                  key={c.city}
                  to={`/explore?city=${encodeURIComponent(c.city)}`}
                  className="group relative rounded-2xl overflow-hidden aspect-4/3"
                >
                  <img
                    src={c.image || '/placeholder.webp'}
                    alt={c.city}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="font-bold text-lg">{c.city}</div>
                    <div className="text-white/80 text-sm">{c.count} {c.count === 1 ? 'property' : 'properties'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- FEATURED PROPERTIES --- */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Top-Rated Stays</h2>
              <p className="text-slate-500 mt-2">Our highest-reviewed properties, loved by guests.</p>
            </div>
            <Link to="/explore" className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-100 bg-slate-200 animate-pulse rounded-2xl" />
              ))
            ) : properties.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center py-12">No properties yet. Check back soon!</p>
            ) : (
              properties.map((item) => (
                <Link
                  key={item.id}
                  to={`/explore/${item.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <img
                      src={item.main_image || '/placeholder.webp'}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <FavoriteButton propertyId={item.id} userId={user?.id} />
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 truncate flex-1">{item.title}</h3>
                      {item.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-sm font-medium ml-2">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {item.avg_rating.toFixed(1)}
                        </div>
                      )}
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
              { label: 'Properties', value: formatStat(stats.properties), icon: Home },
              { label: 'Members', value: formatStat(stats.guests), icon: Users },
              { label: 'Bookings', value: formatStat(stats.bookings), icon: CheckCircle },
              { label: 'Cities', value: formatStat(stats.cities), icon: Building },
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
                {user ? 'List your space and start earning' : 'Ready to start your journey?'}
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-10">
                Join our community of hosts and travelers. Whether you're looking to book or host, PrimeRent makes it simple.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10">
                    <Link to="/host/create-listing">Create a Listing</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10">
                    <Link to="/auth">Join PrimeRent Now</Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="px-10 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  <Link to="/explore">Explore Properties</Link>
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