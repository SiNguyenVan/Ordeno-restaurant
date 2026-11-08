import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarCheck,
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  Clock,
  Calendar,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  RotateCw,
  X,
  PartyPopper,
  Truck,
  Compass,
} from 'lucide-react';
import { bookingAPI, spaceTypeAPI } from '../../../services';
import {
  bookingFormSchema,
  BOOKING_STATUS_OPTIONS,
  BOOKING_TYPE_OPTIONS,
} from '../../../schemas';
import { formatVND } from '../../../utils';

const STATUS_BADGE_MAP = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400 animate-pulse',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  SEATED: {
    label: 'Seated',
    className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dotClass: 'bg-sky-400 animate-pulse',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dotClass: 'bg-purple-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
};

export default function AdminBookingPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Data States
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [spaceTypes, setSpaceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 2. Filter States
  const [search, setSearch] = useState('');
  const [selectedSpaceType, setSelectedSpaceType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // 3. Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formModalError, setFormModalError] = useState('');

  // Detail & Pre-order Modal
  const [detailBooking, setDetailBooking] = useState(null);
  const [quickNote, setQuickNote] = useState('');
  const [quickStatus, setQuickStatus] = useState('CONFIRMED');
  const [savingDetailNote, setSavingDetailNote] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 4. React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      booking_type: 'REGULAR_TABLE',
      space_type_id: '',
      rooms_requested: 1,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      booking_date: todayStr,
      booking_time: '19:00',
      duration_minutes: 120,
      guest_adults: 2,
      guest_children: 0,
      event_type: '',
      special_requests: '',
      status: 'CONFIRMED',
      admin_note: '',
    },
  });

  const watchedBookingType = watch('booking_type');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 5. Data Fetching
  const fetchReferenceData = useCallback(async () => {
    try {
      const spacesRes = await spaceTypeAPI.getAdminList();
      const spaceList = Array.isArray(spacesRes) ? spacesRes : spacesRes?.data || [];
      setSpaceTypes(spaceList);
    } catch (err) {
      console.warn('Failed to load reference data for bookings:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (selectedDate) params.booking_date = selectedDate;

      const res = await bookingAPI.getAdminStats(params);
      const data = res?.data || res;
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.warn('Failed to load reservation statistics:', err);
    }
  }, [selectedDate]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSpaceType !== 'ALL') params.space_type_id = selectedSpaceType;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedType !== 'ALL') params.booking_type = selectedType;
      if (selectedDate) params.booking_date = selectedDate;

      const res = await bookingAPI.getAdminList(params);
      const list = Array.isArray(res) ? res : res?.data || [];
      setBookings(list);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      showToast(err.message || 'Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedSpaceType, selectedStatus, selectedType, selectedDate]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, [fetchStats, fetchBookings]);

  // Ensure valid space_type_id when booking_type changes inside modal
  useEffect(() => {
    if (!formModalOpen) return;
    if (watchedBookingType === 'DELIVERY') {
      setValue('space_type_id', '');
      return;
    }
    const currentSpaceId = watch('space_type_id');
    const stillValid = spaceTypes.some((sp) => Number(sp.id) === Number(currentSpaceId));
    if (!stillValid && spaceTypes.length > 0) {
      setValue('space_type_id', spaceTypes[0].id);
    }
  }, [watchedBookingType, spaceTypes, formModalOpen, setValue, watch]);

  // 6. Action Handlers
  const handleOpenCreateModal = () => {
    setEditingBooking(null);
    setFormModalError('');

    reset({
      booking_type: 'REGULAR_TABLE',
      space_type_id: spaceTypes[0]?.id || '',
      rooms_requested: 1,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      booking_date: selectedDate || todayStr,
      booking_time: '19:00',
      duration_minutes: 120,
      guest_adults: 4,
      guest_children: 0,
      event_type: '',
      special_requests: '',
      status: 'CONFIRMED',
      admin_note: '',
    });
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (booking) => {
    setEditingBooking(booking);
    setFormModalError('');
    reset({
      booking_type: booking.booking_type || 'REGULAR_TABLE',
      space_type_id:
        booking.booking_type === 'DELIVERY' ? '' : booking.space_type_id || '',
      rooms_requested: booking.rooms_requested || 1,
      customer_name: booking.customer_name || '',
      customer_phone: booking.customer_phone || '',
      customer_email: booking.customer_email || '',
      booking_date: booking.booking_date || todayStr,
      booking_time: booking.booking_time ? booking.booking_time.substring(0, 5) : '19:00',
      duration_minutes: booking.duration_minutes || 120,
      guest_adults: booking.guest_adults || 2,
      guest_children: booking.guest_children || 0,
      event_type: booking.event_type || '',
      special_requests: booking.special_requests || '',
      status: booking.status || 'PENDING',
      admin_note: booking.admin_note || '',
    });
    setFormModalOpen(true);
  };

  const onSubmitBookingForm = async (data) => {
    setFormModalError('');
    try {
      const payload = {
        ...data,
        space_type_id:
          data.booking_type === 'DELIVERY' ? null : Number(data.space_type_id),
        event_type:
          data.booking_type === 'PARTY_EVENT' || data.booking_type === 'DELIVERY'
            ? data.event_type || null
            : null,
      };

      if (editingBooking) {
        await bookingAPI.updateAdmin(editingBooking.id, payload);
        showToast(
          `Reservation ${editingBooking.booking_code} updated successfully!`,
          'success'
        );
      } else {
        const created = await bookingAPI.createAdmin(payload);
        showToast(
          `New reservation ${created?.booking_code || ''} created successfully!`,
          'success'
        );
      }

      setFormModalOpen(false);
      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error('Error saving reservation:', err);
      setFormModalError(err.message || 'Failed to save reservation');
    }
  };

  const handleQuickStatusChange = async (booking, nextStatus) => {
    setUpdatingStatusId(booking.id);
    try {
      const updated = await bookingAPI.updateStatus(booking.id, {
        status: nextStatus,
        admin_note: booking.admin_note,
      });
      showToast(
        `Reservation ${booking.booking_code} marked as ${STATUS_BADGE_MAP[nextStatus]?.label || nextStatus}`,
        'success'
      );
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? { ...item, ...(updated || { status: nextStatus }) } : item))
      );
      if (detailBooking && detailBooking.id === booking.id) {
        setDetailBooking((prev) => ({ ...prev, status: nextStatus }));
        setQuickStatus(nextStatus);
      }
      fetchStats();
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(err.message || 'Could not update reservation status', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleOpenDetailModal = (booking) => {
    setDetailBooking(booking);
    setQuickStatus(booking.status || 'PENDING');
    setQuickNote(booking.admin_note || '');
  };

  const handleSaveDetailStatusAndNote = async () => {
    if (!detailBooking) return;
    setSavingDetailNote(true);
    try {
      const updated = await bookingAPI.updateStatus(detailBooking.id, {
        status: quickStatus,
        admin_note: quickNote,
      });
      showToast(`Reservation ${detailBooking.booking_code} updated!`, 'success');
      setDetailBooking(updated || { ...detailBooking, status: quickStatus, admin_note: quickNote });
      fetchBookings();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to update reservation note', 'error');
    } finally {
      setSavingDetailNote(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmBooking) return;
    setDeleting(true);
    try {
      await bookingAPI.deleteAdmin(deleteConfirmBooking.id);
      showToast(
        `Reservation ${deleteConfirmBooking.booking_code} has been removed.`,
        'success'
      );
      setDeleteConfirmBooking(null);
      if (detailBooking?.id === deleteConfirmBooking.id) {
        setDetailBooking(null);
      }
      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error('Delete reservation error:', err);
      showToast(err.message || 'Failed to delete reservation', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Reservations', count: stats?.total_bookings },
    { id: 'PENDING', label: 'Pending', count: stats?.pending_count },
    { id: 'CONFIRMED', label: 'Confirmed', count: stats?.confirmed_count },
    { id: 'SEATED', label: 'Seated', count: stats?.seated_count },
    { id: 'COMPLETED', label: 'Completed', count: stats?.completed_count },
    { id: 'CANCELLED', label: 'Cancelled', count: stats?.cancelled_count },
  ];

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
              <CalendarCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
              Concierge & Hospitality Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-zinc-100">
            Reservations, Banquets & Delivery
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Coordinate table reservations, private VIP suites, event banquets, and home delivery orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchBookings();
            }}
            className="p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            title="Refresh reservations"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Reservations
            </span>
            <CalendarCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-zinc-100 mt-2 font-semibold">
            {stats ? stats.total_bookings : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {stats
              ? `${stats.party_event_count || 0} events • ${stats.delivery_count || 0} delivery orders`
              : 'All active bookings'}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
              Pending Action
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-amber-400 mt-2 font-semibold">
            {stats ? stats.pending_count : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Awaiting concierge confirmation</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Confirmed & Seated
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-emerald-400 mt-2 font-semibold">
            {stats ? (stats.confirmed_count || 0) + (stats.seated_count || 0) : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {stats
              ? `${stats.confirmed_count || 0} confirmed • ${stats.seated_count || 0} seated`
              : 'Ready for service'}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Expected Patrons
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-purple-400 mt-2 font-semibold">
            {stats ? `${stats.total_guests} Guests` : '—'}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {stats ? `Est. value: ${formatVND(stats.estimated_revenue || 0)}` : 'Total party size'}
          </p>
        </div>
      </div>

      {/* Status Quick-Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => {
          const active = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                active
                  ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md shadow-amber-500/15'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    active ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-zinc-900/50 border border-zinc-800/70 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking code, guest name, phone, event..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Space Type Filter */}
          <select
            value={selectedSpaceType}
            onChange={(e) => setSelectedSpaceType(e.target.value)}
            className="bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 rounded-xl text-sm px-3 py-2 focus:outline-none focus:border-amber-500/60 transition-colors"
          >
            <option value="ALL">All Dining Spaces</option>
            {spaceTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Booking Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 rounded-xl text-sm px-3 py-2 focus:outline-none focus:border-amber-500/60 transition-colors"
          >
            <option value="ALL">All Reservation Types</option>
            <option value="REGULAR_TABLE">Regular Table / Suite</option>
            <option value="PARTY_EVENT">Banquet & Party Event</option>
            <option value="DELIVERY">Home Delivery / Ship</option>
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 rounded-xl text-sm px-3 py-2 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-amber-400 border border-zinc-700 transition-colors"
            >
              Today
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors"
                title="Clear date filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reservations Table */}
      {loading ? (
        <div className="min-h-[320px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-zinc-400">Loading reservations schedule...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="min-h-[300px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-900/30">
          <CalendarCheck className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="text-lg font-serif text-zinc-300">No Reservations Found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-5">
            {search ||
            selectedSpaceType !== 'ALL' ||
            selectedStatus !== 'ALL' ||
            selectedType !== 'ALL' ||
            selectedDate
              ? 'No reservations match your active filters. Try clearing some filters.'
              : 'Create a new table or banquet reservation to get started.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-medium transition-colors"
          >
            + Create New Reservation
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800/50 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Reservation Code</th>
                  <th className="py-3.5 px-4 font-semibold">Guest Details</th>
                  <th className="py-3.5 px-4 font-semibold">Dining Space / Format</th>
                  <th className="py-3.5 px-4 font-semibold">Schedule & Guests</th>
                  <th className="py-3.5 px-4 font-semibold">Pre-ordered Menu</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status & Quick Action</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {bookings.map((booking) => {
                  const statusMeta = STATUS_BADGE_MAP[booking.status] || STATUS_BADGE_MAP.PENDING;
                  const isParty = booking.booking_type === 'PARTY_EVENT';
                  const isDelivery = booking.booking_type === 'DELIVERY';
                  const hasPreorder = Number(booking.preorder_items_count) > 0;

                  return (
                    <tr key={booking.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Booking Code & Type */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-mono font-semibold text-amber-400 text-xs sm:text-sm">
                          {booking.booking_code}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {isParty ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <PartyPopper className="w-3 h-3" />
                              <span>Party Event</span>
                            </span>
                          ) : isDelivery ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              <Truck className="w-3 h-3" />
                              <span>Delivery / Ship</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                              <span>Regular Dining</span>
                            </span>
                          )}
                        </div>
                        {booking.event_type && (
                          <div className="text-xs text-purple-300/90 mt-1 line-clamp-1">
                            {booking.event_type}
                          </div>
                        )}
                      </td>

                      {/* Guest Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-zinc-100">{booking.customer_name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                          <a
                            href={`tel:${booking.customer_phone}`}
                            className="hover:text-amber-400 transition-colors"
                          >
                            {booking.customer_phone}
                          </a>
                        </div>
                        {booking.customer_email && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{booking.customer_email}</span>
                          </div>
                        )}
                      </td>

                      {/* Dining Space / Format */}
                      <td className="py-4 px-4 align-top">
                        {isDelivery ? (
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-cyan-400 font-medium">
                              <Truck className="w-3.5 h-3.5" />
                              <span>Home Delivery Dispatch</span>
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              No dining room required
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-sky-400 text-xs sm:text-sm">
                              <Compass className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {booking.space_display_name || `Space #${booking.space_type_id}`}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {booking.rooms_requested || 1} room/unit
                              {booking.rooms_requested > 1 ? 's' : ''} requested
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Schedule & Party Size */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-100 text-xs sm:text-sm">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{booking.booking_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            {booking.booking_time ? booking.booking_time.substring(0, 5) : '19:00'}{' '}
                            ({booking.duration_minutes || 120}m)
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60 mt-1.5">
                          <Users className="w-3 h-3 text-amber-400" />
                          <span>
                            {booking.guest_adults} Adults
                            {booking.guest_children > 0 ? `, ${booking.guest_children} Kids` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Pre-order */}
                      <td className="py-4 px-4 align-top">
                        {hasPreorder ? (
                          <div>
                            <button
                              onClick={() => handleOpenDetailModal(booking)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <UtensilsCrossed className="w-3.5 h-3.5" />
                              <span>{booking.preorder_items_count} Pre-ordered Dishes</span>
                            </button>
                            <div className="text-xs font-mono text-zinc-300 mt-0.5">
                              {formatVND(booking.preorder_total)}
                            </div>
                          </div>
                        ) : booking.estimated_budget > 0 ? (
                          <div className="text-xs font-mono text-zinc-300">
                            Est. Total: {formatVND(booking.estimated_budget)}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">Order at table</span>
                        )}

                        {booking.special_requests && (
                          <p
                            className="text-[11px] text-zinc-400 italic mt-1 line-clamp-1 max-w-[200px]"
                            title={booking.special_requests}
                          >
                            "{booking.special_requests}"
                          </p>
                        )}
                      </td>

                      {/* Status & Quick Actions */}
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusMeta.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                            <span>{statusMeta.label}</span>
                          </span>

                          {updatingStatusId === booking.id ? (
                            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {booking.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleQuickStatusChange(booking, 'CONFIRMED')}
                                    className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                                    title="Confirm Reservation"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleQuickStatusChange(booking, 'CANCELLED')}
                                    className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-medium transition-colors"
                                    title="Cancel Reservation"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {booking.status === 'CONFIRMED' && (
                                <>
                                  <button
                                    onClick={() => handleQuickStatusChange(booking, 'SEATED')}
                                    className="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-medium transition-colors"
                                    title="Check-in / Seat Guest"
                                  >
                                    Check-in
                                  </button>
                                  <button
                                    onClick={() => handleQuickStatusChange(booking, 'CANCELLED')}
                                    className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-medium transition-colors"
                                    title="Cancel Reservation"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {booking.status === 'SEATED' && (
                                <button
                                  onClick={() => handleQuickStatusChange(booking, 'COMPLETED')}
                                  className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-medium transition-colors"
                                  title="Mark Dining Completed"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetailModal(booking)}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="View Full Details & Pre-ordered Menu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(booking)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Edit Reservation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmBooking(booking)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete Reservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: RESERVATION DETAILS & PRE-ORDER ITEMS ================= */}
      {detailBooking && (
        <div
          onClick={() => setDetailBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
          >
            {/* Sticky Header */}
            <div className="shrink-0 flex items-start justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-lg font-bold text-amber-400">
                    {detailBooking.booking_code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STATUS_BADGE_MAP[detailBooking.status]?.className || ''
                    }`}
                  >
                    {STATUS_BADGE_MAP[detailBooking.status]?.label || detailBooking.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Created at {detailBooking.created_at} •{' '}
                  {detailBooking.booking_type === 'PARTY_EVENT'
                    ? 'Banquet & Event Reservation'
                    : detailBooking.booking_type === 'DELIVERY'
                      ? 'Home Delivery / Ship Order'
                      : 'Standard Table / Suite Reservation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Guest & Venue Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Guest Information
                  </div>
                  <div className="text-base font-semibold text-zinc-100">
                    {detailBooking.customer_name}
                  </div>
                  <div className="text-xs text-zinc-300 font-mono flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{detailBooking.customer_phone}</span>
                  </div>
                  {detailBooking.customer_email && (
                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{detailBooking.customer_email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Space Allocation & Schedule
                  </div>
                  {detailBooking.booking_type === 'DELIVERY' ? (
                    <div className="inline-flex items-center gap-1.5 text-sm text-cyan-400 font-semibold">
                      <Truck className="w-4 h-4" />
                      <span>Home Delivery Dispatch (No Dining Space Required)</span>
                    </div>
                  ) : (
                    <div className="text-sm text-sky-400 font-semibold">
                      {detailBooking.space_display_name || `Space #${detailBooking.space_type_id}`} •{' '}
                      {detailBooking.rooms_requested || 1} Room/Unit(s)
                    </div>
                  )}
                  <div className="text-xs text-zinc-300 font-mono">
                    {detailBooking.booking_date} at{' '}
                    {detailBooking.booking_time ? detailBooking.booking_time.substring(0, 5) : '19:00'}{' '}
                    ({detailBooking.duration_minutes || 120} mins) • {detailBooking.guest_adults} Adults,{' '}
                    {detailBooking.guest_children || 0} Children
                  </div>
                </div>
              </div>

              {/* Event / Special Requests */}
              {(detailBooking.event_type || detailBooking.special_requests) && (
                <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-4 space-y-2 text-sm">
                  {detailBooking.event_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs uppercase tracking-wider">
                        Event / Order Title:
                      </span>
                      <span className="font-semibold text-purple-300">
                        {detailBooking.event_type}
                      </span>
                    </div>
                  )}
                  {detailBooking.estimated_budget > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs uppercase tracking-wider">
                        Estimated Budget:
                      </span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {formatVND(detailBooking.estimated_budget)}
                      </span>
                    </div>
                  )}
                  {detailBooking.special_requests && (
                    <div className="pt-2 border-t border-zinc-800">
                      <span className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">
                        Guest Special Requests / Delivery Address:
                      </span>
                      <p className="text-zinc-200 text-xs italic bg-zinc-900/70 p-3 rounded-xl border border-zinc-800">
                        "{detailBooking.special_requests}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pre-ordered Dishes Section */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>
                    Pre-ordered Culinary Items ({detailBooking.items?.length || 0})
                  </span>
                </h4>

                {!detailBooking.items || detailBooking.items.length === 0 ? (
                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800 text-xs text-zinc-500 text-center">
                    No dishes were pre-ordered with this reservation. Guest will order at the table.
                  </div>
                ) : (
                  <div className="border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-800/60 text-zinc-400 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Dish</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {detailBooking.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-zinc-100">
                                {item.item_name || `Menu Item #${item.menu_item_id}`}
                              </div>
                              {item.note && (
                                <div className="text-[11px] text-amber-400/90 italic mt-0.5">
                                  Chef Note: {item.note}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">
                              x{item.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatVND(item.unit_price)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                              {formatVND(item.line_total || item.quantity * item.unit_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-zinc-800/40 border-t border-zinc-800">
                        <tr>
                          <td colSpan={3} className="py-2.5 px-3 text-right font-semibold text-zinc-300">
                            Total Pre-ordered Menu:
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400 text-sm">
                            {formatVND(detailBooking.preorder_total || 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Concierge Status & Internal Note Update Box */}
              <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Reservation Status
                    </label>
                    <select
                      value={quickStatus}
                      onChange={(e) => setQuickStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    >
                      {BOOKING_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Internal Concierge & Kitchen Note
                    </label>
                    <input
                      type="text"
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      placeholder="e.g. Deposit received via VietQR, VIP butler assigned..."
                      className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900">
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                Close Window
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailBooking;
                    setDetailBooking(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
                >
                  Full Edit Form
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetailStatusAndNote}
                  disabled={savingDetailNote}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-semibold transition-all"
                >
                  {savingDetailNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Status & Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CREATE / EDIT RESERVATION ================= */}
      {formModalOpen && (
        <div
          onClick={() => setFormModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
          >
            {/* Sticky Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
              <div>
                <h3 className="text-xl font-serif font-semibold text-zinc-100">
                  {editingBooking
                    ? `Edit Reservation (${editingBooking.booking_code})`
                    : 'Create New Reservation'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter guest contact details, dining space allocation, and schedule preferences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitBookingForm)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {formModalError && (
                  <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{formModalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Booking Type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Reservation Type <span className="text-amber-500">*</span>
                    </label>
                    <select
                      {...register('booking_type')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    >
                      {BOOKING_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dining Space (Only for Dine-in / Party Event) */}
                  {watchedBookingType === 'DELIVERY' ? (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Service Format
                      </label>
                      <div className="w-full px-3.5 py-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 flex items-center gap-2 font-medium">
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>Home Delivery Dispatch (No Dining Space Needed)</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Dining Space / Suite <span className="text-amber-500">*</span>
                        </label>
                        <select
                          {...register('space_type_id')}
                          className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="">Select Space</option>
                          {spaceTypes.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                              {sp.name} (Max {sp.max_capacity} guests)
                            </option>
                          ))}
                        </select>
                        {errors.space_type_id && (
                          <p className="text-rose-400 text-xs mt-1">{errors.space_type_id.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Rooms / Tables Requested
                        </label>
                        <input
                          type="number"
                          min="1"
                          {...register('rooms_requested')}
                          className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </>
                  )}

                  {/* Guest Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Guest Full Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('customer_name')}
                      placeholder="e.g. Nguyen Van An"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    {errors.customer_name && (
                      <p className="text-rose-400 text-xs mt-1">{errors.customer_name.message}</p>
                    )}
                  </div>

                  {/* Guest Phone */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Phone Number <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('customer_phone')}
                      placeholder="e.g. 0912345678"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    {errors.customer_phone && (
                      <p className="text-rose-400 text-xs mt-1">{errors.customer_phone.message}</p>
                    )}
                  </div>

                  {/* Guest Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('customer_email')}
                      placeholder="guest@example.com"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    {errors.customer_email && (
                      <p className="text-rose-400 text-xs mt-1">{errors.customer_email.message}</p>
                    )}
                  </div>

                  {/* Booking Date */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Reservation Date <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('booking_date')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    {errors.booking_date && (
                      <p className="text-rose-400 text-xs mt-1">{errors.booking_date.message}</p>
                    )}
                  </div>

                  {/* Booking Time */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Arrival / Delivery Time <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register('booking_time')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    {errors.booking_time && (
                      <p className="text-rose-400 text-xs mt-1">{errors.booking_time.message}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      step="30"
                      min="30"
                      max="480"
                      {...register('duration_minutes')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Adults */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Adult Guests / Portions <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('guest_adults')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    {errors.guest_adults && (
                      <p className="text-rose-400 text-xs mt-1">{errors.guest_adults.message}</p>
                    )}
                  </div>

                  {/* Children */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Children Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('guest_children')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Reservation Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    >
                      {BOOKING_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Party & Event Specific Fields */}
                  {watchedBookingType === 'PARTY_EVENT' && (
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1.5">
                        Event Occasion Title
                      </label>
                      <input
                        type="text"
                        {...register('event_type')}
                        placeholder="e.g. Corporate Gala, Birthday Party"
                        className="w-full px-3.5 py-2.5 bg-purple-950/20 border border-purple-500/30 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  )}

                  {/* Admin Note */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Internal Concierge Note
                    </label>
                    <input
                      type="text"
                      {...register('admin_note')}
                      placeholder="e.g. Confirmed via phone call, deposit received..."
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Guest Special Requests */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      {watchedBookingType === 'DELIVERY'
                        ? 'Delivery Address & Packaging Instructions'
                        : 'Guest Special Requests & Dietary Notes'}
                    </label>
                    <textarea
                      rows={2}
                      {...register('special_requests')}
                      placeholder={
                        watchedBookingType === 'DELIVERY'
                          ? 'Full delivery address, recipient note, dry ice packaging...'
                          : 'Window seat preference, baby high-chair, food allergies, floral setup...'
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
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
                  <span>{editingBooking ? 'Save Changes' : 'Create Reservation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DELETE CONFIRMATION ================= */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-serif font-semibold text-zinc-100">
              Delete Reservation?
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Are you sure you want to delete reservation{' '}
              <span className="text-amber-400 font-mono font-semibold">
                {deleteConfirmBooking.booking_code}
              </span>{' '}
              for guest{' '}
              <span className="text-zinc-200 font-semibold">
                {deleteConfirmBooking.customer_name}
              </span>
              ?
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              This action uses soft-deletion (`is_deleted = 1`) to preserve historical audit logs.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmBooking(null)}
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
