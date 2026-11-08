import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  PhoneCall,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#d4af37]/20 bg-[#080706] text-stone-400">
      {/* Ordeno Rewards Banner */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#1c1610] via-[#251d13] to-[#1c1610]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37]/20 text-[#d4af37] ring-1 ring-[#d4af37]/40">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-xl font-bold text-white">
                Ordeno Privilege & Rewards Club
              </h3>
              <p className="mt-1 text-sm text-stone-300">
                Earn 10% credit back, enjoy complimentary VIP birthday floral styling, and exclusive Chef Emperor Sashimi gifts for Diamond members.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              to="/booking"
              className="flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0c0a09] shadow-lg shadow-[#d4af37]/20 transition hover:bg-[#e5c349]"
            >
              <span>Book Table with Privilege</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/50 bg-[#1a1510]">
                <span className="font-serif-luxury text-xl font-bold text-[#d4af37]">O</span>
              </div>
              <div>
                <span className="font-serif-luxury text-2xl font-bold tracking-widest text-white">
                  ORDENO
                </span>
                <p className="text-[10px] tracking-widest text-[#d4af37] uppercase">
                  Oriental Gastronomy & VIP Lounge
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Ordeno Restaurant represents the harmonious confluence of serene Zen garden landscapes, opulent private VIP chambers, and premier Japanese-Vietnamese live seafood and sashimi traditions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-stone-300">
              <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
                100% Live Swimming Seafood
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                <Sparkles className="h-4 w-4 text-[#d4af37]" />
                Private VIP Suites & Zen Garden
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="font-serif-luxury text-lg font-semibold text-white">
              Discover Ordeno
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="transition hover:text-[#d4af37]">
                  • Brand Heritage & Dining Spaces
                </Link>
              </li>
              <li>
                <Link to="/menu" className="transition hover:text-[#d4af37]">
                  • Digital E-Menu & Live Seafood
                </Link>
              </li>
              <li>
                <Link to="/booking" className="transition hover:text-[#d4af37]">
                  • Zen Garden & VIP Suite Booking
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-[#d4af37]">
                  • Online Cart & Pre-ordering
                </Link>
              </li>
              <li>
                <Link to="/tra-cuu" className="transition hover:text-[#d4af37]">
                  • Track Reservation & Order Status
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[#d4af37]">
                  • Concierge & Location Contacts
                </Link>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-stone-200">
                <Clock className="h-4 w-4 text-[#d4af37]" />
                Operating Hours
              </div>
              <p className="mt-1 text-stone-400">
                10:00 AM – 10:30 PM (Everyday & Holidays)
              </p>
            </div>
          </div>

          {/* Single Flagship Store */}
          <div className="lg:col-span-5">
            <h4 className="font-serif-luxury text-lg font-semibold text-white">
              Flagship Sanctuary
            </h4>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#d4af37]/40">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-base font-bold text-stone-100">
                  Ordeno Fine Dining Flagship
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#d4af37]">
                  <PhoneCall className="h-3.5 w-3.5" />
                  0901 888 379
                </span>
              </div>
              <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-stone-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />
                <span>
                  108 Nguyen Du Street, Ben Thanh Ward, District 1, Ho Chi Minh City
                </span>
              </p>
              <p className="mt-2 text-xs text-stone-400">
                Complimentary Valet Parking • Private VIP Chambers • Zen Garden Koi Pond
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex-row">
          <p>© 2026 Ordeno Restaurant. All rights reserved.</p>
          <p>Oriental Haute Gastronomy & Private VIP Suites.</p>
        </div>
      </div>
    </footer>
  );
}
