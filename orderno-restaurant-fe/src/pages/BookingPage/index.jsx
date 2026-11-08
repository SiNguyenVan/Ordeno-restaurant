import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  CheckCircle2,
  PhoneCall,
  User,
  Mail,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  Search,
} from 'lucide-react';
import { spaceTypeAPI, bookingAPI } from '../../services';
import { formatVND } from '../../utils';
import { useRestaurant } from '../../context';

const TIME_SLOTS = {
  lunch: ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30'],
  dinner: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
};

const OCCASIONS = [
  'Business Hosting / Contract Signing',
  'Intimate Family Reunion',
  'Birthday Celebration',
  'Anniversary / Romantic Date',
  'Corporate Banquet & Celebration',
];

const EXTRAS = [
  'Fresh flower & romantic candlelight setup (Complimentary)',
  'Baby high-chair preparation',
  'Dedicated private butler service in VIP Suite',
  'Corporate VAT invoice requested',
];

const DEFAULT_SPACES = [
  {
    id: 1,
    code: 'STANDARD',
    name: 'Phòng Thường (Khu Vực Chung)',
    description: 'Không gian mở thanh lịch, thoáng đãng với ánh sáng ấm cúng phù hợp bữa ăn gia đình và bạn bè.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=75',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=75',
    badge: 'Standard Dining',
    capacity: '2 – 8 guests',
    surcharge: 'Complimentary',
    surcharge_fee: 0,
  },
  {
    id: 2,
    code: 'VIP',
    name: 'Phòng VIP Sakura Riêng Tư',
    description: 'Phòng VIP phong cách Nhật Bản riêng tư tuyệt đối, cách âm cao cấp với quản gia phục vụ riêng.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=75',
    image_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=75',
    badge: 'VIP Lounge',
    capacity: '6 – 12 guests',
    surcharge: '+200.000 VND',
    surcharge_fee: 200000,
  },
  {
    id: 3,
    code: 'GARDEN',
    name: 'Phòng Sân Vườn Ánh Sao',
    description: 'Không gian ngoài trời bên hồ cá Koi xanh mát, lý tưởng cho những buổi tối lãng mạn dưới ánh đèn.',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=400&q=75',
    image_url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=400&q=75',
    badge: 'Zen Garden',
    capacity: '4 – 16 guests',
    surcharge: '+150.000 VND',
    surcharge_fee: 150000,
  },
  {
    id: 4,
    code: 'BANQUET',
    name: 'Sảnh Tiệc Lớn Hoàng Gia',
    description: 'Sảnh tiệc lộng lẫy trang bị màn hình LED và âm thanh chuyên nghiệp dành cho tiệc công ty và liên hoan.',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=400&q=75',
    image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=400&q=75',
    badge: 'Grand Banquet',
    capacity: '20 – 60 guests',
    surcharge: '+500.000 VND',
    surcharge_fee: 500000,
  },
  {
    id: 5,
    code: 'POOL',
    name: 'Tiệc bể bơi',
    description: 'Không gian tiệc bể bơi sôi động, hiện đại và sang trọng.',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=75',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=75',
    badge: 'Pool Party',
    capacity: '10 – 30 guests',
    surcharge: 'Complimentary',
    surcharge_fee: 0,
  },
];

let cachedSpaces = null;

function getOptimizedImageUrl(url, width = 400) {
  if (!url) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=75';
  }
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&q=75`;
  }
  return url;
}

export default function BookingPage() {
  const {
    preselectedSpaceId,
    cartItems,
    cartTotal,
    confirmBooking,
    latestBooking,
    hydrateCart,
    storedCart,
  } = useRestaurant();

  useEffect(() => {
    if (cartItems.length === 0 && storedCart?.length > 0) {
      hydrateCart();
    }
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Instant render with cached or default spaces - ZERO latency
  const [spaces, setSpaces] = useState(() => cachedSpaces || DEFAULT_SPACES);
  const [selectedSpace, setSelectedSpace] = useState(() => {
    if (preselectedSpaceId) return preselectedSpaceId;
    return (cachedSpaces || DEFAULT_SPACES)[0]?.id || 1;
  });
  const [loadingSpaces, setLoadingSpaces] = useState(() => !cachedSpaces);
  const [apiError, setApiError] = useState(null);

  const [bookingDate, setBookingDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(0);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [selectedExtras, setSelectedExtras] = useState([EXTRAS[0]]);
  const [attachCartMenu, setAttachCartMenu] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Background revalidation (SWR) for live database sync without blocking the UI
  useEffect(() => {
    let isMounted = true;
    async function loadSpaces() {
      try {
        const data = await spaceTypeAPI.getAll();
        const spaceList = Array.isArray(data) && data.length > 0 ? data : DEFAULT_SPACES;
        cachedSpaces = spaceList;
        if (isMounted) {
          setSpaces(spaceList);
          setSelectedSpace((prev) => {
            if (preselectedSpaceId && spaceList.some((s) => s.id === preselectedSpaceId)) {
              return preselectedSpaceId;
            }
            const exists = spaceList.some((s) => s.id === prev);
            return exists ? prev : spaceList[0].id;
          });
        }
      } catch (err) {
        console.warn('Using cached dining spaces:', err);
      } finally {
        if (isMounted) setLoadingSpaces(false);
      }
    }
    loadSpaces();
    return () => {
      isMounted = false;
    };
  }, [preselectedSpaceId]);

  const toggleExtra = (item) => {
    setSelectedExtras((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const currentSpace = spaces.find((s) => s.id === selectedSpace) || spaces[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your Full Name and Phone Number so our concierge can reach you.');
      return;
    }
    if (!currentSpace) {
      setErrorMsg('Please select a dining space.');
      return;
    }
    setErrorMsg('');

    const combinedSpecialNote = [
      occasion ? `Occasion: ${occasion}` : '',
      selectedExtras.length > 0 ? `Extras: ${selectedExtras.join('; ')}` : '',
      specialNote ? specialNote.trim() : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const preorderItemsPayload =
      attachCartMenu && Array.isArray(cartItems)
        ? cartItems
            .filter((item) => item.id)
            .map((item) => ({
              menu_item_id: Number(item.id),
              quantity: Number(item.quantity) || 1,
              note: item.note || null,
            }))
        : [];

    let bookingCode = 'BK-' + Math.floor(1000 + Math.random() * 9000);

    try {
      const apiPayload = {
        booking_type: adults + children >= 10 ? 'PARTY_EVENT' : 'REGULAR_TABLE',
        space_type_id: Number(currentSpace.id),
        rooms_requested: 1,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        booking_date: bookingDate,
        booking_time: selectedTime,
        duration_minutes: 120,
        guest_adults: Number(adults) || 2,
        guest_children: Number(children) || 0,
        event_type: occasion || null,
        special_requests: combinedSpecialNote || null,
        items: preorderItemsPayload,
      };

      const createdRes = await bookingAPI.createPublic(apiPayload);
      const createdData = createdRes?.data || createdRes;
      if (createdData?.booking_code) {
        bookingCode = createdData.booking_code;
      }
    } catch (err) {
      console.error('Error submitting reservation to server:', err);
      setErrorMsg(err.message || 'Unable to submit reservation. Please verify your details.');
      return;
    }

    const newBooking = {
      code: bookingCode,
      space: currentSpace,
      date: bookingDate,
      time: selectedTime,
      adults,
      children,
      occasion,
      extras: selectedExtras,
      customerName,
      customerPhone,
      customerEmail,
      specialNote,
      attachedItems: attachCartMenu ? cartItems : [],
      attachedTotal: attachCartMenu ? cartTotal : 0,
      createdAt: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#f5d77f', '#ffffff', '#10b981'],
    });

    setSubmittedBooking(newBooking);
    confirmBooking(newBooking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
          <CalendarCheck className="h-3.5 w-3.5" />
          Online Table & VIP Suite Reservation System
        </div>
        <h1 className="mt-3 font-serif-luxury text-3xl font-bold text-white sm:text-5xl">
          Advance Reservations — Prepared with Meticulous Care
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-stone-300">
          Please reserve at least 30 minutes in advance so Ordeno can prepare your Zen Garden, Omakase Counter, or Private VIP Suite flawlessly.
        </p>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      {/* Confirmation Banner */}
      {submittedBooking && (
        <div
          className="mb-10 overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-[#151e18] to-[#14110e] p-6 shadow-2xl sm:p-8"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Reservation Confirmed Successfully • Booking Code #{submittedBooking.code}
              </div>
              <h2 className="font-serif-luxury text-2xl font-bold text-white sm:text-3xl">
                Thank you {submittedBooking.customerName}! Your table has been reserved.
              </h2>
              <p className="text-sm text-stone-300">
                Dining Space:{' '}
                <strong className="text-[#d4af37]">{submittedBooking.space?.name}</strong>
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-stone-300">
                <span>
                  📅 Date: <strong>{submittedBooking.date}</strong>
                </span>
                <span>
                  ⏰ Arrival Time: <strong>{submittedBooking.time}</strong>
                </span>
                <span>
                  👥 Guests:{' '}
                  <strong>
                    {submittedBooking.adults} adult{submittedBooking.adults > 1 ? 's' : ''}
                    {submittedBooking.children > 0
                      ? `, ${submittedBooking.children} child${submittedBooking.children > 1 ? 'ren' : ''}`
                      : ''}
                  </strong>
                </span>
                <span>
                  🎉 Occasion: <strong>{submittedBooking.occasion}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/tra-cuu?code=${encodeURIComponent(submittedBooking.code)}`}
                className="flex items-center gap-2 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/15 px-5 py-3 text-xs font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0c0a09]"
              >
                <Search className="h-4 w-4" />
                <span>Track Reservation Status</span>
              </Link>
              <Link
                to="/menu"
                className="flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-xs font-bold text-[#0c0a09] shadow-lg transition hover:bg-[#e5c349]"
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span>Select Dishes for This Table</span>
              </Link>
              <button
                onClick={() => setSubmittedBooking(null)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-stone-200 hover:bg-white/10"
              >
                Reserve Another Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {/* STEP 1 */}
          <div className="rounded-3xl border border-white/10 bg-[#14110e] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-[#0c0a09]">
                  1
                </span>
                <h2 className="font-serif-luxury text-2xl font-bold text-white">
                  Select Dining Atmosphere & VIP Suite
                </h2>
              </div>
              <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                {spaces.length} dining rooms available
              </span>
            </div>

            {loadingSpaces ? (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : spaces.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-xs text-stone-400">
                No room configurations available at the moment.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {spaces.map((space) => {
                  const active = selectedSpace === space.id;
                  return (
                    <div
                      key={space.id}
                      onClick={() => setSelectedSpace(space.id)}
                      className={`group flex cursor-pointer gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 transform-gpu ${
                        active
                          ? 'border-[#d4af37] bg-[#d4af37]/15 shadow-md shadow-[#d4af37]/10'
                          : 'border-white/10 bg-black/20 hover:border-white/25'
                      }`}
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                        <img
                          src={getOptimizedImageUrl(space.image || space.image_url, 360)}
                          alt={space.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-wider text-[#d4af37] uppercase">
                            {space.badge || 'Standard'}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {space.capacity || `${space.min_capacity}–${space.max_capacity} guests`}
                          </span>
                        </div>
                        <h3 className="mt-0.5 font-serif-luxury text-lg font-bold text-white">
                          {space.name}
                        </h3>
                        {space.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-stone-400">
                            {space.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-stone-300">
                            {space.surcharge || (Number(space.surcharge_fee) > 0 ? `+${formatVND(space.surcharge_fee)}` : 'Free room fee')}
                          </span>
                          {active && (
                            <span className="font-bold text-[#d4af37]">✓ Selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2 */}
          <div className="rounded-3xl border border-white/10 bg-[#14110e] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-[#0c0a09]">
                2
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-white">
                Dining Time & Guest Count
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Dining Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Adults
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-white/15 bg-black/40 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="h-8 w-8 rounded-lg bg-white/5 text-white hover:bg-white/15"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white">{adults} guests</span>
                  <button
                    type="button"
                    onClick={() => setAdults(adults + 1)}
                    className="h-8 w-8 rounded-lg bg-white/5 text-white hover:bg-white/15"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Children (Baby chair needed)
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-white/15 bg-black/40 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="h-8 w-8 rounded-lg bg-white/5 text-white hover:bg-white/15"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white">{children} kids</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="h-8 w-8 rounded-lg bg-white/5 text-white hover:bg-white/15"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-stone-400">
                  Lunch Hours:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIME_SLOTS.lunch.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedTime === t
                          ? 'bg-[#d4af37] text-[#0c0a09] shadow'
                          : 'border border-white/10 bg-black/30 text-stone-300 hover:border-white/25'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-stone-400">
                  Dinner Hours (Most Popular):
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIME_SLOTS.dinner.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedTime === t
                          ? 'bg-[#d4af37] text-[#0c0a09] shadow'
                          : 'border border-white/10 bg-black/30 text-stone-300 hover:border-white/25'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="rounded-3xl border border-white/10 bg-[#14110e] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-[#0c0a09]">
                3
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-white">
                Contact Information & Special Requests
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Full Name *
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pr-4 pl-10 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Phone Number for Booking Code *
                </label>
                <div className="relative mt-1.5">
                  <PhoneCall className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+84 901 234 567"
                    className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pr-4 pl-10 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Confirmation Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="guest@email.com"
                    className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pr-4 pl-10 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold text-stone-300">
                Dining Occasion:
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    type="button"
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      occasion === occ
                        ? 'bg-[#d4af37]/20 text-[#d4af37] ring-1 ring-[#d4af37]'
                        : 'border border-white/10 bg-black/30 text-stone-300 hover:border-white/20'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold text-stone-300">
                Complimentary & Dedicated Services:
              </label>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {EXTRAS.map((extra) => {
                  const checked = selectedExtras.includes(extra);
                  return (
                    <label
                      key={extra}
                      onClick={() => toggleExtra(extra)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition ${
                        checked
                          ? 'border-[#d4af37]/60 bg-[#d4af37]/10 text-white'
                          : 'border-white/10 bg-black/20 text-stone-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="accent-[#d4af37]"
                      />
                      <span>{extra}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold text-stone-300">
                Special Requests (Table near Koi pond, birthday greeting board text...)
              </label>
              <textarea
                rows={2}
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="Enter your special requests..."
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 p-3.5 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Sticky Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-b from-[#1b1611] to-[#120f0c] p-6 shadow-2xl transform-gpu">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[11px] font-semibold tracking-widest text-[#d4af37] uppercase">
                Reservation Summary
              </span>
              <h3 className="mt-1 font-serif-luxury text-2xl font-bold text-white">
                Ordeno Fine Dining
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                10:00 – 22:30 Daily • Complimentary Valet Parking
              </p>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Space:</span>
                <span className="font-semibold text-[#d4af37]">
                  {currentSpace?.name || 'Loading space...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Time:</span>
                <span className="font-semibold text-white">
                  {selectedTime} • Date: {bookingDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Guests:</span>
                <span className="font-semibold text-white">
                  {adults} adults {children > 0 ? `+ ${children} kids` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Occasion:</span>
                <span className="font-medium text-stone-200">{occasion}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Pre-ordered Menu with Table
                </span>
                <Link
                  to="/menu"
                  className="text-xs font-semibold text-[#d4af37] hover:underline"
                >
                  {cartItems.length > 0 ? 'Edit dishes' : '+ Pre-order dishes'}
                </Link>
              </div>

              {cartItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={attachCartMenu}
                      onChange={(e) => setAttachCartMenu(e.target.checked)}
                      className="accent-[#d4af37]"
                    />
                    <span>
                      Pre-order <strong>{cartItems.length} dishes</strong> in cart ({formatVND(cartTotal)})
                    </span>
                  </label>
                  <div className="max-h-32 space-y-1 overflow-y-auto border-t border-white/10 pt-2 text-[11px] text-stone-400">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} className="flex justify-between">
                        <span className="truncate pr-2">
                          {item.quantity}x {item.dish.name}
                        </span>
                        <span className="shrink-0 text-stone-300">
                          {formatVND(item.dish.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-stone-400">
                  You may reserve a table now and order upon arrival, or pre-order dishes to minimize waiting time.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-[#d4af37]/10 p-3.5 text-xs text-stone-300 ring-1 ring-[#d4af37]/30">
              <div className="flex items-center gap-1.5 font-semibold text-[#d4af37]">
                <ShieldCheck className="h-4 w-4" />
                5-Star Table Guarantee
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-300">
                Table is held for up to 20 minutes past the reservation time. Online reservations are 100% complimentary.
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingSpaces || !selectedSpace}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] py-4 text-sm font-bold text-[#0c0a09] shadow-xl shadow-[#d4af37]/25 transition hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarCheck className="h-5 w-5" />
              <span>Confirm Reservation Now</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
