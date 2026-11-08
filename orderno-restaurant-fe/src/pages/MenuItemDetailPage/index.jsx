import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Sparkles,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  UtensilsCrossed,
  CalendarCheck,
  Truck,
  ShieldCheck,
  ChefHat,
  MapPin,
  Users,
  Scale,
  Wine,
  Layers,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Zap,
  Tag,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatVND } from '../../utils';
import { useRestaurant } from '../../context';
import { itemMenuAPI } from '../../services';

function getOptimizedImageUrl(url, width = 800) {
  if (!url) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80';
  }
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&q=80`;
  }
  return url;
}

const parseAttributes = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object' && raw !== null) return raw;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

function formatAttributeKey(key) {
  if (!key) return '';
  const keyMap = {
    unit: 'Portion / Unit',
    serving: 'Recommended Serving',
    serving_size: 'Serving Size',
    origin: 'Ingredient Origin',
    beef_grade: 'Meat Grade',
    grade: 'Quality Grade',
    weight: 'Net Weight',
    pieces: 'Pieces per Set',
    volume: 'Bottle Volume',
    alcohol: 'ABV / Alcohol',
    spiciness: 'Spiciness Level',
    spicy_level: 'Spiciness Level',
    cooking_time: 'Cooking Time',
    preparation_time: 'Preparation Time',
    prep_time: 'Preparation Time',
    time: 'Preparation Time',
    calories: 'Energy / Calories',
    calo: 'Calories',
    allergens: 'Allergen Notice',
    temperature: 'Serving Temperature',
    raw: 'Culinary Style',
    dietary: 'Dietary Info',
    taste: 'Flavor Profile',
  };

  const lower = String(key).toLowerCase();
  if (keyMap[lower]) return keyMap[lower];

  return String(key)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getAttributeIcon(key) {
  const k = (key || '').toLowerCase();
  if (k.includes('spic') || k.includes('cay') || k.includes('chili') || k.includes('pepper')) return Flame;
  if (k.includes('serv') || k.includes('guest') || k.includes('khau_phan') || k.includes('person') || k.includes('people')) return Users;
  if (k.includes('time') || k.includes('prep') || k.includes('cook') || k.includes('thoi_gian')) return Clock;
  if (k.includes('calo') || k.includes('energy') || k.includes('kcal') || k.includes('dinh_duong')) return Zap;
  if (k.includes('origin') || k.includes('xuat_xu') || k.includes('source') || k.includes('country')) return MapPin;
  if (k.includes('weight') || k.includes('gram') || k.includes('kg') || k.includes('scale') || k.includes('khoi_luong')) return Scale;
  if (k.includes('wine') || k.includes('alcohol') || k.includes('abv') || k.includes('drink') || k.includes('beverage') || k.includes('volume')) return Wine;
  if (k.includes('grade') || k.includes('star') || k.includes('quality') || k.includes('beef')) return Sparkles;
  if (k.includes('allergen') || k.includes('di_ung') || k.includes('warning') || k.includes('notice')) return AlertCircle;
  if (k.includes('chef') || k.includes('style') || k.includes('raw') || k.includes('recipe')) return ChefHat;
  if (k.includes('unit') || k.includes('portion') || k.includes('don_vi') || k.includes('set')) return Layers;
  return Tag;
}

export default function MenuItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orderMode, setOrderMode, addToCart, cartCount, cartTotal } = useRestaurant();

  const [dish, setDish] = useState(null);
  const [relatedDishes, setRelatedDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order customization state
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const [justAddedRelatedId, setJustAddedRelatedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    async function fetchDishDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await itemMenuAPI.getById(id);
        if (!isMounted) return;

        setDish(data);
        setQuantity(1);
        setNote('');

        // Fetch related dishes in the same category
        if (data?.category_id) {
          const relatedData = await itemMenuAPI.getAll({
            category_id: data.category_id,
            limit: 8,
          });
          if (isMounted) {
            const list = Array.isArray(relatedData) ? relatedData : [];
            const filtered = list.filter((item) => Number(item.id) !== Number(data.id)).slice(0, 4);
            setRelatedDishes(filtered);
          }
        }
      } catch (err) {
        console.error('Error loading dish detail:', err);
        if (isMounted) {
          setError(err.message || 'Unable to load dish details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDishDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const attrs = useMemo(() => parseAttributes(dish?.attributes), [dish]);

  const activePrice = useMemo(() => {
    if (!dish) return 0;
    return dish.discount_price != null
      ? Number(dish.discount_price)
      : Number(dish.original_price);
  }, [dish]);

  const hasDiscount = useMemo(() => {
    if (!dish) return false;
    return dish.discount_price != null && Number(dish.discount_price) < Number(dish.original_price);
  }, [dish]);

  const savedAmount = useMemo(() => {
    if (!hasDiscount || !dish) return 0;
    return Number(dish.original_price) - Number(dish.discount_price);
  }, [hasDiscount, dish]);

  const normalizeDishForCart = (targetDish) => {
    const itemAttrs = parseAttributes(targetDish.attributes);
    const finalPrice =
      targetDish.discount_price != null
        ? Number(targetDish.discount_price)
        : Number(targetDish.original_price);
    const originalPrice =
      targetDish.discount_price != null ? Number(targetDish.original_price) : null;
    const unit =
      itemAttrs.unit ||
      itemAttrs.serving_size ||
      (itemAttrs.serving ? `Serving: ${itemAttrs.serving}` : 'Standard portion');

    return {
      id: targetDish.id,
      name: targetDish.name,
      price: finalPrice,
      originalPrice,
      original_price: targetDish.original_price,
      discount_price: targetDish.discount_price,
      image: targetDish.image_url,
      image_url: targetDish.image_url,
      unit,
    };
  };

  const handleAddToCart = () => {
    if (!dish) return;
    const formattedDish = normalizeDishForCart(dish);
    addToCart({
      dish: formattedDish,
      quantity,
      note: note.trim(),
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleOrderNow = () => {
    if (!dish) return;
    const formattedDish = normalizeDishForCart(dish);
    addToCart({
      dish: formattedDish,
      quantity,
      note: note.trim(),
    });
    navigate('/cart');
  };

  const handleQuickAddRelated = (e, relatedDish) => {
    e.stopPropagation();
    const formattedDish = normalizeDishForCart(relatedDish);
    addToCart({
      dish: formattedDish,
      quantity: 1,
      note: '',
    });
    setJustAddedRelatedId(relatedDish.id);
    setTimeout(() => setJustAddedRelatedId(null), 1200);
  };

  // Build structured specifications list dynamically from all attributes
  const specsList = useMemo(() => {
    if (!dish) return [];
    const list = [];
    const entries = Object.entries(attrs);

    entries.forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') return;
      let displayValue = String(val);
      if (typeof val === 'boolean') {
        displayValue = val ? 'Yes' : 'No';
      } else if (key === 'raw') {
        displayValue = val ? 'Sashimi Grade (Chilled Raw)' : 'Cooked / Warm';
      } else if ((key === 'spicy_level' || key === 'spiciness') && !isNaN(Number(val))) {
        const level = Number(val);
        displayValue = level === 0 ? 'Mild / Non-spicy' : `Level ${level} Spicy`;
      } else if (key === 'pieces' && !String(val).toLowerCase().includes('piece')) {
        displayValue = `${val} pieces`;
      }

      list.push({
        rawKey: key,
        label: formatAttributeKey(key),
        value: displayValue,
        icon: getAttributeIcon(key),
      });
    });

    if (list.length === 0) {
      list.push(
        { rawKey: 'portion', label: 'Portion / Unit', value: 'Standard Portion', icon: Layers },
        { rawKey: 'prep', label: 'Preparation', value: 'Prepared fresh upon order', icon: ChefHat },
        { rawKey: 'standards', label: 'Quality Standards', value: '5-Star Michelin Standard', icon: Sparkles }
      );
    }

    return list;
  }, [dish, attrs]);

  const modeOptions = [
    {
      id: 'pre-order',
      label: 'Pre-order for Table',
      desc: 'Ready upon your arrival',
      icon: CalendarCheck,
    },
    {
      id: 'delivery',
      label: 'Haute Delivery (Ship)',
      desc: 'Thermal & gel-ice packed',
      icon: Truck,
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-white/5" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="h-[460px] animate-pulse rounded-3xl bg-white/5 lg:col-span-6" />
          <div className="space-y-5 lg:col-span-6">
            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-white/5" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5" />
            <div className="h-44 w-full animate-pulse rounded-2xl bg-white/5" />
            <div className="h-16 w-full animate-pulse rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-rose-500/30 bg-[#14110e] p-10 shadow-2xl">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
          <h1 className="mt-4 font-serif-luxury text-3xl font-bold text-white">
            Dish Not Found
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            {error || 'The culinary dish you are looking for is unavailable or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-3 text-xs font-bold text-[#0c0a09] transition hover:bg-[#e5c349]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Full Menu</span>
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = dish.is_available !== 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6">
      {/* Breadcrumb & Back Navigation */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
          <Link to="/menu" className="font-medium text-stone-300 hover:text-[#d4af37]">
            Menu & Order
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-600" />
          {dish.category_name && (
            <>
              <Link
                to="/menu"
                className="font-medium text-stone-300 hover:text-[#d4af37]"
              >
                {dish.category_name}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-stone-600" />
            </>
          )}
          <span className="line-clamp-1 font-semibold text-[#d4af37]">{dish.name}</span>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#14110e] px-4 py-2 text-xs font-semibold text-stone-200 transition hover:border-[#d4af37] hover:text-[#d4af37]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Menu</span>
        </button>
      </div>

      {/* Main Dish Showcase (2 Columns) */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column (6 cols): Image & Specifications */}
        <div className="space-y-6 lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-[#14110e] shadow-2xl">
            <img
              src={getOptimizedImageUrl(dish.image_url, 900)}
              alt={dish.name}
              decoding="async"
              className="h-[380px] w-full object-cover sm:h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-transparent to-black/30" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {dish.is_best_seller === 1 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4af37] px-3.5 py-1 text-xs font-bold text-[#0c0a09] shadow-lg">
                  <Flame className="h-3.5 w-3.5" />
                  <span>Chef Best Seller</span>
                </span>
              )}
              {(dish.is_on_promo === 1 || hasDiscount) && (
                <span className="rounded-full bg-[#e11d48] px-3.5 py-1 text-xs font-bold text-white shadow-lg">
                  {dish.discount_percent ? `-${dish.discount_percent}% OFF` : 'Special Offer'}
                </span>
              )}
              {dish.is_new === 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-bold text-[#0c0a09] shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>New Creation</span>
                </span>
              )}
            </div>

            {/* Availability Badge */}
            <div className="absolute top-4 right-4">
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-black/80 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Available Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-black/80 px-3 py-1 text-xs font-semibold text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Temporarily Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Culinary Specifications Card */}
          <div className="rounded-3xl border border-white/10 bg-[#14110e] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold tracking-wider text-[#d4af37] uppercase">
                Culinary Specifications & Product Attributes
              </h3>
              <span className="rounded-full bg-[#d4af37]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#f5d77f]">
                {specsList.length} Attributes
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {specsList.map((spec) => {
                const SpecIcon = spec.icon;
                return (
                  <div
                    key={spec.rawKey || spec.label}
                    className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-black/25 p-3.5 transition-colors hover:border-white/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                      <SpecIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-medium text-stone-400">{spec.label}</div>
                      <div className="truncate text-sm font-bold text-white">{spec.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality Guarantee Banner */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#14110e] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37]">
                <ChefHat className="h-4 w-4" />
                <span>Master Chef Craftsmanship</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                Prepared to order using air-flown seafood and certified premium ingredients.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#14110e] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37]">
                <ShieldCheck className="h-4 w-4" />
                <span>5-Star Hygiene & Packaging</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                Delivered in thermal-insulated boxes with Japanese gel ice packs for sashimi.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Details, Customization & Ordering */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#19140f] to-[#120f0c] p-6 shadow-2xl sm:p-8">
            {/* Category, Title & Reference */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {dish.category_name && (
                  <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#d4af37] ring-1 ring-[#d4af37]/30">
                    {dish.category_name}
                  </span>
                )}
                {attrs.origin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-stone-300">
                    <MapPin className="h-3 w-3 text-[#d4af37]" />
                    {attrs.origin}
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-stone-500">
                Item #{dish.id} • /{dish.slug}
              </span>
            </div>

            <h1 className="mt-3 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
              {dish.name}
            </h1>

            {dish.description && (
              <p className="mt-3 text-sm leading-relaxed text-stone-300 sm:text-base">
                {dish.description}
              </p>
            )}

            {dish.category_description && (
              <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2 text-xs text-stone-400">
                <span className="font-semibold text-stone-300">{dish.category_name}:</span> {dish.category_description}
              </div>
            )}

            {/* Quick Attribute Pills */}
            {specsList.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {specsList.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <span
                      key={spec.rawKey || spec.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-stone-300 shadow-sm"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span className="text-[11px] text-stone-400">{spec.label}:</span>
                      <span className="text-[11px] font-bold text-white">{spec.value}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Price Box */}
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div>
                <span className="text-xs text-stone-400">
                  Price per {attrs.unit || attrs.serving_size || attrs.serving || 'portion'}:
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-serif-luxury text-3xl font-bold text-[#d4af37]">
                    {formatVND(activePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-stone-500 line-through">
                      {formatVND(dish.original_price)}
                    </span>
                  )}
                </div>
              </div>

              {hasDiscount && (
                <div className="rounded-xl bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 ring-1 ring-rose-500/30">
                  Save {formatVND(savedAmount)}
                </div>
              )}
            </div>

            {/* Order Mode Selector */}
            <div className="mt-6">
              <label className="block text-xs font-semibold tracking-wider text-stone-400 uppercase">
                1. Dining & Service Mode
              </label>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {modeOptions.map((m) => {
                  const Icon = m.icon;
                  const active = orderMode === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setOrderMode(m.id)}
                      className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                        active
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-white shadow-md shadow-[#d4af37]/10'
                          : 'border-white/10 bg-black/25 text-stone-400 hover:border-white/20 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Icon
                          className={`h-4 w-4 ${
                            active ? 'text-[#d4af37]' : 'text-stone-400'
                          }`}
                        />
                        {active && <span className="h-2 w-2 rounded-full bg-[#d4af37]" />}
                      </div>
                      <div className="mt-1.5 text-xs font-bold text-white">{m.label}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-stone-400">
                        {m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Chef Notes */}
            <div className="mt-6">
              <label className="block text-xs font-semibold tracking-wider text-stone-400 uppercase">
                2. Special Chef Notes (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Less spicy, extra fresh wasabi, serve as first course..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            {/* Quantity & Action Buttons */}
            <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-stone-300">Quantity:</span>
                  <div className="flex items-center rounded-full border border-white/15 bg-black/40 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 hover:bg-white/10"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-stone-400">Subtotal</div>
                  <div className="font-serif-luxury text-2xl font-bold text-[#d4af37]">
                    {formatVND(activePrice * quantity)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    justAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0c0a09] shadow-[#d4af37]/20 hover:brightness-110'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added to Order!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Order</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={handleOrderNow}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#d4af37]/50 bg-[#d4af37]/15 px-6 py-4 text-sm font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0c0a09] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Order & View Cart</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Dishes Section */}
      {relatedDishes.length > 0 && (
        <div className="mt-16 border-t border-white/10 pt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
                Curated Recommendations
              </span>
              <h2 className="mt-1 font-serif-luxury text-2xl font-bold text-white sm:text-3xl">
                More from {dish.category_name || 'Our Culinary Menu'}
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:underline"
            >
              <span>View Full Menu</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedDishes.map((rel) => {
              const relPrice =
                rel.discount_price != null ? rel.discount_price : rel.original_price;
              const relHasDiscount =
                rel.discount_price != null && rel.discount_price < rel.original_price;
              const isRelAdded = justAddedRelatedId === rel.id;

              return (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/menu/${rel.id}`)}
                  className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#14110e] transition-colors duration-200 hover:border-[#d4af37]/50"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={getOptimizedImageUrl(rel.image_url, 480)}
                        alt={rel.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-transparent to-black/20" />
                      {rel.is_best_seller === 1 && (
                        <span className="absolute top-3 left-3 rounded-full bg-[#d4af37] px-2.5 py-0.5 text-[10px] font-bold text-[#0c0a09]">
                          Best Seller
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-2 font-serif-luxury text-lg font-bold text-white group-hover:text-[#d4af37]">
                        {rel.name}
                      </h3>
                      {rel.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-stone-400">
                          {rel.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <div className="text-sm font-bold text-[#d4af37]">
                        {formatVND(relPrice)}
                      </div>
                      {relHasDiscount && (
                        <div className="text-[11px] text-stone-500 line-through">
                          {formatVND(rel.original_price)}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAddRelated(e, rel)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        isRelAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#d4af37] text-[#0c0a09] hover:bg-[#e5c349]'
                      }`}
                    >
                      {isRelAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Mini-Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl rounded-2xl border border-[#d4af37]/50 bg-[#16120e] p-4 shadow-2xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37] font-bold text-[#0c0a09]">
                {cartCount}
              </div>
              <div>
                <div className="text-xs text-stone-400">
                  Selected Menu ({orderMode === 'delivery' ? 'Delivery' : 'Pre-order Table'})
                </div>
                <div className="text-base font-bold text-white">
                  Estimated Total:{' '}
                  <span className="text-[#d4af37]">{formatVND(cartTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Link
                to="/booking"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 sm:flex-initial"
              >
                <CalendarCheck className="h-4 w-4 text-[#d4af37]" />
                <span>Attach to Table</span>
              </Link>
              <Link
                to="/cart"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d4af37] px-5 py-2.5 text-xs font-bold text-[#0c0a09] shadow-lg hover:bg-[#e5c349] sm:flex-initial"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>View Order</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
