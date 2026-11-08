import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CalendarCheck,
  UtensilsCrossed,
  ShieldCheck,
  ChefHat,
  Wine,
  MapPin,
  PhoneCall,
  Clock,
  ArrowRight,
  Plus,
  Navigation,
  Flame,
  Loader2,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '../../utils';
import { useRestaurant } from '../../context';
import { itemMenuAPI, spaceTypeAPI } from '../../services';

const parseAttributes = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export default function AboutPage() {
  const navigate = useNavigate();
  const { setPreselectedSpaceId, addToCart } = useRestaurant();

  const [bestSellers, setBestSellers] = useState([]);
  const [spaceTypes, setSpaceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAboutData() {
      try {
        setLoading(true);
        setApiError(null);

        const [bestSellersData, spaceTypesData] = await Promise.all([
          itemMenuAPI.getTopBestSellers(5),
          spaceTypeAPI.getAll(),
        ]);

        if (isMounted) {
          setBestSellers(Array.isArray(bestSellersData) ? bestSellersData : []);
          setSpaceTypes(Array.isArray(spaceTypesData) ? spaceTypesData : []);
        }
      } catch (err) {
        console.error('Error loading data from API:', err);
        if (isMounted) {
          setApiError(err.message || 'Unable to load data from the API server.');
          setBestSellers([]);
          setSpaceTypes([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAboutData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBookSpace = (spaceId) => {
    setPreselectedSpaceId(spaceId);
    navigate('/booking');
  };

  const handleAddDishToCart = (dish) => {
    const attrs = parseAttributes(dish.attributes);
    const finalPrice =
      dish.discount_price != null ? Number(dish.discount_price) : Number(dish.original_price);
    const originalPrice = dish.discount_price != null ? Number(dish.original_price) : null;

    addToCart({
      dish: {
        id: dish.id,
        name: dish.name,
        price: finalPrice,
        originalPrice,
        original_price: dish.original_price,
        discount_price: dish.discount_price,
        image: dish.image_url,
        image_url: dish.image_url,
        unit: attrs.unit || '',
      },
      quantity: 1,
      note: '',
    });
  };

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden border-b border-[#d4af37]/20 bg-[#0c0a09] pt-10 pb-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(180,83,9,0.12),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Architectural Masterpiece & Haute Gastronomy
              </div>

              <h1 className="mt-6 font-serif-luxury text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
                Convergence of Oriental <br />
                <span className="bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#b8860b] bg-clip-text text-transparent">
                  Haute Cuisine
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg">
                Welcome to <strong>Ordeno Restaurant</strong> — the prestigious destination uniting serene ecological Zen gardens, private VIP chambers, and refined culinary artistry.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/booking"
                  className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-7 py-4 text-sm font-bold text-[#0c0a09] shadow-xl shadow-[#d4af37]/25 transition hover:scale-[1.02] hover:brightness-110"
                >
                  <CalendarCheck className="h-5 w-5" />
                  <span>Reserve Table & VIP Suite</span>
                </Link>

                <Link
                  to="/menu"
                  className="flex items-center gap-2.5 rounded-full border border-[#d4af37]/40 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition hover:border-[#d4af37] hover:bg-white/10"
                >
                  <UtensilsCrossed className="h-5 w-5 text-[#d4af37]" />
                  <span>Explore Menu</span>
                </Link>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-[#17130f] p-3 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85"
                  alt="Ordeno Fine Dining"
                  loading="eager"
                  decoding="async"
                  className="h-[420px] w-full rounded-2xl object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#d4af37]/30 bg-[#14110e]/95 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase">
                        Online Pre-Booking Privileges
                      </span>
                      <h3 className="mt-0.5 font-serif-luxury text-lg font-bold text-white">
                        VIP Suites & Table Reservations
                      </h3>
                    </div>
                    <Link
                      to="/booking"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-[#0c0a09] transition hover:scale-105"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Error Notification */}
      {apiError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{apiError}</p>
          </div>
        </div>
      )}

      {/* 2. BRAND PHILOSOPHY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a1510] to-[#120f0c] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30">
              <Wine className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-serif-luxury text-2xl font-bold text-white">
              Opulent Atmosphere
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              Sophisticated architecture, acoustically private VIP chambers, and refreshing open-air Zen gardens deliver an unparalleled ambiance for intimate dining and executive hosting.
            </p>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#231c13] to-[#120f0c] p-8 shadow-lg shadow-[#d4af37]/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37] text-[#0c0a09]">
              <ChefHat className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-serif-luxury text-2xl font-bold text-white">
              Art of Live Seafood
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              Every dish features scrupulously selected ingredients, prepared with culinary finesse to preserve natural sweetness and sublime ocean flavors.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a1510] to-[#120f0c] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-serif-luxury text-2xl font-bold text-white">
              Seamless Reservations
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              Intuitive online reservation system with advance menu selection ensuring your bespoke feast is ready the moment you take your seat.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURAL DINING SPACES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
              <span>Architectural Spaces</span>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d4af37]" />}
            </div>
            <h2 className="mt-2 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
              Select Your Dining Atmosphere
            </h2>
          </div>
          <p className="max-w-md text-sm text-stone-400">
            Versatile dining spaces tailored to every occasion from romantic rendezvous to grand banquets.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : spaceTypes.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#14110e] p-8 text-center text-sm text-stone-400">
            No dining spaces currently available.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {spaceTypes.map((space) => {
              const imgUrl = space.image_url || space.image;
              return (
                <div
                  key={space.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#14110e] transition-transform duration-200 hover:-translate-y-1 hover:border-[#d4af37]/50 transform-gpu"
                >
                  <div>
                    {imgUrl && (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={space.name}
                          decoding="async"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105 will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-black/20 to-transparent" />
                        {space.badge && (
                          <span className="absolute top-4 left-4 rounded-full bg-[#d4af37] px-3 py-1 text-xs font-bold text-[#0c0a09] shadow">
                            {space.badge}
                          </span>
                        )}
                        {space.capacity && (
                          <span className="absolute top-4 right-4 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-stone-200">
                            {space.capacity}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif-luxury text-2xl font-bold text-white">
                          {space.name}
                        </h3>
                        {space.surcharge && (
                          <span className="text-xs font-semibold text-[#d4af37]">
                            {space.surcharge}
                          </span>
                        )}
                      </div>
                      {space.description && (
                        <p className="mt-2 text-sm leading-relaxed text-stone-300">
                          {space.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 p-6 pt-4">
                    <button
                      onClick={() => handleBookSpace(space.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d4af37]/15 px-4 py-2.5 text-xs font-semibold text-[#d4af37] ring-1 ring-[#d4af37]/40 transition hover:bg-[#d4af37] hover:text-[#0c0a09]"
                    >
                      <CalendarCheck className="h-4 w-4" />
                      <span>Reserve this space</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. TOP 5 BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[#d4af37]/20 bg-gradient-to-b from-[#17130f] to-[#0f0c0a] p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Top 5 Best Selling Dishes</span>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d4af37]" />}
              </div>
              <h2 className="mt-2 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
                Chef Signature Best Sellers
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#d4af37] hover:underline"
            >
              <span>View full menu</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#120f0c] p-8 text-center text-sm text-stone-400">
              No best selling dishes found.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {bestSellers.map((dish, index) => {
                const attrs = parseAttributes(dish.attributes);
                const price =
                  dish.discount_price != null ? dish.discount_price : dish.original_price;
                const hasDiscount =
                  dish.discount_price != null && dish.discount_price < dish.original_price;

                return (
                  <div
                    key={dish.id}
                    onClick={() => navigate(`/menu/${dish.id}`)}
                    className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120f0c] transition-all duration-200 hover:border-[#d4af37]/40 hover:shadow-lg hover:shadow-[#d4af37]/5 transform-gpu"
                  >
                    <div>
                      {dish.image_url && (
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={dish.image_url}
                            alt={dish.name}
                            decoding="async"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105 will-change-transform"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/85 px-2.5 py-0.5 text-[11px] font-bold text-[#d4af37]">
                            <Flame className="h-3 w-3 text-amber-400" />
                            <span>Top #{index + 1}</span>
                          </div>

                          {dish.discount_percent && (
                            <div className="absolute top-2.5 right-2.5 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                              -{dish.discount_percent}%
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4">
                        {attrs.unit && (
                          <div className="text-[11px] font-medium text-stone-400">
                            Unit: {attrs.unit}
                          </div>
                        )}
                        <h3 className="mt-1 line-clamp-2 font-serif-luxury text-base font-bold text-white group-hover:text-[#f5d77f]">
                          {dish.name}
                        </h3>
                        {dish.description && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-400">
                            {dish.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                      <div>
                        <div className="text-sm font-bold text-[#d4af37]">
                          {formatVND(price)}
                        </div>
                        {hasDiscount && (
                          <div className="text-[11px] text-stone-500 line-through">
                            {formatVND(dish.original_price)}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddDishToCart(dish);
                        }}
                        className="flex items-center gap-1 rounded-full bg-[#d4af37] px-3 py-1.5 text-xs font-bold text-[#0c0a09] transition hover:bg-[#e5c349] active:scale-95"
                        title="Add to menu"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. FLAGSHIP RESTAURANT LOCATION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#14110e] p-6 sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
                <Building2 className="h-4 w-4" />
                <span>Our Sanctuary</span>
              </div>
              <h2 className="font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
                Ordeno Fine Dining Flagship
              </h2>
              <p className="text-sm leading-relaxed text-stone-300">
                Situated in the heart of downtown Ho Chi Minh City, our flagship sanctuary blends tranquil Zen garden architecture with private VIP dining suites and complimentary valet parking.
              </p>

              <div className="space-y-2.5 pt-2 text-sm text-stone-300">
                <p className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-[#d4af37]" />
                  <span>108 Nguyen Du Street, Ben Thanh Ward, District 1, Ho Chi Minh City</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <PhoneCall className="h-4 w-4 shrink-0 text-[#d4af37]" />
                  <span className="font-semibold text-[#d4af37]">0901 888 379</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-[#d4af37]" />
                  <span>10:00 AM – 10:30 PM (Open Daily)</span>
                </p>
              </div>

              <div className="pt-3">
                <a
                  href="https://maps.google.com/?q=108+Nguyen+Du+District+1+Ho+Chi+Minh+City"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-5 py-2.5 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0c0a09]"
                >
                  <Navigation className="h-4 w-4" />
                  <span>View Directions on Google Maps</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                alt="Ordeno Flagship Sanctuary"
                decoding="async"
                className="h-64 w-full rounded-2xl object-cover shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
