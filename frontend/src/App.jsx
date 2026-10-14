import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AddOrderPage from './pages/AddOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AIReturnAssistantPage from './pages/AIReturnAssistantPage';
import WarrantyTrackerPage from './pages/WarrantyTrackerPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected SaaS App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="add-order" element={<AddOrderPage />} />
              <Route path="ai-assistant" element={<AIReturnAssistantPage />} />
              <Route path="warranty" element={<WarrantyTrackerPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
