import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffFormSchema } from '../../../schemas';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  Briefcase,
  ChefHat,
  Coffee,
  Receipt,
  Building2,
  Phone,
  Mail,
  Calendar,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCw,
} from 'lucide-react';
import { staffAPI } from '../../../services';
import { useAdminAuth } from '../../../context';
import { formatVND } from '../../../utils';

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Administrator (Admin)' },
  { value: 'MANAGER', label: 'Restaurant Manager' },
  { value: 'CHEF', label: 'Head Chef' },
  { value: 'WAITER', label: 'Service Staff (Waiter)' },
  { value: 'CASHIER', label: 'Cashier' },
];



export default function AdminStaffPage() {
  const { adminUser } = useAdminAuth();

  // Staff list & stats state
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [modalError, setModalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form + Zod Resolver
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: modalSubmitting },
  } = useForm({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'WAITER',
      salary: '12000000',
      status: 'ACTIVE',
      avatar_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isEditing: false,
    },
  });

  // Delete Modal
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // 1. Fetch staff members & analytics
  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedRole !== 'ALL') params.role = selectedRole;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const [staffRes, statsRes] = await Promise.all([
        staffAPI.getAll(params),
        staffAPI.getStats(),
      ]);

      setStaffList(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
      setStats(statsRes?.data || statsRes || null);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  }, [search, selectedRole, selectedStatus]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Close Add / Edit Modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStaff(null);
    reset();
    setModalError('');
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingStaff(null);
    reset({
      full_name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'WAITER',
      salary: '12000000',
      status: 'ACTIVE',
      avatar_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isEditing: false,
    });
    setModalError('');
    setShowPassword(false);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    reset({
      full_name: staff.full_name || '',
      username: staff.username || '',
      email: staff.email || '',
      phone: staff.phone || '',
      password: '', // leave empty if not changing
      role: staff.role || 'WAITER',
      salary: staff.salary != null ? String(staff.salary) : '',
      status: staff.status || 'ACTIVE',
      avatar_url: staff.avatar_url || '',
      isEditing: true,
    });
    setModalError('');
    setShowPassword(false);
    setModalOpen(true);
  };

  // Handle Form Submission (Add or Edit)
  const handleSaveStaff = async (values) => {
    setModalError('');
    try {
      const payload = {
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
        role: values.role,
        salary:
          values.salary !== '' && values.salary !== undefined
            ? Number(values.salary)
            : 0,
        status: values.status,
        avatar_url: values.avatar_url?.trim() || null,
      };

      if (!editingStaff) {
        // Create new
        payload.username = values.username.trim();
        payload.password = values.password;
        await staffAPI.create(payload);
        showToast(`Staff member "${payload.full_name}" created successfully!`);
      } else {
        // Update existing
        if (values.password && values.password.trim()) {
          payload.password = values.password.trim();
        }
        await staffAPI.update(editingStaff.id, payload);
        showToast(`Staff profile "${payload.full_name}" updated successfully!`);
      }

      handleCloseModal();
      fetchStaffData();
    } catch (err) {
      setModalError(err.message || 'Failed to save staff member');
    }
  };

  // Quick toggle Active/Inactive status
  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await staffAPI.updateStatus(staff.id, nextStatus);
      showToast(`Status for ${staff.full_name} updated to ${nextStatus}`);
      fetchStaffData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Confirm Deletion (Soft Delete)
  const handleConfirmDelete = async () => {
    if (!deleteConfirmStaff) return;
    setDeleting(true);
    try {
      await staffAPI.delete(deleteConfirmStaff.id);
      showToast(`Account "${deleteConfirmStaff.full_name}" has been deactivated`);
      setDeleteConfirmStaff(null);
      fetchStaffData();
    } catch (err) {
      showToast(err.message || 'Failed to remove staff member', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Render role badge with luxury styling
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-bold text-purple-300">
            <Shield className="h-3 w-3" />
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-300">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#f5d77f]">
            <Briefcase className="h-3 w-3" />
            Manager
          </span>
        );
      case 'CHEF':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
            <ChefHat className="h-3 w-3" />
            Head Chef
          </span>
        );
      case 'CASHIER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
            <Receipt className="h-3 w-3" />
            Cashier
          </span>
        );
      case 'WAITER':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
            <Coffee className="h-3 w-3" />
            Server
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-2xl ${
            toast.type === 'error'
              ? 'border-rose-500/40 bg-rose-950/90 text-rose-200'
              : 'border-[#d4af37]/40 bg-[#1b150f]/95 text-[#f5d77f]'
          }`}
        >
          {toast.type === 'error' ? (
            <XCircle className="h-4 w-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
            <Users className="h-4 w-4" />
            <span>Human Resource Management</span>
          </div>
          <h1 className="mt-1 font-serif-luxury text-2xl font-bold text-white sm:text-3xl">
            Staff & Access Control
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            Manage staff accounts, culinary team, servers, and branch allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaffData}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-stone-300 transition hover:border-[#d4af37] hover:text-[#d4af37]"
            title="Reload directory"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#b8860b] px-5 py-3 text-xs font-bold text-[#0c0a09] shadow-lg shadow-[#d4af37]/20 transition hover:brightness-110 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Staff</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#14110e] p-4 transition hover:border-[#d4af37]/40">
          <span className="text-[11px] font-semibold text-stone-400">Total Staff</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif-luxury text-2xl font-bold text-white">
              {stats?.total ?? staffList.length}
            </span>
            <Users className="h-5 w-5 text-stone-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#14110e] p-4 transition hover:border-emerald-500/40">
          <span className="text-[11px] font-semibold text-emerald-400">Active on Duty</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif-luxury text-2xl font-bold text-emerald-400">
              {stats?.active ?? staffList.filter((s) => s.status === 'ACTIVE').length}
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500/60" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#d4af37]/30 bg-[#14110e] p-4 transition hover:border-[#d4af37]">
          <span className="text-[11px] font-semibold text-[#d4af37]">Managers & Chefs</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif-luxury text-2xl font-bold text-[#f5d77f]">
              {(stats?.byRole?.MANAGER || 0) + (stats?.byRole?.CHEF || 0) ||
                staffList.filter((s) => ['MANAGER', 'CHEF'].includes(s.role)).length}
            </span>
            <ChefHat className="h-5 w-5 text-[#d4af37]/60" />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-[#14110e] p-4 transition hover:border-sky-500/40">
          <span className="text-[11px] font-semibold text-sky-400">Servers & Cashiers</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif-luxury text-2xl font-bold text-sky-300">
              {(stats?.byRole?.WAITER || 0) + (stats?.byRole?.CASHIER || 0) ||
                staffList.filter((s) => ['WAITER', 'CASHIER'].includes(s.role)).length}
            </span>
            <Coffee className="h-5 w-5 text-sky-500/60" />
          </div>
        </div>
      </div>

      {/* 3. FILTER TOOLBAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#14110e] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, email, or phone..."
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pr-4 pl-10 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Role */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs font-medium text-stone-200 focus:border-[#d4af37] focus:outline-none"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#14110e]">
                {opt.label}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs font-medium text-stone-200 focus:border-[#d4af37] focus:outline-none"
          >
            <option value="ALL" className="bg-[#14110e]">
              All Statuses
            </option>
            <option value="ACTIVE" className="bg-[#14110e]">
              Active
            </option>
            <option value="INACTIVE" className="bg-[#14110e]">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14110e] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-[11px] font-semibold text-stone-400 uppercase">
              <tr>
                <th className="py-3.5 pr-4 pl-6">Staff Member</th>
                <th className="px-4 py-3.5">Contact Info</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Base Salary</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#d4af37]" />
                    <p className="mt-2 text-xs">Loading staff directory...</p>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-400">
                    <Users className="mx-auto h-8 w-8 text-stone-600" />
                    <p className="mt-2 text-xs">No staff members found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const isCurrent = adminUser?.id === staff.id;
                  const isActive = staff.status === 'ACTIVE';

                  return (
                    <tr
                      key={staff.id}
                      className="group transition hover:bg-white/[0.02]"
                    >
                      {/* Column 1: Staff Member */}
                      <td className="py-3.5 pr-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              staff.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={staff.full_name}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">
                                {staff.full_name}
                              </span>
                              {isCurrent && (
                                <span className="rounded bg-[#d4af37]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#d4af37]">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400">
                              @{staff.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-stone-300">
                            <Mail className="h-3 w-3 text-stone-500" />
                            <span>{staff.email}</span>
                          </p>
                          {staff.phone && (
                            <p className="flex items-center gap-1.5 text-stone-400">
                              <Phone className="h-3 w-3 text-stone-500" />
                              <span>{staff.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Role */}
                      <td className="px-4 py-3.5">{renderRoleBadge(staff.role)}</td>

                      {/* Column 4: Salary */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-[#d4af37]">
                          {staff.salary ? formatVND(staff.salary) : '—'}
                        </span>
                      </td>

                      {/* Column 6: Status */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          disabled={staff.role === 'SUPER_ADMIN'}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-stone-500/15 text-stone-400 hover:bg-stone-500/25'
                          } disabled:opacity-50`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400' : 'bg-stone-500'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(staff)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-stone-300 transition hover:border-[#d4af37] hover:text-[#d4af37]"
                            title="Edit staff profile"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {staff.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => setDeleteConfirmStaff(staff)}
                              className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20"
                              title="Deactivate account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD / EDIT STAFF MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#d4af37]/30 bg-[#16120e] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-white">
                      {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {editingStaff
                        ? `Update credentials & details for @${editingStaff.username}`
                        : 'Enter employee credentials and assignment details'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-1.5 text-stone-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(handleSaveStaff)} className="mt-6 space-y-4 text-xs" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-stone-300">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('full_name')}
                      placeholder="Alex Harrison"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.full_name
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.full_name && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.full_name.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300">
                      Username <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!!editingStaff}
                      {...register('username')}
                      placeholder="alex_waiter"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition disabled:opacity-60 focus:outline-none ${
                        errors.username
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.username && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.username.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-stone-300">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="alex@ordeno.vn"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.email
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="0901234567"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.phone
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.phone.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-stone-300">
                      {editingStaff
                        ? 'New Password (Leave blank to keep unchanged)'
                        : 'Initial Password *'}
                    </label>
                    <span className="text-[10px] text-stone-400">Minimum 6 characters</span>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder={editingStaff ? '•••••••• (unchanged)' : 'Staff@123'}
                      className={`w-full rounded-xl border bg-black/40 py-2.5 pr-10 pl-3.5 text-white transition focus:outline-none ${
                        errors.password
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.password.message}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-semibold text-stone-300">
                      Assigned Role <span className="text-rose-400">*</span>
                    </label>
                    <select
                      {...register('role')}
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.role
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    >
                      <option value="SUPER_ADMIN" className="bg-[#14110e]">
                        Super Admin
                      </option>
                      <option value="ADMIN" className="bg-[#14110e]">
                        Administrator (Admin)
                      </option>
                      <option value="MANAGER" className="bg-[#14110e]">
                        Restaurant Manager
                      </option>
                      <option value="CHEF" className="bg-[#14110e]">
                        Head Chef
                      </option>
                      <option value="WAITER" className="bg-[#14110e]">
                        Service Staff (Waiter)
                      </option>
                      <option value="CASHIER" className="bg-[#14110e]">
                        Cashier
                      </option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.role.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300">
                      Base Salary (VND)
                    </label>
                    <input
                      type="number"
                      {...register('salary')}
                      placeholder="12000000"
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.salary
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    />
                    {errors.salary && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.salary.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300">
                      Account Status <span className="text-rose-400">*</span>
                    </label>
                    <select
                      {...register('status')}
                      className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                        errors.status
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-white/10 focus:border-[#d4af37]'
                      }`}
                    >
                      <option value="ACTIVE" className="bg-[#14110e]">
                        Active on Duty
                      </option>
                      <option value="INACTIVE" className="bg-[#14110e]">
                        Inactive / Leave
                      </option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.status.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    {...register('avatar_url')}
                    placeholder="https://images.unsplash.com/..."
                    className={`mt-1.5 w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white transition focus:outline-none ${
                      errors.avatar_url
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-white/10 focus:border-[#d4af37]'
                    }`}
                  />
                  {errors.avatar_url && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.avatar_url.message}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-full border border-white/15 px-5 py-2.5 font-semibold text-stone-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-6 py-2.5 font-bold text-[#0c0a09] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {modalSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#0c0a09]" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingStaff ? 'Save Changes' : 'Create Staff Member'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirmStaff(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-3xl border border-rose-500/40 bg-[#16120e] p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif-luxury text-lg font-bold text-white">
              Confirm Staff Deactivation
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-stone-400">
              Are you sure you want to deactivate staff member{' '}
              <strong className="text-white">
                {deleteConfirmStaff.full_name} (@{deleteConfirmStaff.username})
              </strong>
              ? The account will be archived (soft-deleted) and restricted from accessing the system.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaff(null)}
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
                  <span>Confirm Deactivate</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
