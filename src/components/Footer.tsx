import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Home,
  Search,
  Heart,
  CalendarDays,
  LayoutDashboard,
  PlusCircle,
  List,
  ClipboardList,
  ArrowUp,
  UserPlus,
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FooterProps {
  user?: { id: string } | null;
}

const Footer: React.FC<FooterProps> = ({ user }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data) setRole(data.role);
      } else {
        setRole(null);
      }
    };
    getRole();
  }, [user]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container max-w-7xl mx-auto px-4 py-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand & Contact */}
          <div>
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block">
              PRIME<span className="text-emerald-500">RENT</span>
            </Link>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              {t('footer.brandDescription')}
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:support@primerent.com" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Mail size={14} className="text-emerald-500 shrink-0" />
                  support@primerent.com
                </a>
              </li>
              <li>
                <a href="tel:+18001234567" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Phone size={14} className="text-emerald-500 shrink-0" />
                  0766 799 799
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin size={14} className="text-emerald-500 shrink-0" />
                Brasov, Romania
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-white font-semibold mb-6">{t('footer.discover')}</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Home size={14} className="shrink-0" /> {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link to="/explore" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Search size={14} className="shrink-0" /> {t('footer.exploreProperties')}
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Heart size={14} className="shrink-0" /> {t('footer.myFavorites')}
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <CalendarDays size={14} className="shrink-0" /> {t('footer.myBookings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-white font-semibold mb-6">{t('footer.hosting')}</h4>
            {role === 'host' ? (
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/host/dashboard" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                    <LayoutDashboard size={14} className="shrink-0" /> {t('footer.hostDashboard')}
                  </Link>
                </li>
                <li>
                  <Link to="/host/create-listing" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                    <PlusCircle size={14} className="shrink-0" /> {t('footer.createListing')}
                  </Link>
                </li>
                <li>
                  <Link to="/host/manage-listings" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                    <List size={14} className="shrink-0" /> {t('footer.manageListings')}
                  </Link>
                </li>
                <li>
                  <Link to="/host/reservations" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                    <ClipboardList size={14} className="shrink-0" /> {t('footer.reservations')}
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/host/dashboard" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                    <UserPlus size={14} className="shrink-0" /> {t('footer.becomeHost')}
                  </Link>
                </li>
                <li className="text-slate-500 text-xs leading-relaxed">
                  {t('footer.becomeHostDesc')}
                </li>
              </ul>
            )}
          </div>

          {/* Account & Social */}
          <div>
            <h4 className="text-white font-semibold mb-6">{t('footer.account')}</h4>
            <ul className="space-y-4 text-sm mb-8">
              <li>
                <Link to="/profile" className="hover:text-emerald-500 transition-colors">{t('footer.myProfile')}</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-emerald-500 transition-colors">{t('footer.logInSignUp')}</Link>
              </li>
            </ul>

            <h4 className="text-white font-semibold mb-4">{t('footer.followUs')}</h4>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            {t('footer.allRightsReserved', { year: currentYear })}
          </p>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;