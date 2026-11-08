import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Crown,
  Briefcase,
  Utensils,
} from 'lucide-react';
import { useAdminAuth } from '../../../context';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const destination = location.state?.from?.pathname || '/admin/staff';

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, destination, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter your username and password.');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(result.message || 'Invalid username or password.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to the authentication server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0a09] px-4 py-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(180,83,9,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_80%)]" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#996515] p-0.5 shadow-xl shadow-[#d4af37]/20 transition duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0a09]">
                <ShieldCheck className="h-6 w-6 text-[#d4af37]" />
              </div>
            </div>
          </Link>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#d4af37] uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Executive Portal</span>
          </div>

          <h1 className="mt-3 font-serif-luxury text-3xl font-bold tracking-tight text-white">
            ORDENO RESTAURANT
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            Internal Administration & Staff Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#18130f] to-[#120f0c] p-7 shadow-2xl shadow-black/80 backdrop-blur-sm sm:p-8">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-stone-300 uppercase">
                Username or Email
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <User className="h-4 w-4 text-[#d4af37]" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or email address..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pr-4 pl-10 text-sm text-white placeholder-stone-500 transition focus:border-[#d4af37] focus:bg-black/60 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold tracking-wider text-stone-300 uppercase">
                  Password
                </label>
                <span className="text-[11px] text-stone-400">Enterprise Secure</span>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Lock className="h-4 w-4 text-[#d4af37]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pr-11 pl-10 text-sm text-white placeholder-stone-500 transition focus:border-[#d4af37] focus:bg-black/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#b8860b] py-3.5 text-sm font-bold text-[#0c0a09] shadow-lg shadow-[#d4af37]/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0c0a09]" />
                  <span>Authenticating session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pills */}
          <div className="mt-8 border-t border-white/10 pt-5">
            <span className="block text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
              Demo Credentials (1-click autofill):
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'Admin@123')}
                className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-2.5 py-1.5 text-xs font-semibold text-[#f5d77f] transition hover:bg-[#d4af37]/20"
              >
                <Crown className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('manager_d1', 'Manager@123')}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
              >
                <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                <span>D1 Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('chef_kenji', 'Chef@123')}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-stone-300 transition hover:bg-white/10"
              >
                <Utensils className="h-3.5 w-3.5 text-stone-400" />
                <span>Head Chef</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-stone-400 transition hover:text-[#d4af37] hover:underline"
          >
            ← Return to Ordeno dining homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
