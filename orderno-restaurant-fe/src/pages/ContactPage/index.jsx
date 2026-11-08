import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  CalendarCheck,
  UtensilsCrossed,
  ShieldCheck,
  ChevronDown,
  Navigation,
  Building2,
  Headphones,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const INQUIRY_TYPES = [
  'VIP Suite & Table Reservations',
  'Corporate Banquet & Executive Dining',
  'Private Celebration & Birthday Styling',
  'Haute Catering & Private Chef Services',
  'Guest Feedback & Culinary Inquiries',
  'Media, Partnerships & Brand Inquiries',
];

const FAQS = [
  {
    q: 'How far in advance should I reserve a VIP Suite or Garden Table?',
    a: 'For private VIP chambers and prime Zen Garden tables by the koi pond, we recommend booking 2 to 7 days in advance. Same-day reservations are welcome based on live availability, preferably at least 30 minutes prior to arrival.',
  },
  {
    q: 'Can Ordeno curate customized banquet menus and accommodate dietary requirements?',
    a: 'Yes, our Executive Culinary Team curates bespoke omakase and banquet set menus tailored to your exact tastes. We seamlessly accommodate vegetarian, gluten-free, halal-friendly, and specific seafood allergy specifications upon prior notice.',
  },
  {
    q: 'Is valet parking available for automobiles and motorcycles?',
    a: 'Ordeno offers dedicated, 100% complimentary valet parking with professional attendants, as well as spacious parking bays capable of accommodating executive sedans and SUVs.',
  },
  {
    q: 'What is the corkage policy for personal vintage wines and spirits?',
    a: 'Guests are welcome to bring cherished vintage wines. A reasonable corkage service fee applies for glassware presentation, aeration, and sommelier decanting. Diamond members enjoy complimentary corkage for up to 2 bottles per gathering.',
  },
  {
    q: 'Does Ordeno provide floral decor and audio-visual setups for corporate events?',
    a: 'Yes, our dedicated event concierge arranges complimentary fresh floral arrangements and candlelight settings. High-definition presentation screens, wireless microphones, and acoustic sound systems are available in select VIP suites at no additional charge.',
  },
];

const FLAGSHIP_STORE = {
  name: 'Ordeno Fine Dining Sanctuary',
  address: '108 Nguyen Du Street, Ben Thanh Ward, District 1, Ho Chi Minh City',
  city: 'Ho Chi Minh City',
  hotline: '0901 888 379',
  hours: '10:00 AM – 10:30 PM',
  image_url:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  map_url: 'https://maps.google.com/?q=108+Nguyen+Du+District+1+Ho+Chi+Minh+City',
};

export default function ContactPage() {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState(INQUIRY_TYPES[0]);
  const [guestCount, setGuestCount] = useState('3-6 guests');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [formError, setFormError] = useState('');

  // Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setFormError('Please provide your Full Name, Phone Number, and Email Address.');
      return;
    }
    setFormError('');
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      const ticketId = 'INQ-' + Math.floor(1000 + Math.random() * 9000);
      setSubmittedTicket({
        ticketId,
        fullName,
        phone,
        email,
        inquiryType,
        guestCount,
        message,
        createdAt: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f5d77f', '#ffffff', '#10b981'],
      });
    }, 700);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setFormError('');
  };

  return (
    <div className="space-y-20 pb-24">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden border-b border-[#d4af37]/20 bg-[#0c0a09] pt-12 pb-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(180,83,9,0.12),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
              <Headphones className="h-3.5 w-3.5" />
              Concierge Service & Guest Relations
            </div>

            <h1 className="mt-5 font-serif-luxury text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Connect with{' '}
              <span className="bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#b8860b] bg-clip-text text-transparent">
                Ordeno Concierge
              </span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-stone-300 sm:text-lg">
              Whether arranging an executive contract banquet, a bespoke anniversary celebration, or inquiring about our fresh live seafood shipments, our guest concierge team is at your complete service.
            </p>
          </div>

          {/* Quick Highlight Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#18130f] to-[#100d0a] p-6 text-left transition hover:border-[#d4af37]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30">
                <PhoneCall className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif-luxury text-lg font-bold text-white">
                VIP Concierge Hotline
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                Direct booking assistance & table confirmations
              </p>
              <a
                href="tel:0901888379"
                className="mt-3 inline-block font-semibold text-[#d4af37] hover:underline"
              >
                0901 888 379
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#18130f] to-[#100d0a] p-6 text-left transition hover:border-[#d4af37]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif-luxury text-lg font-bold text-white">
                Banquets & Media
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                Event proposals, partnerships & catering
              </p>
              <a
                href="mailto:concierge@ordeno.vn"
                className="mt-3 inline-block font-semibold text-[#d4af37] hover:underline"
              >
                concierge@ordeno.vn
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#18130f] to-[#100d0a] p-6 text-left transition hover:border-[#d4af37]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif-luxury text-lg font-bold text-white">
                Dining Hours
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                Continuous kitchen service 7 days a week
              </p>
              <span className="mt-3 inline-block font-semibold text-stone-200">
                10:00 AM – 10:30 PM
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#18130f] to-[#100d0a] p-6 text-left transition hover:border-[#d4af37]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif-luxury text-lg font-bold text-white">
                Direct Reservation
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                Instant confirmation for VIP Suites & Zen Garden
              </p>
              <Link
                to="/booking"
                className="mt-3 inline-flex items-center gap-1 font-semibold text-[#d4af37] hover:underline"
              >
                <span>Reserve Online</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN SECTION: CONTACT FORM & STORE SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column (7 cols): Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#14110e] p-6 sm:p-10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                    Direct Inquiry Form
                  </span>
                  <h2 className="mt-1 font-serif-luxury text-2xl font-bold text-white sm:text-3xl">
                    Send a Message to Our Concierge
                  </h2>
                </div>
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/30">
                  <Send className="h-5 w-5" />
                </div>
              </div>

              {submittedTicket ? (
                <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <span className="mt-4 inline-block rounded-full bg-[#d4af37]/20 px-3.5 py-1 text-xs font-bold text-[#d4af37]">
                    Ticket ID #{submittedTicket.ticketId}
                  </span>
                  <h3 className="mt-3 font-serif-luxury text-2xl font-bold text-white">
                    Thank You, {submittedTicket.fullName}!
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-stone-300">
                    Your request has been routed to our Lead Guest Concierge at <strong>{FLAGSHIP_STORE.name}</strong>. We will review your inquiry and reach out via phone ({submittedTicket.phone}) or email within 15–30 minutes.
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleResetForm}
                      className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-xs font-semibold text-stone-200 hover:bg-white/10"
                    >
                      Send Another Inquiry
                    </button>
                    <Link
                      to="/booking"
                      className="rounded-full bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-[#0c0a09] transition hover:bg-[#e5c349]"
                    >
                      Reserve a Table Now
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {formError && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Row 1: Name, Phone, Email */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jonathan Lee"
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+84 901 234 567"
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="guest@company.com"
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Inquiry Type & Guest Count */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300">
                        Nature of Inquiry
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                      >
                        {INQUIRY_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[#14110e]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300">
                        Estimated Guest Count
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                      >
                        <option value="1-2 guests" className="bg-[#14110e]">
                          1–2 guests (Romantic / Executive)
                        </option>
                        <option value="3-6 guests" className="bg-[#14110e]">
                          3–6 guests (Intimate Gathering)
                        </option>
                        <option value="7-15 guests" className="bg-[#14110e]">
                          7–15 guests (VIP Chamber Feast)
                        </option>
                        <option value="16-30 guests" className="bg-[#14110e]">
                          16–30 guests (Corporate Milestone)
                        </option>
                        <option value="30+ guests" className="bg-[#14110e]">
                          30+ guests (Grand Banquet Hall)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300">
                      Message & Special Requests
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please share any desired dining date, dietary preferences, wine requests, or event details..."
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  {/* Privacy & Guarantee note */}
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
                    <span>
                      Your contact details are strictly confidential and protected by Ordeno Guest Privacy Standards.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] py-4 text-sm font-bold text-[#0c0a09] shadow-xl shadow-[#d4af37]/25 transition hover:scale-[1.01] hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Concierge Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Flagship Store Showcase & Map */}
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#1b1510] to-[#120f0c] p-6 shadow-xl transform-gpu">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                  <Building2 className="h-4 w-4" />
                  Flagship Location & Directions
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  Valet Parking Ready
                </span>
              </div>

              <h3 className="mt-2 font-serif-luxury text-xl font-bold text-white">
                {FLAGSHIP_STORE.name}
              </h3>
              <p className="mt-1 text-xs text-stone-300">{FLAGSHIP_STORE.address}</p>

              {/* Map Visual Preview / Directions Button */}
              <div className="relative mt-4 h-56 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <img
                  src={FLAGSHIP_STORE.image_url}
                  alt={FLAGSHIP_STORE.name}
                  decoding="async"
                  className="h-full w-full object-cover opacity-65"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120f0c] via-transparent to-black/30" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-lg bg-black/85 px-2.5 py-1 text-[11px] font-medium text-stone-200">
                    📍 {FLAGSHIP_STORE.city}
                  </span>
                  <a
                    href={FLAGSHIP_STORE.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#d4af37] px-3.5 py-1.5 text-xs font-bold text-[#0c0a09] shadow-lg transition hover:bg-[#e5c349]"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 rounded-xl bg-white/5 p-4 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Direct Hotline:</span>
                  <a
                    href="tel:0901888379"
                    className="font-bold text-[#d4af37] hover:underline"
                  >
                    {FLAGSHIP_STORE.hotline}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Opening Hours:</span>
                  <span className="font-semibold text-white">{FLAGSHIP_STORE.hours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Automobile Parking:</span>
                  <span className="font-semibold text-emerald-300">
                    Free Valet Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONCIERGE FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Guest Inquiries & Policy
          </div>
          <h2 className="mt-3 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Answers to common questions regarding VIP reservations, custom banquets, and dining privileges.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#14110e] transition hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#d4af37] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="overflow-hidden border-t border-white/5 bg-black/20">
                    <p className="p-5 text-xs leading-relaxed text-stone-300">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BANQUET & TABLE RESERVATION CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[#1d1610] via-[#2a1e13] to-[#15100c] p-8 text-center sm:p-12">
          <div className="mx-auto max-w-2xl">
            <span className="rounded-full bg-[#d4af37]/20 px-3.5 py-1 text-xs font-bold text-[#d4af37] uppercase">
              Immediate Table Placement
            </span>
            <h2 className="mt-3 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
              Ready for an Unforgettable Culinary Evening?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">
              Skip the inquiry wait and secure your private VIP chamber or serene Zen Garden table directly through our online reservation engine.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/booking"
                className="flex items-center gap-2 rounded-full bg-[#d4af37] px-7 py-3.5 text-xs font-bold text-[#0c0a09] shadow-xl shadow-[#d4af37]/25 transition hover:scale-105 hover:bg-[#e5c349]"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Reserve VIP Table Now</span>
              </Link>
              <Link
                to="/menu"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <UtensilsCrossed className="h-4 w-4 text-[#d4af37]" />
                <span>Explore Digital Menu</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
