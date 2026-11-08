import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../layout';
import { ToastNotification, ScrollToTop } from '../common';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0a09] text-[#f5f0eb]">
      <ScrollToTop />
      <Navbar />
      <ToastNotification />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
