import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sparkles,
  Percent,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  Layers,
  ArrowUpDown,
  X,
  RotateCw,
  FolderPlus,
  Flame,
  Star,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import { menuItemAPI, categoryAPI } from '../../../services';
import { menuItemFormSchema } from '../../../schemas';
import { formatVND } from '../../../utils';

export default function AdminMenuPage() {
  // 1. Data States
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  // 2. Filter & Search States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockStatus, setStockStatus] = useState('ALL'); // ALL, AVAILABLE, OUT_OF_STOCK
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterBestSeller, setFilterBestSeller] = useState(false);
  const [sortOption, setSortOption] = useState('default');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // 3. Modal States
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishModalError, setDishModalError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // Category Manager Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState('');

  // Delete Confirm Modal
  const [deleteConfirmDish, setDeleteConfirmDish] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 4. React Hook Form for Dish Add/Edit
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: dishSubmitting },
  } = useForm({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
      image_url: '',
      original_price: '',
      discount_price: '',
      is_best_seller: false,
      is_on_promo: false,
      is_new: false,
      is_available: true,
      sort_order: 0,
    },
  });

  // Dynamic Key-Value Attribute rows
  const [attributeList, setAttributeList] = useState([]);

  const handleAddAttribute = () => {
    setAttributeList((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), key: '', value: '' },
    ]);
  };

  const handleRemoveAttribute = (index) => {
    setAttributeList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index, field, val) => {
    setAttributeList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const watchedOriginalPrice = watch('original_price');
  const watchedDiscountPrice = watch('discount_price');
  const watchedImageUrl = watch('image_url');

  // Real-time discount percent computation for modal preview
  const liveDiscountPercent = useMemo(() => {
    const orig = Number(watchedOriginalPrice);
    const disc = Number(watchedDiscountPrice);
    if (orig > 0 && disc > 0 && disc < orig) {
      return Math.round((1 - disc / orig) * 100);
    }
    return 0;
  }, [watchedOriginalPrice, watchedDiscountPrice]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 5. Load Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setCategories(list);
    } catch (err) {
      console.warn('Failed to load menu categories:', err);
    }
  }, []);

  // 6. Load Dishes & Stats
  const fetchMenuData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'ALL') params.category_id = selectedCategory;
      if (stockStatus === 'AVAILABLE') params.is_available = '1';
      if (stockStatus === 'OUT_OF_STOCK') params.is_available = '0';
      if (filterPromo) params.is_on_promo = '1';
      if (filterBestSeller) params.is_best_seller = '1';
      if (sortOption !== 'default') params.sort = sortOption;

      const [menuRes, statsRes] = await Promise.all([
        menuItemAPI.getAllAdmin(params),
        menuItemAPI.getAdminStats(),
      ]);

      const items = Array.isArray(menuRes) ? menuRes : menuRes?.data || [];
      setMenuItems(items);
      setPagination(menuRes?.pagination || { page: 1, limit: 10, total: items.length, totalPages: 1 });
      setStats(statsRes?.data || statsRes || null);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, stockStatus, filterPromo, filterBestSeller, sortOption]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // 7. Modal Handlers
  const handleOpenAddModal = () => {
    setEditingDish(null);
    setAttributeList([
      { id: 1, key: 'spiciness', value: 'Mild' },
      { id: 2, key: 'serving_size', value: '1-2 persons' },
    ]);
    reset({
      name: '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      original_price: '250000',
      discount_price: '',
      is_best_seller: false,
      is_on_promo: false,
      is_new: true,
      is_available: true,
      sort_order: 0,
    });
    setDishModalError('');
    setDishModalOpen(true);
  };

  const handleOpenEditModal = (dish) => {
    setEditingDish(dish);
    let initialAttrs = [];
    if (dish.attributes) {
      try {
        const parsed = typeof dish.attributes === 'string' ? JSON.parse(dish.attributes) : dish.attributes;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          initialAttrs = Object.entries(parsed).map(([k, v], idx) => ({
            id: idx + 1,
            key: k,
            value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
          }));
        }
      } catch {
        initialAttrs = [];
      }
    }
    setAttributeList(initialAttrs);

    reset({
      name: dish.name || '',
      category_id: dish.category_id ? String(dish.category_id) : '',
      description: dish.description || '',
      image_url: dish.image_url || '',
      original_price: dish.original_price != null ? String(dish.original_price) : '',
      discount_price: dish.discount_price != null ? String(dish.discount_price) : '',
      is_best_seller: Boolean(dish.is_best_seller),
      is_on_promo: Boolean(dish.is_on_promo),
      is_new: Boolean(dish.is_new),
      is_available: Boolean(dish.is_available),
      sort_order: dish.sort_order || 0,
    });
    setDishModalError('');
    setDishModalOpen(true);
  };

  const handleCloseDishModal = () => {
    setDishModalOpen(false);
    setEditingDish(null);
    setAttributeList([]);
    reset();
    setDishModalError('');
  };

  // Submit dish form (Backend handles slug creation from dish name)
  const handleSaveDish = async (values) => {
    setDishModalError('');
    try {
      // Build clean attributes object from key-value pairs
      const attributesObj = {};
      attributeList.forEach(({ key, value }) => {
        const trimmedKey = (key || '').trim();
        if (trimmedKey) {
          attributesObj[trimmedKey] = (value || '').trim();
        }
      });

      const payload = {
        name: values.name.trim(),
        category_id: Number(values.category_id),
        description: values.description?.trim() || null,
        image_url: values.image_url?.trim() || null,
        original_price: Number(values.original_price),
        discount_price:
          values.discount_price !== '' && values.discount_price !== null && values.discount_price !== undefined
            ? Number(values.discount_price)
            : null,
        is_best_seller: Boolean(values.is_best_seller),
        is_on_promo: Boolean(values.is_on_promo),
        is_new: Boolean(values.is_new),
        is_available: Boolean(values.is_available),
        sort_order: Number(values.sort_order) || 0,
        attributes: attributesObj,
      };

      if (!editingDish) {
        await menuItemAPI.create(payload);
        showToast(`Dish "${payload.name}" added to menu successfully!`);
      } else {
        await menuItemAPI.update(editingDish.id, payload);
        showToast(`Dish "${payload.name}" updated successfully!`);
      }

      handleCloseDishModal();
      fetchMenuData();
      fetchCategories();
    } catch (err) {
      setDishModalError(err.message || 'Failed to save menu dish');
    }
  };

  // 8. Toggle dish service availability (Switch Toggle)
  const handleToggleAvailability = async (dish) => {
    const nextVal = dish.is_available ? 0 : 1;
    setTogglingId(dish.id);
    try {
      await menuItemAPI.updateAvailability(dish.id, nextVal);
      showToast(
        nextVal === 1
          ? `Dish "${dish.name}" is now: Available`
          : `Dish "${dish.name}" is now: Out of Stock`,
        nextVal === 1 ? 'success' : 'info'
      );
      fetchMenuData();
    } catch (err) {
      showToast(err.message || 'Failed to update availability status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // 9. Confirm Soft Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmDish) return;
    setDeleting(true);
    try {
      await menuItemAPI.delete(deleteConfirmDish.id);
      showToast(`Dish "${deleteConfirmDish.name}" removed from menu`);
      setDeleteConfirmDish(null);
      fetchMenuData();
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to delete dish', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // 10. Create new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatSubmitting(true);
    setCatError('');
    try {
      await categoryAPI.create({
        name: newCatName.trim(),
        description: newCatDesc.trim() || null,
      });
      showToast(`Category "${newCatName.trim()}" created successfully!`);
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
      fetchMenuData();
    } catch (err) {
      setCatError(err.message || 'Failed to create category');
    } finally {
      setCatSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md ${
            toast.type === 'error'
              ? 'border-rose-500/40 bg-rose-950/90 text-rose-200'
              : toast.type === 'info'
              ? 'border-amber-500/40 bg-[#1f1911]/95 text-amber-200'
              : 'border-[#d4af37]/40 bg-[#16120e]/95 text-[#f5d77f]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d4af37]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-[#d4af37] uppercase">
              Culinary Management
            </span>
            <span className="text-xs text-stone-500">•</span>
            <span className="text-xs text-stone-400">Ordeno Dining</span>
          </div>
          <h1 className="mt-1 font-serif-luxury text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Menu & Culinary Management
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            Configure menu pricing, seasonal promotions, and kitchen service availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-stone-300 transition hover:border-[#d4af37]/40 hover:bg-white/10 hover:text-white"
          >
            <FolderPlus className="h-4 w-4 text-[#d4af37]" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-5 py-2.5 text-xs font-bold text-[#0c0a09] shadow-lg shadow-[#d4af37]/20 transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Total Menu */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1813] to-[#120f0c] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Menu</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif-luxury text-2xl font-bold text-white">
              {stats?.total_dishes ?? '—'}
            </span>
            <span className="text-[11px] text-stone-400">items</span>
          </div>
        </div>

        {/* Card 2: Available */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1813] to-[#120f0c] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Available</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif-luxury text-2xl font-bold text-emerald-400">
              {stats?.available_dishes ?? '—'}
            </span>
            <span className="text-[11px] text-emerald-400/70">active</span>
          </div>
        </div>

        {/* Card 3: Out of stock */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1813] to-[#120f0c] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Out of Stock</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif-luxury text-2xl font-bold text-rose-400">
              {stats?.out_of_stock_dishes ?? '—'}
            </span>
            <span className="text-[11px] text-rose-400/70">kitchen replenish</span>
          </div>
        </div>

        {/* Card 4: Promotional */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1813] to-[#120f0c] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">On Promotion</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif-luxury text-2xl font-bold text-rose-300">
              {stats?.promo_dishes ?? '—'}
            </span>
            <span className="text-[11px] text-stone-400">discounted</span>
          </div>
        </div>

        {/* Card 5: Best Seller */}
        <div className="col-span-2 rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#241c13] to-[#14100c] p-4 shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#f5d77f]">Best Sellers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d4af37]/20 text-[#d4af37]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif-luxury text-2xl font-bold text-[#f5d77f]">
              {stats?.best_sellers ?? '—'}
            </span>
            <span className="text-[11px] text-[#d4af37]">top ranked</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="rounded-2xl border border-white/10 bg-[#16120e] p-4 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search dish by name or slug..."
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pr-4 pl-10 text-xs text-white placeholder-stone-500 transition focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Category */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-stone-300 transition focus:border-[#d4af37] focus:outline-none"
            >
              <option value="ALL" className="bg-[#14110e]">
                All Categories ({categories.reduce((acc, c) => acc + (c.total_items || 0), 0)})
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#14110e]">
                  {c.name} ({c.total_items || 0})
                </option>
              ))}
            </select>

            {/* Filter Availability */}
            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-stone-300 transition focus:border-[#d4af37] focus:outline-none"
            >
              <option value="ALL" className="bg-[#14110e]">
                All Availability
              </option>
              <option value="AVAILABLE" className="bg-[#14110e]">
                🟢 Available
              </option>
              <option value="OUT_OF_STOCK" className="bg-[#14110e]">
                🔴 Out of Stock
              </option>
            </select>

            {/* Filter Promo Button */}
            <button
              onClick={() => {
                setFilterPromo(!filterPromo);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                filterPromo
                  ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
                  : 'border-white/10 bg-white/5 text-stone-400 hover:text-white'
              }`}
            >
              <Percent className="h-3.5 w-3.5" />
              <span>Promotion</span>
            </button>

            {/* Filter Best Seller Button */}
            <button
              onClick={() => {
                setFilterBestSeller(!filterBestSeller);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                filterBestSeller
                  ? 'border-[#d4af37]/50 bg-[#d4af37]/20 text-[#f5d77f]'
                  : 'border-white/10 bg-white/5 text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Best Seller</span>
            </button>

            {/* Sort Options */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-stone-300 transition focus:border-[#d4af37] focus:outline-none"
            >
              <option value="default" className="bg-[#14110e]">
                Display Order
              </option>
              <option value="price_asc" className="bg-[#14110e]">
                Price: Low to High
              </option>
              <option value="price_desc" className="bg-[#14110e]">
                Price: High to Low
              </option>
              <option value="name_asc" className="bg-[#14110e]">
                Dish Name (A – Z)
              </option>
              <option value="newest" className="bg-[#14110e]">
                Recently Added
              </option>
            </select>

            <button
              onClick={fetchMenuData}
              title="Reload menu data"
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-stone-400 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MENU ITEMS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#16120e] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#1c1813] text-[11px] font-bold tracking-wider text-stone-400 uppercase">
                <th className="py-3.5 pr-4 pl-6">Dish</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Pricing & Promo</th>
                <th className="px-4 py-3.5">Availability</th>
                <th className="px-4 py-3.5">Badges</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#d4af37]" />
                    <p className="mt-2 text-xs text-stone-400">Loading culinary menu...</p>
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-rose-400">
                    <AlertCircle className="mx-auto h-7 w-7" />
                    <p className="mt-2 text-xs font-semibold">{errorMsg}</p>
                  </td>
                </tr>
              ) : menuItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-stone-400">
                    <UtensilsCrossed className="mx-auto h-8 w-8 text-stone-600" />
                    <p className="mt-2 font-medium">No dishes found matching criteria</p>
                    <p className="text-[11px] text-stone-500">Try adjusting search terms or clearing active filters</p>
                  </td>
                </tr>
              ) : (
                menuItems.map((dish) => {
                  const isAvailable = Boolean(dish.is_available);
                  const isPromo =
                    Boolean(dish.is_on_promo) ||
                    (dish.discount_price && Number(dish.discount_price) < Number(dish.original_price));

                  return (
                    <tr
                      key={dish.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Column 1: Dish (Thumbnail + Name + Slug) */}
                      <td className="py-3.5 pr-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            {dish.image_url ? (
                              <img
                                src={dish.image_url}
                                alt={dish.name}
                                className="h-full w-full object-cover transition duration-300 hover:scale-110"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-stone-600">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {dish.name}
                            </p>
                            <p className="truncate font-mono text-[10px] text-stone-400">
                              /{dish.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#f5d77f]">
                          {dish.category_name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Column 3: Price & Promo */}
                      <td className="px-4 py-3.5">
                        {isPromo && dish.discount_price ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#d4af37]">
                                {formatVND(dish.discount_price)}
                              </span>
                              <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-300">
                                -{dish.discount_percent || Math.round((1 - dish.discount_price / dish.original_price) * 100)}%
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-500 line-through">
                              {formatVND(dish.original_price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-stone-200">
                            {formatVND(dish.original_price)}
                          </span>
                        )}
                      </td>

                      {/* Column 4: Availability Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          disabled={togglingId === dish.id}
                          onClick={() => handleToggleAvailability(dish)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
                            isAvailable
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                          } disabled:opacity-50`}
                          title="Click to toggle availability"
                        >
                          {togglingId === dish.id ? (
                            <Loader2 className="h-3 w-3 animate-spin text-current" />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                          )}
                          <span>{isAvailable ? 'Available' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      {/* Column 5: Badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {dish.is_best_seller === 1 && (
                            <span className="inline-flex items-center gap-1 rounded bg-[#d4af37]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#f5d77f]" title="Top selling signature dish">
                              <Sparkles className="h-2.5 w-2.5" />
                              Best Seller
                            </span>
                          )}
                          {isPromo && (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300" title="Active promotional special">
                              <Flame className="h-2.5 w-2.5" />
                              Promo
                            </span>
                          )}
                          {dish.is_new === 1 && (
                            <span className="inline-flex items-center gap-1 rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300" title="New culinary addition">
                              <Star className="h-2.5 w-2.5" />
                              New
                            </span>
                          )}
                          {!dish.is_best_seller && !isPromo && !dish.is_new && (
                            <span className="text-[11px] text-stone-500">—</span>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3.5 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(dish)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-stone-300 transition hover:border-[#d4af37] hover:text-[#d4af37]"
                            title="Edit dish details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmDish(dish)}
                            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20"
                            title="Remove dish from menu"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-3.5 text-xs text-stone-400">
            <span>
              Page <strong>{pagination.page}</strong> of {pagination.totalPages} ({pagination.total} items total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-semibold text-stone-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-semibold text-stone-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT DISH MODAL */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={handleCloseDishModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#d4af37]/30 bg-[#16120e] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-white">
                      {editingDish ? 'Edit Dish Profile' : 'Add New Menu Item'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {editingDish ? `Editing: ${editingDish.name}` : 'Enter dish culinary details and pricing'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDishModal}
                  className="rounded-lg p-1.5 text-stone-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {dishModalError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{dishModalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(handleSaveDish)} className="mt-6 space-y-4 text-xs" noValidate>
                {/* Row 1: Dish Name & Category */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-stone-300">
                      Dish Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="Wagyu A5 Ribeye Steak"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.name ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300">
                      Menu Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      {...register('category_id')}
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.category_id ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    >
                      <option value="" className="bg-[#14110e]">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#14110e]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.category_id.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Original & Promotional Price */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-stone-300">
                      Original Price (VND) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('original_price')}
                      placeholder="790000"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.original_price ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.original_price && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.original_price.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-stone-300">
                        Promotional Price (VND)
                      </label>
                      {liveDiscountPercent > 0 && (
                        <span className="rounded bg-rose-500/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-rose-300">
                          {liveDiscountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      {...register('discount_price')}
                      placeholder="Leave blank if no discount"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.discount_price ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.discount_price && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.discount_price.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Image URL & Live Preview */}
                <div>
                  <label className="block font-semibold text-stone-300">
                    Dish Image URL
                  </label>
                  <div className="mt-1.5 flex gap-3">
                    <input
                      type="url"
                      {...register('image_url')}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={`flex-1 rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.image_url ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {watchedImageUrl && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <img
                          src={watchedImageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {errors.image_url && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.image_url.message}</span>
                    </p>
                  )}
                </div>

                {/* Row 4: Description */}
                <div>
                  <label className="block font-semibold text-stone-300">
                    Dish Description / Ingredients
                  </label>
                  <textarea
                    rows={2}
                    {...register('description')}
                    placeholder="Premium ingredients, freshly prepared with authentic Japanese culinary techniques..."
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white transition focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                {/* Row 5: Product Attributes (Key - Value Pairs) */}
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-stone-200">
                        Product Attributes
                      </label>
                      <p className="text-[11px] text-stone-400">
                        Custom specifications (e.g. spiciness, serving size, preparation time, calories)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAttribute}
                      className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-semibold text-[#f5d77f] transition hover:bg-[#d4af37]/25"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Attribute</span>
                    </button>
                  </div>

                  {attributeList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-stone-500">
                      No attributes added yet. Click <span className="font-medium text-[#d4af37]">+ Add Attribute</span> to add key-value specifications.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attributeList.map((attr, index) => (
                        <div key={attr.id || index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Attribute name (e.g. spiciness)"
                            value={attr.key}
                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            className="w-1/3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-stone-500 transition focus:border-[#d4af37] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. Mild / 2 persons)"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-stone-500 transition focus:border-[#d4af37] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(index)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-stone-400 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
                            title="Remove attribute"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row 6: Flags (Checkboxes) */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-black/30 p-3.5 sm:grid-cols-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('is_available')}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="font-semibold text-stone-300">Available</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('is_best_seller')}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="font-semibold text-stone-300">Best Seller</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('is_on_promo')}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="font-semibold text-stone-300">On Promotion</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('is_new')}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="font-semibold text-stone-300">New Arrival</span>
                  </label>
                </div>

                {/* Row 6: Sort Order */}
                <div className="w-1/2">
                  <label className="block font-semibold text-stone-300">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    {...register('sort_order')}
                    placeholder="0"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white transition focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseDishModal}
                    className="rounded-full border border-white/15 px-5 py-2.5 font-semibold text-stone-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dishSubmitting}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-6 py-2.5 font-bold text-[#0c0a09] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {dishSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#0c0a09]" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingDish ? 'Save Changes' : 'Add to Menu'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* 6. CATEGORY MANAGER MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCategoryModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#d4af37]/30 bg-[#16120e] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-white">
                    Menu Categories
                  </h3>
                  <p className="text-xs text-stone-400">
                    Manage and organize culinary categories across the restaurant
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Add New Category */}
            <form onSubmit={handleCreateCategory} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
              <h4 className="font-semibold text-stone-200 text-xs">Add New Category</h4>
              {catError && (
                <p className="text-[11px] text-rose-400">{catError}</p>
              )}
              <div>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Charcoal Robata Grill)"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Category description (optional)"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={catSubmitting || !newCatName.trim()}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-4 py-1.5 text-xs font-bold text-[#0c0a09] transition hover:brightness-110 disabled:opacity-50"
                >
                  {catSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Add Category</span>
                </button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-stone-300 text-xs">Existing Categories ({categories.length})</h4>
              <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/20">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <p className="font-semibold text-white">{cat.name}</p>
                      <p className="font-mono text-[10px] text-stone-400">/{cat.slug}</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[#d4af37]">
                      {cat.total_items || 0} items
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONFIRM DELETE DISH MODAL */}
      {deleteConfirmDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirmDish(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-3xl border border-rose-500/40 bg-[#16120e] p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif-luxury text-lg font-bold text-white">
              Confirm Dish Removal
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-stone-400">
              Are you sure you want to remove dish{' '}
              <strong className="text-white">
                "{deleteConfirmDish.name}"
              </strong>{' '}
              from the menu? It will be archived (soft-deleted) and hidden from guest ordering.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmDish(null)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
