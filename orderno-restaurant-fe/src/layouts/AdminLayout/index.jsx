import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  Users,
  LayoutDashboard,
  UtensilsCrossed,
  CalendarCheck,
  Building2,
  Compass,
  Layers,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../context';

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navLinks = [
    {
      to: '/admin/staff',
      label: 'Staff Management',
      icon: Users,
      badge: 'Core',
    },
    {
      to: '/admin/spaces',
      label: 'Rooms & Spaces',
      icon: Compass,
    },
    {
      to: '/admin/menu',
      label: 'Menu Management',
      icon: UtensilsCrossed,
    },
    {
      to: '/admin/bookings',
      label: 'Reservations',
      icon: CalendarCheck,
    },
    {
      to: '/admin',
      label: 'System Overview',
      icon: LayoutDashboard,
      end: true,
    },
  ];

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'ADMIN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MANAGER':
        return 'bg-[#d4af37]/20 text-[#f5d77f] border-[#d4af37]/40';
      case 'CHEF':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0c0a09] text-stone-200">
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-[#d4af37]/20 bg-[#120f0c] p-5 lg:flex">
        <div className="space-y-6">
          {/* Brand Seal */}
          <Link to="/admin/staff" className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#996515] p-0.5 shadow-lg shadow-[#d4af37]/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0a09]">
                <ShieldCheck className="h-6 w-6 text-[#d4af37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-luxury text-lg font-bold tracking-tight text-white">
                  ORDENO
                </span>
                <span className="rounded bg-[#d4af37]/20 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-[#d4af37] uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Executive Management</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <span className="px-3 text-[10px] font-bold tracking-wider text-stone-500 uppercase">
              Management Modules
            </span>

            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-2xl px-3.5 py-3 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0c0a09] shadow-lg shadow-[#d4af37]/20'
                        : 'text-stone-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? 'text-[#0c0a09]' : 'text-stone-400 group-hover:text-[#d4af37]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className="rounded-full bg-[#d4af37]/20 px-2 py-0.5 text-[10px] font-bold text-[#d4af37]">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Current Logged-in Staff Card */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#16120e] p-3.5">
          <div className="flex items-center gap-3">
            <img
              src={
                adminUser?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              }
              alt={adminUser?.full_name}
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-[#d4af37]/40"
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-white">
                {adminUser?.full_name || 'Administrator'}
              </h4>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`inline-block rounded-full border px-1.5 py-0.2 text-[9px] font-bold uppercase ${getRoleBadgeStyle(
                    adminUser?.role
                  )}`}
                >
                  {adminUser?.role || 'STAFF'}
                </span>
                {adminUser?.branch_name && (
                  <span className="truncate text-[10px] text-stone-400">
                    {adminUser.branch_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
            <Link
              to="/"
              className="flex items-center gap-1 text-[11px] text-stone-400 transition hover:text-[#d4af37]"
              title="Visit customer site"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              title="Sign out of system"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex w-72 flex-col justify-between border-r border-[#d4af37]/20 bg-[#120f0c] p-5 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-[#d4af37]" />
                  <span className="font-serif-luxury text-lg font-bold text-white">
                    ORDENO ADMIN
                  </span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold ${
                          isActive
                            ? 'bg-[#d4af37] font-bold text-[#0c0a09]'
                            : 'text-stone-300 hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                logout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0c0a09]/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-stone-300 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="hidden sm:inline">Ordeno Administration</span>
              <ChevronRight className="hidden h-3.5 w-3.5 sm:inline" />
              <span className="font-semibold text-[#d4af37]">
                {location.pathname === '/admin/staff'
                  ? 'Staff & Access Control'
                  : location.pathname === '/admin/menu'
                  ? 'Menu & Culinary Management'
                  : 'Executive Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-stone-300 transition hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Customer Site</span>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#16120e] px-3 py-1 text-xs text-stone-300 md:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
