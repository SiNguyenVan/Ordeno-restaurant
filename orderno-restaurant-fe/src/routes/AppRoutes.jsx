import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components';

// Public Pages (Direct Imports - No Lazy Loading)
import AboutPage from '../pages/AboutPage';
import MenuPage from '../pages/MenuPage';
import MenuItemDetailPage from '../pages/MenuItemDetailPage';
import BookingPage from '../pages/BookingPage';
import BookingLookupPage from '../pages/BookingLookupPage';
import CartPage from '../pages/CartPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Modules (Direct Imports - No Lazy Loading)
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminLayout from '../layouts/AdminLayout';
import AdminStaffPage from '../pages/admin/AdminStaffPage';
import AdminMenuPage from '../pages/admin/AdminMenuPage';
import AdminSpacePage from '../pages/admin/AdminSpacePage';
import AdminBookingPage from '../pages/admin/AdminBookingPage';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Admin Login Route (Public) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Portal */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/staff" replace />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="spaces" element={<AdminSpacePage />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="bookings" element={<AdminBookingPage />} />
        <Route path="*" element={<Navigate to="/admin/staff" replace />} />
      </Route>

      {/* Public Customer Portal */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AboutPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:id" element={<MenuItemDetailPage />} />
        <Route path="thuc-don" element={<MenuPage />} />
        <Route path="thuc-don/:id" element={<MenuItemDetailPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="reservation" element={<BookingPage />} />
        <Route path="dat-ban" element={<BookingPage />} />
        <Route path="lookup" element={<BookingLookupPage />} />
        <Route path="tra-cuu" element={<BookingLookupPage />} />
        <Route path="booking-lookup" element={<BookingLookupPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="lien-he" element={<ContactPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="gio-hang" element={<CartPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
