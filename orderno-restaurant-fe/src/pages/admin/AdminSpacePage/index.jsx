import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Compass,
  Layers,
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RotateCw,
  X,
  DollarSign,
  Image as ImageIcon,
  Tag,
  CalendarCheck,
} from 'lucide-react';
import { spaceTypeAPI } from '../../../services';
import { spaceTypeFormSchema } from '../../../schemas';
import { formatVND } from '../../../utils';

export default function AdminSpacePage() {
  // 1. Data States
  const [spaceTypes, setSpaceTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 2. Filter States
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [togglingId, setTogglingId] = useState(null);

  // 3. Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [modalError, setModalError] = useState('');

  // Delete Confirm Modal
  const [deleteConfirmSpace, setDeleteConfirmSpace] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 4. React Hook Form for Space Type Add/Edit
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(spaceTypeFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      image_url: '',
      total_quantity: 1,
      min_capacity: 1,
      max_capacity: 6,
      surcharge_fee: 0,
      sort_order: 1,
      is_active: true,
    },
  });

  const watchedImage = watch('image_url');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 5. Data Fetching
  const fetchStats = useCallback(async () => {
    try {
      const res = await spaceTypeAPI.getAdminStats();
      const data = res?.data || res;
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.warn('Failed to load space statistics:', err);
    }
  }, []);

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await spaceTypeAPI.getAdminList(params);
      const list = Array.isArray(res) ? res : res?.data || [];
      setSpaceTypes(list);
    } catch (err) {
      console.error('Failed to load space types:', err);
      showToast(err.message || 'Failed to load dining spaces', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus]);

  useEffect(() => {
    fetchStats();
    fetchSpaces();
  }, [fetchStats, fetchSpaces]);

  // 6. Action Handlers
  const handleOpenAddModal = () => {
    setEditingSpace(null);
    setModalError('');
    reset({
      code: '',
      name: '',
      description: '',
      image_url: '',
      total_quantity: 5,
      min_capacity: 2,
      max_capacity: 8,
      surcharge_fee: 0,
      sort_order: (spaceTypes?.length || 0) + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (space) => {
    setEditingSpace(space);
    setModalError('');
    reset({
      code: space.code || '',
      name: space.name || '',
      description: space.description || '',
      image_url: space.image_url || '',
      total_quantity: space.total_quantity || 1,
      min_capacity: space.min_capacity || 1,
      max_capacity: space.max_capacity || 6,
      surcharge_fee: space.surcharge_fee || 0,
      sort_order: space.sort_order ?? 1,
      is_active: Boolean(space.is_active),
    });
    setModalOpen(true);
  };

  const onSubmitSpace = async (data) => {
    setModalError('');
    try {
      const payload = {
        ...data,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        image_url: data.image_url?.trim() || null,
        is_active: data.is_active ? 1 : 0,
      };

      if (editingSpace) {
        await spaceTypeAPI.update(editingSpace.id, payload);
        showToast(`Dining space "${payload.name}" updated successfully!`, 'success');
      } else {
        await spaceTypeAPI.create(payload);
        showToast(`Dining space "${payload.name}" created successfully!`, 'success');
      }

      setModalOpen(false);
      fetchSpaces();
      fetchStats();
    } catch (err) {
      console.error('Error saving dining space:', err);
      setModalError(err.message || 'Failed to save dining space');
    }
  };

  const handleToggleStatus = async (space) => {
    const nextStatus = space.is_active ? 0 : 1;
    setTogglingId(space.id);
    try {
      await spaceTypeAPI.updateStatus(space.id, nextStatus);
      setSpaceTypes((prev) =>
        prev.map((item) => (item.id === space.id ? { ...item, is_active: nextStatus } : item))
      );
      showToast(
        `"${space.name}" marked as ${nextStatus ? 'Available' : 'Unavailable'}`,
        'success'
      );
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Could not update space status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmSpace) return;
    setDeleting(true);
    try {
      await spaceTypeAPI.delete(deleteConfirmSpace.id);
      showToast(`Dining space "${deleteConfirmSpace.name}" has been deleted.`, 'success');
      setDeleteConfirmSpace(null);
      fetchSpaces();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete dining space', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800 backdrop-blur-md'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800 backdrop-blur-md'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
              Architecture & Seating Allocation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-zinc-100">
            Rooms & Dining Spaces
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure dining room categories, private VIP suites, garden pavilions, seating capacities, and surcharge fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchSpaces();
            }}
            className="p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            title="Refresh spaces"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Space Type</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Space Categories
            </span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-zinc-100 mt-2 font-semibold">
            {stats ? stats.total_space_types : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {stats ? `${stats.active_space_types || 0} active space types` : 'Configured zones'}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Room / Table Units
            </span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-sky-400 mt-2 font-semibold">
            {stats ? `${stats.total_room_units} Units` : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Available physical rooms & zones</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Max Restaurant Capacity
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-emerald-400 mt-2 font-semibold">
            {stats ? `${stats.max_capacity} Guests` : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Combined peak guest capacity</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Avg. VIP Surcharge
            </span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-purple-400 mt-2 font-semibold">
            {stats ? formatVND(stats.avg_surcharge || 0) : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Across private suites & halls</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-zinc-900/50 border border-zinc-800/70 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search space name, code (STANDARD, VIP, GARDEN...), description..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 rounded-xl text-sm px-3.5 py-2 focus:outline-none focus:border-amber-500/60 transition-colors"
        >
          <option value="ALL">All Statuses</option>
          <option value="1">Available (Active)</option>
          <option value="0">Unavailable (Paused)</option>
        </select>
      </div>

      {/* Spaces Grid / Table */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-zinc-400">Loading dining spaces...</p>
        </div>
      ) : spaceTypes.length === 0 ? (
        <div className="min-h-[280px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-900/30">
          <Compass className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="text-lg font-serif text-zinc-300">No Dining Spaces Found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-5">
            {search || selectedStatus !== 'ALL'
              ? 'No dining spaces match your search criteria.'
              : 'Configure your first dining space or VIP room category.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-medium transition-colors"
          >
            + Add Space Type
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {spaceTypes.map((space) => {
            const isActive = Boolean(space.is_active);
            const totalZoneCapacity = (space.total_quantity || 1) * (space.max_capacity || 1);

            return (
              <div
                key={space.id}
                className="group bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/30 rounded-2xl overflow-hidden flex flex-col transition-all shadow-lg"
              >
                {/* Top Cover Banner */}
                <div className="relative h-48 bg-zinc-800 overflow-hidden">
                  {space.image_url ? (
                    <img
                      src={space.image_url}
                      alt={space.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
                      {space.code}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-700 text-zinc-300 text-xs font-mono">
                      Order #{space.sort_order ?? 0}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleStatus(space)}
                      disabled={togglingId === space.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-colors ${
                        isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                          : 'bg-zinc-900/90 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
                      }`}
                    >
                      {togglingId === space.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span>{isActive ? 'Available' : 'Paused'}</span>
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-serif font-semibold text-white">
                      {space.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
                    {space.description || 'No description provided for this dining space.'}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 text-center">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Room Units
                      </div>
                      <div className="text-sm font-mono font-semibold text-sky-400 mt-0.5">
                        {space.total_quantity} Rooms
                      </div>
                    </div>

                    <div className="border-x border-zinc-800/80 px-2">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Capacity / Unit
                      </div>
                      <div className="text-sm font-mono font-semibold text-emerald-400 mt-0.5">
                        {space.min_capacity}–{space.max_capacity} Pax
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Surcharge Fee
                      </div>
                      <div className="text-sm font-mono font-semibold text-amber-400 mt-0.5">
                        {space.surcharge_fee > 0 ? formatVND(space.surcharge_fee) : 'Free'}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Max {totalZoneCapacity} guests</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-400/90">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>{space.bookings_count || 0} bookings</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(space)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSpace(space)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete Space Type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: ADD / EDIT SPACE TYPE ================= */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
          >
            {/* Sticky Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
              <div>
                <h3 className="text-xl font-serif font-semibold text-zinc-100">
                  {editingSpace ? `Edit Dining Space (${editingSpace.code})` : 'Create New Dining Space'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure room code, display name, unit count, guest capacity, and surcharge fee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitSpace)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {modalError && (
                  <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Space Code <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('code')}
                      placeholder="e.g. VIP, GARDEN"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                    {errors.code && (
                      <p className="text-rose-400 text-xs mt-1">{errors.code.message}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Dining Space Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Phòng VIP Sakura Riêng Tư"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    {errors.name && (
                      <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Total Quantity */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Total Room Units <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('total_quantity')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    {errors.total_quantity && (
                      <p className="text-rose-400 text-xs mt-1">{errors.total_quantity.message}</p>
                    )}
                  </div>

                  {/* Min Capacity */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Min Guests / Unit
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('min_capacity')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    {errors.min_capacity && (
                      <p className="text-rose-400 text-xs mt-1">{errors.min_capacity.message}</p>
                    )}
                  </div>

                  {/* Max Capacity */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Max Guests / Unit <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('max_capacity')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    {errors.max_capacity && (
                      <p className="text-rose-400 text-xs mt-1">{errors.max_capacity.message}</p>
                    )}
                  </div>

                  {/* Surcharge Fee */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Room Surcharge Fee (VND)
                    </label>
                    <input
                      type="number"
                      step="50000"
                      min="0"
                      {...register('surcharge_fee')}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    {errors.surcharge_fee && (
                      <p className="text-rose-400 text-xs mt-1">{errors.surcharge_fee.message}</p>
                    )}
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      {...register('sort_order')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Space Image URL
                    </label>
                    <input
                      type="text"
                      {...register('image_url')}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    {errors.image_url && (
                      <p className="text-rose-400 text-xs mt-1">{errors.image_url.message}</p>
                    )}
                    {watchedImage && /^https?:\/\/.+/.test(watchedImage) && (
                      <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img
                          src={watchedImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Description & Ambience Highlights
                    </label>
                    <textarea
                      rows={2}
                      {...register('description')}
                      placeholder="Describe the atmosphere, privacy level, and recommended occasions..."
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Active Checkbox */}
                  <div className="sm:col-span-3 flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="space_is_active"
                      {...register('is_active')}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="space_is_active" className="text-sm text-zinc-300 cursor-pointer">
                      Available for customer online reservations
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingSpace ? 'Save Changes' : 'Create Space Type'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: DELETE CONFIRMATION ================= */}
      {deleteConfirmSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-serif font-semibold text-zinc-100">
              Delete Dining Space?
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Are you sure you want to delete{' '}
              <span className="text-amber-400 font-semibold">{deleteConfirmSpace.name}</span> (
              <span className="font-mono text-xs">{deleteConfirmSpace.code}</span>)?
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              This action uses soft-deletion (`is_deleted = 1`) so historical reservations remain intact.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmSpace(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
