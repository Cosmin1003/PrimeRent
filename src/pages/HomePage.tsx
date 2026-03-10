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
  Sparkles,
  Shield,
  Clock,
  Globe,
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
      className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full transition-all shadow-lg hover:scale-110 hover:bg-white"
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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProperties();
    fetchStats();
    fetchPopularCities();
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => { if (data) setRole(data.role); });
    }
  }, [user]);

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, price_per_night, main_image, reviews(rating)')
        .eq('is_active', true);

      if (error) throw error;

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
    <div className="flex flex-col min-h-screen bg-white">

      {/* ━━━ HERO SECTION ━━━ */}
      <section className="relative pt-24 pb-36 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-white to-teal-50/50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-200 bg-linear-to-br from-emerald-200/30 to-teal-200/20 rounded-full blur-3xl -mt-96" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-emerald-100/40 to-transparent rounded-full blur-3xl" />

        <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-8 py-1.5 px-5 border-emerald-200/60 bg-white/80 backdrop-blur-sm text-emerald-700 shadow-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {stats.properties > 0 ? `${stats.properties} properties available now` : 'New properties available'}
            </Badge>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.05]">
              Find your next
              <br />
              <span className="bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                extraordinary
              </span>{' '}
              stay
            </h1>

            <p className="max-w-2xl text-lg md:text-xl text-slate-500 mb-12 leading-relaxed">
              {user
                ? 'Welcome back! Discover new destinations and book your next unforgettable experience.'
                : 'Discover unique homes, luxury villas, and cozy retreats handpicked for unforgettable moments.'}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mb-10">
              <div className="flex items-center bg-white border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all overflow-hidden pl-6 pr-2 py-2">
                <MapPin size={20} className="text-emerald-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 text-base bg-transparent border-none outline-none placeholder:text-slate-400"
                />
                <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 text-base font-semibold shadow-md shadow-emerald-600/25">
                  <Search size={18} className="mr-2" /> Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-12 text-base font-semibold rounded-xl shadow-md shadow-emerald-600/25">
                <Link to="/explore">Browse All Listings</Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg" className="px-10 h-12 text-base font-semibold rounded-xl border-slate-200 hover:bg-slate-50">
                  <Link to="/auth">Sign Up Free</Link>
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-14 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-500" />
                <span>Verified properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-500" />
                <span>Instant booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-emerald-500" />
                <span>{stats.cities > 0 ? `${stats.cities} cities` : 'Multiple cities'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ STATISTICS BAND ━━━ */}
      <section className="relative -mt-16 z-10 pb-8">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Properties', value: formatStat(stats.properties), icon: Home, color: 'emerald' },
                { label: 'Members', value: formatStat(stats.guests), icon: Users, color: 'teal' },
                { label: 'Bookings', value: formatStat(stats.bookings), icon: CheckCircle, color: 'cyan' },
                { label: 'Cities', value: formatStat(stats.cities), icon: Building, color: 'green' },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-600/25">
                    <stat.icon size={22} />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ POPULAR CITIES ━━━ */}
      {popularCities.length > 0 && (
        <section className="py-20">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-8 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Explore</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Popular Destinations</h2>
                <p className="text-slate-500 mt-2 text-lg">Trending cities our guests can't stop visiting.</p>
              </div>
              <Link to="/explore" className="text-emerald-600 font-semibold flex items-center gap-1.5 hover:gap-3 transition-all group">
                View all destinations <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {popularCities.map((c, idx) => (
                <Link
                  key={c.city}
                  to={`/explore?city=${encodeURIComponent(c.city)}`}
                  className={`group relative rounded-3xl overflow-hidden ${idx === 0 ? 'lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto' : 'aspect-4/3'}`}
                >
                  <img
                    src={c.image || '/placeholder.webp'}
                    alt={c.city}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="font-bold text-xl text-white mb-1">{c.city}</div>
                    <div className="text-white/70 text-sm flex items-center gap-1.5">
                      <MapPin size={13} />
                      {c.count} {c.count === 1 ? 'property' : 'properties'}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ FEATURED PROPERTIES ━━━ */}
      <section className="py-20 bg-linear-to-b from-slate-50/80 to-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-14 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Featured</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Top-Rated Stays</h2>
              <p className="text-slate-500 mt-2 text-lg">Handpicked properties loved by our community.</p>
            </div>
            <Link to="/explore" className="text-emerald-600 font-semibold flex items-center gap-1.5 hover:gap-3 transition-all group">
              View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="aspect-4/3 bg-slate-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-slate-200 animate-pulse rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-1/2" />
                    <div className="h-6 bg-slate-200 animate-pulse rounded-lg w-1/3 mt-4" />
                  </div>
                </div>
              ))
            ) : properties.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center py-12">No properties yet. Check back soon!</p>
            ) : (
              properties.map((item) => (
                <Link
                  key={item.id}
                  to={`/explore/${item.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <img
                      src={item.main_image || '/placeholder.webp'}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                    <FavoriteButton propertyId={item.id} userId={user?.id} />
                    {item.avg_rating >= 4.5 && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles size={12} /> Top Rated
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base truncate flex-1">{item.title}</h3>
                      {item.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-sm font-semibold ml-3 shrink-0">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          {item.avg_rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
                      <MapPin size={13} /> {item.city}
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-xl font-extrabold text-slate-900">${item.price_per_night}</span>
                      <span className="text-slate-400 text-sm font-medium"> / night</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-1 w-8 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">How it works</span>
              <div className="h-1 w-8 rounded-full bg-emerald-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Book in 3 simple steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Discover', desc: 'Browse verified properties in amazing destinations worldwide.', icon: Search },
              { step: '02', title: 'Book', desc: 'Reserve instantly with secure payments and flexible cancellation.', icon: CheckCircle },
              { step: '03', title: 'Enjoy', desc: 'Arrive and experience your perfect home away from home.', icon: Sparkles },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-slate-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-600 mb-6 group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-600/20">
                  <item.icon size={32} strokeWidth={1.5} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="relative rounded-[2rem] overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-0 right-0 w-125 h-125 bg-emerald-600/15 rounded-full blur-3xl -mt-48 -mr-48" />
            <div className="absolute bottom-0 left-0 w-100 h-100 bg-teal-500/10 rounded-full blur-3xl -mb-48 -ml-48" />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative p-10 md:p-20 text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
                <Sparkles size={14} />
                {user ? 'Your next step' : 'Get started today'}
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                {user
                  ? role === 'host' ? 'List your space and\nstart earning today' : 'Become a host and\nstart earning today'
                  : 'Ready to start your\nnext adventure?'}
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-12 text-lg leading-relaxed">
                Join our community of hosts and travelers. Whether you're looking to book or host, PrimeRent makes it simple.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  role === 'host' ? (
                    <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 h-13 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30">
                      <Link to="/host/create-listing">Create a Listing</Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 h-13 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30">
                      <Link to="/host/dashboard">Become a Host</Link>
                    </Button>
                  )
                ) : (
                  <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 h-13 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30">
                    <Link to="/auth">Join PrimeRent Now</Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="px-10 h-13 text-base font-semibold rounded-xl border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white hover:border-slate-500 transition-all">
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