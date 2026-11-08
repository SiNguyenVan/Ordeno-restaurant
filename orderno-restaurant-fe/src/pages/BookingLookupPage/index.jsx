import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Search,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Truck,
  Compass,
  UtensilsCrossed,
  Copy,
  Check,
  RotateCw,
  ShoppingBag,
  HelpCircle,
  PhoneCall,
  CalendarCheck,
  PartyPopper,
} from 'lucide-react';
import { bookingAPI } from '../../services';
import { lookupFormSchema } from '../../schemas';
import { formatVND } from '../../utils';
import { useRestaurant } from '../../context';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Verification',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400 animate-pulse',
    notice:
      'Your order / table reservation has been received and is currently being verified by the Ordeno restaurant concierge team.',
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    notice:
      'Your reservation is officially confirmed. We look forward to welcoming you to Ordeno fine dining.',
  },
  SEATED: {
    label: 'Seated / Checked-in',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dotClass: 'bg-sky-400 animate-pulse',
    notice:
      'Table is checked in. Bon appétit!',
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dotClass: 'bg-purple-400',
    notice:
      'Service completed. Thank you for dining with Ordeno.',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-400',
    notice:
      'This reservation was cancelled. Please contact concierge hotline if you need assistance.',
  },
};

export default function BookingLookupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { latestBooking } = useRestaurant();

  const [searchType, setSearchType] = useState('phone');
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lookupFormSchema),
    defaultValues: {
      searchType: 'phone',
      searchValue: '',
    },
  });

  const watchedSearchValue = watch('searchValue');

  const executeLookup = useCallback(
    async (type, val) => {
      const trimmed = (val || '').trim();
      if (!trimmed) return;

      setLoading(true);
      setApiError('');
      setBookings(null);

      try {
        const params = {};
        if (type === 'phone') {
          params.phone = trimmed;
        } else if (type === 'email') {
          params.email = trimmed;
        } else {
          params.identifier = trimmed;
        }

        const res = await bookingAPI.lookup(params);
        const data = Array.isArray(res) ? res : res?.data || [];
        setBookings(data);
      } catch (err) {
        console.error('Failed to lookup bookings:', err);
        setApiError(
          err.message || 'Unable to retrieve reservation information. Please check your input and try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto trigger search if URL has query parameters (?phone=... or ?email=... or ?code=...)
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');

    if (phoneParam) {
      setSearchType('phone');
      setValue('searchType', 'phone');
      setValue('searchValue', phoneParam);
      executeLookup('phone', phoneParam);
    } else if (emailParam) {
      setSearchType('email');
      setValue('searchType', 'email');
      setValue('searchValue', emailParam);
      executeLookup('email', emailParam);
    } else if (codeParam) {
      setSearchType('code');
      setValue('searchType', 'code');
      setValue('searchValue', codeParam);
      executeLookup('code', codeParam);
    }
  }, [searchParams, setValue, executeLookup]);

  const onTabChange = (type) => {
    setSearchType(type);
    setValue('searchType', type);
    setValue('searchValue', '');
    setApiError('');
  };

  const onSubmitForm = (data) => {
    executeLookup(data.searchType, data.searchValue);
    const newParams = {};
    if (data.searchType === 'phone') newParams.phone = data.searchValue;
    else if (data.searchType === 'email') newParams.email = data.searchValue;
    else newParams.code = data.searchValue;
    setSearchParams(newParams, { replace: true });
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  const handleQuickLookupLatest = () => {
    if (!latestBooking) return;
    if (latestBooking.customerPhone) {
      setSearchType('phone');
      setValue('searchType', 'phone');
      setValue('searchValue', latestBooking.customerPhone);
      executeLookup('phone', latestBooking.customerPhone);
    } else if (latestBooking.code) {
      setSearchType('code');
      setValue('searchType', 'code');
      setValue('searchValue', latestBooking.code);
      executeLookup('code', latestBooking.code);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 pb-28 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
          <CalendarCheck className="h-3.5 w-3.5" />
          Customer Reservation & Order Lookup
        </div>
        <h1 className="mt-3 font-serif-luxury text-3xl font-bold text-white sm:text-5xl">
          Track Your Reservation & Order Details
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
          Look up table bookings, VIP suites, pre-ordered culinary menus, and home delivery orders using your registered contact phone number or email.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-[#d4af37]/40 bg-gradient-to-b from-[#1c1611] to-[#120f0c] p-6 shadow-2xl sm:p-8">
          {/* Search Type Tabs */}
          <div className="flex rounded-2xl bg-black/40 p-1.5 border border-white/10">
            <button
              type="button"
              onClick={() => onTabChange('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                searchType === 'phone'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0c0a09] shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>Phone Number</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                searchType === 'email'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0c0a09] shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Email Address</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('code')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                searchType === 'code'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0c0a09] shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Booking Code</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="mt-6 space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                {searchType === 'phone' ? (
                  <Phone className="h-5 w-5 text-[#d4af37]" />
                ) : searchType === 'email' ? (
                  <Mail className="h-5 w-5 text-[#d4af37]" />
                ) : (
                  <Search className="h-5 w-5 text-[#d4af37]" />
                )}
              </div>

              <input
                type={searchType === 'email' ? 'email' : 'text'}
                {...register('searchValue')}
                placeholder={
                  searchType === 'phone'
                    ? 'Enter phone number (e.g. 0912345678)'
                    : searchType === 'email'
                      ? 'Enter email address (e.g. guest@example.com)'
                      : 'Enter booking code (e.g. BK-20261110-001)'
                }
                className="w-full rounded-2xl border border-white/15 bg-black/50 py-3.5 pr-28 pl-12 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />

              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold text-[#0c0a09] shadow transition hover:bg-[#e5c349] disabled:opacity-50"
              >
                {loading ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Search</span>
              </button>
            </div>

            {errors.searchValue && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 pl-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.searchValue.message}</span>
              </p>
            )}

            {latestBooking && !bookings && (
              <div className="pt-2 flex items-center justify-between text-xs text-stone-400">
                <span>Recent active session on this device:</span>
                <button
                  type="button"
                  onClick={handleQuickLookupLatest}
                  className="font-semibold text-[#d4af37] hover:underline"
                >
                  Lookup #{latestBooking.code} →
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="mx-auto mt-8 max-w-2xl flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Results Section */}
      <div className="mt-12 space-y-8">
        {bookings !== null && bookings.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#14110e] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-stone-400">
              <Search className="h-8 w-8 text-stone-500" />
            </div>
            <h3 className="mt-4 font-serif-luxury text-xl font-bold text-white">
              No Reservations Found
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-400">
              We could not find any active or past reservations matching "
              <strong className="text-stone-200">{watchedSearchValue}</strong>".
              Please verify your phone number or email, or contact our concierge desk directly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/booking"
                className="rounded-full bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-[#0c0a09] transition hover:bg-[#e5c349]"
              >
                Reserve a Table Now
              </Link>
              <a
                href="tel:0901888379"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-xs font-semibold text-stone-300 hover:bg-white/10"
              >
                Call Hotline: 0901 888 379
              </a>
            </div>
          </div>
        )}

        {bookings !== null && bookings.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  Lookup Results
                </span>
                <h2 className="mt-0.5 font-serif-luxury text-2xl font-bold text-white">
                  Found {bookings.length} Reservation{bookings.length > 1 ? 's' : ''}
                </h2>
              </div>
              <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                Ordered by latest date
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {bookings.map((booking) => {
                const statusMeta =
                  STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                const isDelivery = booking.booking_type === 'DELIVERY';
                const isParty = booking.booking_type === 'PARTY_EVENT';
                const hasPreorder = Array.isArray(booking.items) && booking.items.length > 0;
                const totalAmount =
                  booking.estimated_budget !== null && booking.estimated_budget !== undefined
                    ? Number(booking.estimated_budget)
                    : Number(booking.preorder_total) || 0;

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-[#14110e] shadow-2xl transition hover:border-[#d4af37]/60"
                  >
                    {/* Top Status & Code Header */}
                    <div className="flex flex-col gap-4 border-b border-white/10 bg-black/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base sm:text-lg font-bold text-[#d4af37]">
                            {booking.booking_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(booking.booking_code)}
                            className="rounded-lg p-1 text-stone-400 hover:bg-white/10 hover:text-white"
                            title="Copy booking code"
                          >
                            {copiedCode === booking.booking_code ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Format Badge */}
                        {isDelivery ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-3 py-0.5 text-xs font-semibold text-cyan-300">
                            <Truck className="h-3 w-3" />
                            <span>Delivery Order</span>
                          </span>
                        ) : isParty ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-0.5 text-xs font-semibold text-purple-300">
                            <PartyPopper className="h-3 w-3" />
                            <span>Banquet & Event</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs font-semibold text-stone-300">
                            <span>Table Reservation</span>
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`}
                          />
                          <span>{statusMeta.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Notice for Restaurant Verification */}
                    <div className="border-b border-white/5 bg-[#1b1712] px-5 py-3 text-xs leading-relaxed text-stone-300 sm:px-6">
                      <div className="flex items-center gap-2">
                        {booking.status === 'PENDING' ? (
                          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                        <span>{statusMeta.notice}</span>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-3 border-b border-white/10">
                      {/* Schedule */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                          Schedule & Time
                        </span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Calendar className="h-4 w-4 text-[#d4af37]" />
                          <span>{booking.booking_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-300 font-mono">
                          <Clock className="h-3.5 w-3.5 text-stone-500" />
                          <span>
                            {booking.booking_time ? booking.booking_time.substring(0, 5) : '19:00'} (
                            {booking.duration_minutes || 120} mins)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-300 pt-0.5">
                          <Users className="h-3.5 w-3.5 text-stone-500" />
                          <span>
                            {booking.guest_adults} Adult
                            {booking.guest_adults > 1 ? 's' : ''}
                            {booking.guest_children > 0
                              ? `, ${booking.guest_children} Kid${booking.guest_children > 1 ? 's' : ''}`
                              : ''}
                          </span>
                        </div>
                      </div>

                      {/* Dining Space / Venue */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                          Dining Space / Dispatch
                        </span>
                        {isDelivery ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                              <Truck className="h-4 w-4 shrink-0" />
                              <span>Home Delivery Dispatch</span>
                            </div>
                            <p className="text-xs text-stone-400">
                              Shipped from flagship restaurant kitchen
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#d4af37]">
                              <Compass className="h-4 w-4 shrink-0" />
                              <span>{booking.space_display_name || 'Flagship Dining Room'}</span>
                            </div>
                            <p className="text-xs text-stone-400 font-mono">
                              {booking.rooms_requested || 1} room/table requested
                            </p>
                          </div>
                        )}
                        {booking.event_type && (
                          <div className="text-xs text-purple-300 pt-0.5">
                            Occasion: <strong>{booking.event_type}</strong>
                          </div>
                        )}
                      </div>

                      {/* Customer Contact */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                          Patron Information
                        </span>
                        <div className="text-sm font-semibold text-white">
                          {booking.customer_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-300 font-mono">
                          <Phone className="h-3.5 w-3.5 text-[#d4af37]" />
                          <span>{booking.customer_phone}</span>
                        </div>
                        {booking.customer_email && (
                          <div className="flex items-center gap-2 text-xs text-stone-400 truncate">
                            <Mail className="h-3.5 w-3.5 text-stone-500" />
                            <span className="truncate">{booking.customer_email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pre-ordered Dishes */}
                    {hasPreorder ? (
                      <div className="p-5 sm:p-6 border-b border-white/10 bg-black/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                            <UtensilsCrossed className="h-4 w-4" />
                            <span>
                              Pre-ordered Culinary Menu ({booking.items.length} items)
                            </span>
                          </span>
                          <span className="text-xs font-mono font-semibold text-stone-300">
                            Subtotal: {formatVND(booking.preorder_total || 0)}
                          </span>
                        </div>

                        <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#0c0a09] overflow-hidden">
                          {booking.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 p-3.5 text-xs sm:text-sm"
                            >
                              <div className="flex items-center gap-3">
                                {item.item_image && (
                                  <img
                                    src={item.item_image}
                                    alt={item.item_name}
                                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold text-white">
                                    {item.quantity}x {item.item_name}
                                  </div>
                                  {item.note && (
                                    <p className="text-[11px] italic text-stone-400 mt-0.5">
                                      Note: {item.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right font-mono font-semibold text-[#d4af37]">
                                {formatVND(item.line_total || item.unit_price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Special Requests / Address */}
                    {booking.special_requests && (
                      <div className="p-5 sm:p-6 border-b border-white/10 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                          {isDelivery ? 'Delivery Instructions & Address:' : 'Special Requests:'}
                        </span>
                        <p className="italic text-stone-200 bg-black/40 p-3 rounded-xl border border-white/5">
                          "{booking.special_requests}"
                        </p>
                      </div>
                    )}

                    {/* Footer / Total & Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gradient-to-r from-[#17130f] to-[#120f0c] p-5 sm:p-6">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                          Total Estimated Value
                        </span>
                        <div className="font-serif-luxury text-2xl font-bold text-[#d4af37]">
                          {totalAmount > 0 ? formatVND(totalAmount) : 'Pay at restaurant'}
                        </div>
                        {booking.room_surcharge_total > 0 && (
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            Includes room surcharge: +{formatVND(booking.room_surcharge_total)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to="/thuc-don"
                          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-white/10 transition"
                        >
                          <UtensilsCrossed className="h-3.5 w-3.5" />
                          <span>View Culinary Menu</span>
                        </Link>
                        <Link
                          to="/dat-ban"
                          className="flex items-center gap-1.5 rounded-full bg-[#d4af37] px-5 py-2.5 text-xs font-bold text-[#0c0a09] shadow-lg transition hover:bg-[#e5c349]"
                        >
                          <CalendarCheck className="h-3.5 w-3.5" />
                          <span>Reserve Another Table</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Helpful Tips Section */}
      <div className="mt-16 rounded-3xl border border-white/10 bg-[#120f0c] p-6 sm:p-8">
        <div className="flex items-center gap-2.5 font-serif-luxury text-lg font-bold text-white mb-4">
          <HelpCircle className="h-5 w-5 text-[#d4af37]" />
          <span>Frequently Asked Questions & Concierge Tips</span>
        </div>
        <div className="grid grid-cols-1 gap-5 text-xs text-stone-400 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 rounded-2xl bg-black/30 p-4 border border-white/5">
            <h4 className="font-bold text-stone-200">Where can I find my Booking Code?</h4>
            <p>
              Your booking code (format: <code>BK-YYYYMMDD-XXX</code>) is generated upon booking completion and sent to your contact number.
            </p>
          </div>
          <div className="space-y-1 rounded-2xl bg-black/30 p-4 border border-white/5">
            <h4 className="font-bold text-stone-200">How long does verification take?</h4>
            <p>
              Our hospitality concierge reviews incoming bookings within 5 to 15 minutes during operating hours (10:00 – 23:30).
            </p>
          </div>
          <div className="space-y-1 rounded-2xl bg-black/30 p-4 border border-white/5">
            <h4 className="font-bold text-stone-200">Need immediate adjustments?</h4>
            <p className="flex items-center gap-1.5 text-[#d4af37]">
              <PhoneCall className="h-3.5 w-3.5 shrink-0" />
              <span>Direct Hotline: 0901 888 379</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
