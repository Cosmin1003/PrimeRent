import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Send 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container max-w-7xl mx-auto px-4 py-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block">
              PRIME<span className="text-emerald-500">RENT</span>
            </Link>
            <p className="text-slate-400 mb-8 max-w-sm">
              Discover extraordinary stays and unique experiences around the globe. We make finding your next home-away-from-home simple and secure.
            </p>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Join our newsletter</h4>
              <div className="flex gap-2 max-w-md">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-slate-900 border-slate-800 text-white focus-visible:ring-emerald-500" 
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/explore" className="hover:text-emerald-500 transition-colors">Browse Properties</Link></li>
              <li><Link to="/destinations" className="hover:text-emerald-500 transition-colors">Destinations</Link></li>
              <li><Link to="/trending" className="hover:text-emerald-500 transition-colors">Trending Stays</Link></li>
              <li><Link to="/travel-guides" className="hover:text-emerald-500 transition-colors">Travel Guides</Link></li>
            </ul>
          </div>

          {/* Host Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Hosting</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/host/setup" className="hover:text-emerald-500 transition-colors">Become a Host</Link></li>
              <li><Link to="/host/guidelines" className="hover:text-emerald-500 transition-colors">Host Guidelines</Link></li>
              <li><Link to="/host/resources" className="hover:text-emerald-500 transition-colors">Resources</Link></li>
              <li><Link to="/insurance" className="hover:text-emerald-500 transition-colors">Host Insurance</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/help" className="hover:text-emerald-500 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-500 transition-colors">Safety Information</Link></li>
              <li><Link to="/faqs" className="hover:text-emerald-500 transition-colors">FAQs</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm">
              © {currentYear} PrimeRent Inc. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
            </div>
          </div>

          {/* Socials & Payments */}
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-900 hover:bg-emerald-600 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
            </div>
            {/* Payment Icons Placeholder */}
            <div className="flex gap-3 grayscale opacity-50">
              <div className="w-10 h-6 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px] font-bold">VISA</div>
              <div className="w-10 h-6 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px] font-bold">MC</div>
              <div className="w-10 h-6 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px] font-bold">AMEX</div>
              <div className="w-10 h-6 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px] font-bold">PAYPAL</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;