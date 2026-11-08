import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RestaurantProvider, AdminAuthProvider } from './context';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <RestaurantProvider>
          <AppRoutes />
        </RestaurantProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
