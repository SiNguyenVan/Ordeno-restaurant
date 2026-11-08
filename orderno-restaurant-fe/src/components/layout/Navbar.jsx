import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  CalendarCheck,
  ShoppingBag,
  Sparkles,
  PhoneCall,
  MapPin,
  Menu,
  X,
  CheckCircle2,
  Headphones,
  Search,
} from 'lucide-react';
import { useRestaurant } from '../../context';
import { formatVND } from '../../utils';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, cartTotal, latestBooking } = useRestaurant();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Story & Spaces',
      shortLabel: 'About',
      icon: Sparkles,
    },
    {
      path: '/thuc-don',
      label: 'Menu & Order',
      shortLabel: 'Menu',
      icon: UtensilsCrossed,
    },
    {
      path: '/dat-ban',
      label: 'Reservations & VIP',
      shortLabel: 'Booking',
      icon: CalendarCheck,
      badge: latestBooking ? 'Booked' : null,
    },
    {
      path: '/tra-cuu',
      label: 'Track Booking',
      shortLabel: 'Lookup',
      icon: Search,
    },
    {
      path: '/contact',
      label: 'Contact & Concierge',
      shortLabel: 'Contact',
      icon: Headphones,
    },
    {
      path: '/gio-hang',
      label: 'Cart',
      shortLabel: 'Cart',
      icon: ShoppingBag,
      count: cartCount,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#d4af37]/20 bg-[#0c0a09]/95 backdrop-blur-md transform-gpu">
      {/* Top Bar */}
      <div className="hidden border-b border-white/5 bg-[#14110e] py-1.5 text-xs text-stone-300 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#d4af37]">
              <MapPin className="h-3.5 w-3.5" />
              Locations in District 3, District 1 & Thu Duc City
            </span>
            <span className="text-stone-400">|</span>
            <span>
              Daily Opening Hours: <strong className="text-stone-200">10:00 – 23:30</strong>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/tra-cuu"
              className="flex items-center gap-1.5 font-medium text-stone-300 hover:text-[#d4af37] transition"
            >
              <Search className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>Track Reservation</span>
            </Link>
            {latestBooking && (
              <Link
                to="/tra-cuu"
                className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/25"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  Reserved: <strong>#{latestBooking.code}</strong> ({latestBooking.time})
                </span>
              </Link>
            )}
            <a
              href="tel:0901888379"
              className="flex items-center gap-1.5 font-medium text-[#d4af37] hover:underline"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              VIP Event Hotline: 0901 888 379
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d4af37]/50 bg-gradient-to-br from-[#261f16] to-[#120f0b] shadow-lg shadow-[#d4af37]/10 transition group-hover:border-[#d4af37]">
            <span className="font-serif-luxury text-2xl font-bold tracking-wider text-[#d4af37]">
              O
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-xl font-bold tracking-widest text-white sm:text-2xl">
                ORDENO
              </span>
              <span className="rounded bg-[#d4af37]/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-[#d4af37] uppercase ring-1 ring-[#d4af37]/30">
                Fine Dining
              </span>
            </div>
            <p className="text-[11px] tracking-wider text-stone-400">
              ORIENTAL HARMONY • JAPANESE-VIETNAMESE FUSION
            </p>
          </div>
        </Link>

        {/* Desktop Nav Pills */}
        <nav className="hidden items-center gap-1.5 xl:gap-2 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-full px-3.5 xl:px-4.5 py-2 text-xs xl:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] font-semibold text-[#0c0a09] shadow-lg shadow-[#d4af37]/25'
                      : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? 'text-[#0c0a09]' : 'text-[#d4af37]'
                      }`}
                    />
                    <span>{item.label}</span>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? 'bg-[#0c0a09]/20 text-[#0c0a09]'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.count > 0 && (
                      <span
                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                          isActive
                            ? 'bg-[#0c0a09] text-[#d4af37]'
                            : 'bg-[#d4af37] text-[#0c0a09]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Cart & Booking Summary on Desktop/Tablet */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/gio-hang"
            className="flex items-center gap-2.5 rounded-full border border-[#d4af37]/40 bg-[#1a1612] px-3.5 py-2 text-xs font-medium text-stone-200 transition hover:border-[#d4af37] hover:bg-[#241e18]"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-[#d4af37]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#e11d48] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-[10px] text-stone-400">Cart Total</div>
              <div className="font-semibold text-[#d4af37]">
                {cartCount > 0 ? formatVND(cartTotal) : '0 VND'}
              </div>
            </div>
          </Link>

          <Link
            to="/dat-ban"
            className="hidden rounded-full bg-white/10 px-4 py-2.5 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-[#d4af37] hover:text-[#0c0a09] sm:inline-flex lg:hidden"
          >
            Book Table
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-200 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Quick Tabs */}
      <div className="flex border-t border-white/10 bg-[#120f0c] lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition ${
                isActive
                  ? 'bg-[#d4af37]/10 text-[#d4af37]'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d4af37] px-1 text-[10px] font-bold text-[#0c0a09]">
                    {item.count}
                  </span>
                )}
              </div>
              <span>{item.shortLabel}</span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-10 rounded-full bg-[#d4af37]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="overflow-hidden border-t border-white/10 bg-[#14110e] lg:hidden">
          <div className="space-y-2 px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-[#d4af37] font-semibold text-[#0c0a09]'
                      : 'text-stone-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.count > 0 && (
                    <span className="rounded-full bg-[#0c0a09] px-2.5 py-0.5 text-xs font-bold text-[#d4af37]">
                      {item.count} items
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

