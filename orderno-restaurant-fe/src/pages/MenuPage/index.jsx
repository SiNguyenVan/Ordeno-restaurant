import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Check,
  X,
  UtensilsCrossed,
  CalendarCheck,
  Truck,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatVND } from '../../utils';
import { useRestaurant } from '../../context';
import { itemMenuAPI, categoryAPI } from '../../services';

const parseAttributes = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export default function MenuPage() {
  const navigate = useNavigate();
  const { orderMode, setOrderMode, addToCart, cartCount, cartTotal } = useRestaurant();

  // Backend state
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  // Pagination state (12 items / page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [justAddedId, setJustAddedId] = useState(null);

  // Debounce search query (~350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // When keyword, promo or sort changes -> reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, onlyPromo, sortBy]);

  // 1. Load categories with item count (GET /api/categories)
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const data = await categoryAPI.getAll();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load and filter menu items from Backend with pagination (GET /api/menu-items)
  useEffect(() => {
    let isMounted = true;
    async function loadMenuItems() {
      try {
        setLoadingItems(true);
        setApiError(null);

        // Concise parameters using object spreading
        const params = {
          page: currentPage,
          limit: 12,
          ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
          ...(selectedCategory !== 'all' && { category_id: selectedCategory }),
          ...(onlyPromo && { is_on_promo: true }),
          ...(sortBy === 'price_asc' || sortBy === 'price_desc' ? { sort: sortBy } : {}),
        };

        const data = await itemMenuAPI.getAll(params);
        if (isMounted) {
          setMenuItems(Array.isArray(data) ? data : []);
          if (data?.pagination) {
            setPagination(data.pagination);
          } else {
            setPagination({
              page: currentPage,
              limit: 12,
              total: Array.isArray(data) ? data.length : 0,
              totalPages: 1,
            });
          }
        }
      } catch (err) {
        console.error('Error loading menu items:', err);
        if (isMounted) {
          setApiError(err.message || 'Unable to connect to the menu server.');
          setMenuItems([]);
        }
      } finally {
        if (isMounted) setLoadingItems(false);
      }
    }

    loadMenuItems();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, currentPage, debouncedSearch, onlyPromo, sortBy]);

  // Click on a category: Update selectedCategory and reset page to 1 to query API
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  // Total available items across all categories
  const totalAllItems = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.total_items || 0), 0);
  }, [categories]);

  // Normalize dish object when adding to cart
  const normalizeDishForCart = (dish) => {
    const attrs = parseAttributes(dish.attributes);
    const finalPrice =
      dish.discount_price != null ? Number(dish.discount_price) : Number(dish.original_price);
    const originalPrice = dish.discount_price != null ? Number(dish.original_price) : null;
    const unit = attrs.unit || (attrs.serving ? `Serving: ${attrs.serving}` : 'Standard portion');

    return {
      id: dish.id,
      name: dish.name,
      price: finalPrice,
      originalPrice,
      original_price: dish.original_price,
      discount_price: dish.discount_price,
      image: dish.image_url,
      image_url: dish.image_url,
      unit,
    };
  };

  // Quick-add 1 portion to cart
  const handleQuickAdd = (dish) => {
    const formattedDish = normalizeDishForCart(dish);
    addToCart({
      dish: formattedDish,
      quantity: 1,
      note: '',
    });
    setJustAddedId(dish.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setOnlyPromo(false);
    setSortBy('popular');
    setCurrentPage(1);
  };

  const modeOptions = [
    {
      id: 'pre-order',
      label: 'Pre-order for Reserved Table',
      desc: 'Dishes served ready upon your arrival',
      icon: CalendarCheck,
    },
    {
      id: 'delivery',
      label: 'Haute Cuisine Delivery (Ship)',
      desc: 'Thermal insulated & Japanese gel ice pack packaging',
      icon: Truck,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6">
      {/* Header & Order Mode Selector */}
      <div className="rounded-3xl border border-[#d4af37]/25 bg-gradient-to-r from-[#19140f] via-[#211a12] to-[#19140f] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#d4af37]">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Digital E-Menu
            </div>
            <h1 className="mt-2 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
              Ordeno Culinary Menu
            </h1>
            <p className="mt-1.5 text-sm text-stone-300">
              Select dishes and personalized cooking styles according to your preference — prepared fresh upon request.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:w-[420px]">
            {modeOptions.map((m) => {
              const Icon = m.icon;
              const active = orderMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setOrderMode(m.id)}
                  className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                    active
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-white shadow-md shadow-[#d4af37]/10'
                      : 'border-white/10 bg-black/30 text-stone-400 hover:border-white/20 hover:text-stone-200'
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
                  <div className="mt-2 text-xs font-bold text-white">{m.label}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-stone-400">
                    {m.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* API Error Notification */}
      {apiError && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{apiError}</p>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Search, Filter Pills & Sort Bar */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes: Sashimi, Wagyu Beef, Miso Hotpot, Sushi..."
              className="w-full rounded-2xl border border-white/10 bg-[#14110e] py-3.5 pr-10 pl-11 text-sm text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-stone-400 hover:text-white"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Promo filter */}
            <button
              onClick={() => setOnlyPromo(!onlyPromo)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold transition ${
                onlyPromo
                  ? 'border-[#e11d48] bg-[#e11d48]/15 text-rose-300'
                  : 'border-white/10 bg-[#14110e] text-stone-300 hover:border-white/25'
              }`}
            >
              <Flame className="h-4 w-4 text-rose-400" />
              <span>Special Offers</span>
            </button>

            {/* Sort selector */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#14110e] px-4 py-2.5">
              <SlidersHorizontal className="h-4 w-4 text-[#d4af37]" />
              <span className="text-xs text-stone-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none"
              >
                <option value="popular" className="bg-[#14110e]">
                  Featured
                </option>
                <option value="price_asc" className="bg-[#14110e]">
                  Price: Low to High
                </option>
                <option value="price_desc" className="bg-[#14110e]">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs Category */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Tab All Dishes */}
          <button
            onClick={() => handleSelectCategory('all')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-[#d4af37] text-[#0c0a09] shadow-lg shadow-[#d4af37]/20'
                : 'border border-white/10 bg-[#14110e] text-stone-300 hover:border-[#d4af37]/40 hover:text-white'
            }`}
          >
            <span>All Dishes</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                selectedCategory === 'all'
                  ? 'bg-black/20 text-[#0c0a09]'
                  : 'bg-white/5 text-stone-400'
              }`}
            >
              {totalAllItems}
            </span>
          </button>

          {/* Category tabs from API */}
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#d4af37] text-[#0c0a09] shadow-lg shadow-[#d4af37]/20'
                    : 'border border-white/10 bg-[#14110e] text-stone-300 hover:border-[#d4af37]/40 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    active
                      ? 'bg-black/20 text-[#0c0a09]'
                      : 'bg-white/5 text-stone-400'
                  }`}
                >
                  {cat.total_items ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu items grid */}
      {loadingItems ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-white/10 bg-[#14110e] p-12 text-center">
          <p className="font-serif-luxury text-2xl font-semibold text-white">
            No matching dishes found
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Please try searching with another keyword or clear filters to view the full menu.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-[#0c0a09] transition hover:bg-[#e5c349]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset all filters</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menuItems.map((dish) => {
              const isAdded = justAddedId === dish.id;
              const attrs = parseAttributes(dish.attributes);
              const price =
                dish.discount_price != null ? dish.discount_price : dish.original_price;
              const hasDiscount =
                dish.discount_price != null && dish.discount_price < dish.original_price;
              const unit = attrs.unit || (attrs.serving ? `Serving: ${attrs.serving}` : 'Portion');

              return (
                <div
                  key={dish.id}
                  onClick={() => navigate(`/menu/${dish.id}`)}
                  className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#14110e] transition-colors duration-200 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-black/50 transform-gpu content-auto"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={
                          dish.image_url ||
                          'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={dish.name}
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 will-change-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-transparent to-black/30" />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {dish.is_best_seller === 1 && (
                          <span className="rounded-full bg-[#d4af37] px-2.5 py-1 text-[10px] font-bold text-[#0c0a09] shadow">
                            Best Seller
                          </span>
                        )}
                        {(dish.is_on_promo === 1 || hasDiscount) && (
                          <span className="rounded-full bg-[#e11d48] px-2.5 py-1 text-[10px] font-bold text-white shadow">
                            {dish.discount_percent ? `-${dish.discount_percent}%` : 'Special Offer'}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-stone-300">
                        <span className="rounded-md bg-black/85 px-2 py-0.5">
                          {unit}
                        </span>
                        {dish.category_name && (
                          <span className="rounded-md bg-black/85 px-2 py-0.5 text-[#d4af37]">
                            {dish.category_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-2 font-serif-luxury text-xl font-bold text-white transition group-hover:text-[#d4af37]">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-400">
                          {dish.description}
                        </p>
                      )}

                      {attrs.origin && (
                        <div className="mt-2 text-[11px] text-stone-400">
                          <span>Origin: </span>
                          <span className="text-stone-300">{attrs.origin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-5 py-4">
                    <div>
                      <div className="text-base font-bold text-[#d4af37]">
                        {formatVND(price)}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-stone-500 line-through">
                          {formatVND(dish.original_price)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/menu/${dish.id}`);
                        }}
                        className="rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-[#d4af37] hover:text-white"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(dish);
                        }}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                          isAdded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#d4af37] text-[#0c0a09] hover:bg-[#e5c349]'
                        }`}
                      >
                        {isAdded ? (
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
                </div>
              );
            })}
          </div>

          {/* Pagination (12 items / page) */}
          {pagination.total > 0 && (
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
              <div className="text-xs text-stone-400">
                Showing{' '}
                <span className="font-semibold text-stone-200">
                  {(currentPage - 1) * 12 + 1}
                </span>{' '}
                –{' '}
                <span className="font-semibold text-stone-200">
                  {Math.min(currentPage * 12, pagination.total)}
                </span>{' '}
                of <span className="font-bold text-[#d4af37]">{pagination.total}</span> dishes
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentPage <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#14110e] text-stone-300 transition hover:border-[#d4af37]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const active = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
                          active
                            ? 'bg-[#d4af37] text-[#0c0a09] shadow-md shadow-[#d4af37]/20'
                            : 'border border-white/10 bg-[#14110e] text-stone-300 hover:border-[#d4af37]/40 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      if (currentPage < pagination.totalPages) {
                        setCurrentPage((prev) => prev + 1);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentPage >= pagination.totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#14110e] text-stone-300 transition hover:border-[#d4af37]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Sticky Mini-Cart Bar */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl rounded-2xl border border-[#d4af37]/50 bg-[#16120e] p-4 shadow-2xl"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37] font-bold text-[#0c0a09]">
                {cartCount}
              </div>
              <div>
                <div className="text-xs text-stone-400">
                  Selected Order ({cartCount} items)
                </div>
                <div className="font-serif-luxury text-xl font-bold text-[#d4af37]">
                  Subtotal: {formatVND(cartTotal)}
                </div>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Link
                to="/dat-ban"
                className="flex-1 rounded-full border border-[#d4af37]/40 bg-white/5 px-4 py-2.5 text-center text-xs font-semibold text-stone-200 transition hover:border-[#d4af37] sm:flex-initial"
              >
                Book Table with These Dishes
              </Link>
              <Link
                to="/gio-hang"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-[#0c0a09] shadow-lg shadow-[#d4af37]/20 transition hover:bg-[#e5c349] sm:flex-initial"
              >
                <span>View Cart & Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
