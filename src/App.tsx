import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { Navbar1 } from "./components/navbar1";
import ExplorePage from "./pages/ExplorePage";
import PropertyPage from "./pages/PropertyPage";
import BookingsPage from "./pages/BookingsPage";
import FavoritesPage from "./pages/FavoritesPage";
import Footer from "./components/Footer";
import ProfilePage from "./pages/ProfilePage";
import HostDashboardPage from "./pages/HostDashboardPage";
import HostReservationPage from "./pages/HostReservationPage";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="bg-white min-h-screen" />;

  return (
    <Router>
      <Navbar1 user={session?.user} />
      {/* <Navbar user={session?.user} /> */}
      <main className="pt-16 min-h-screen bg-gray-50 text-slate-900">
        <Routes>
          <Route path="/" element={<HomePage user={session?.user} />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/:id" element={<PropertyPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/host/dashboard" element={<HostDashboardPage />} />
          <Route path="/host/reservations" element={<HostReservationPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
