import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/orders/CreateOrder';
import ManageOrders from './pages/orders/ManageOrders';
import ChefReports from './pages/kitchen/ChefReports';
import Delivery from './pages/kitchen/Delivery';
import CustomerList from './pages/customers/CustomerList';
import ManageProducts from './pages/products/ManageProducts';
import Reports from './pages/reports/Reports';
import Promotions from './pages/promotions/Promotions';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure Protected Counter POS Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Menu 3: Orders */}
            <Route path="add-order" element={<CreateOrder />} />
            <Route path="manage_orders" element={<ManageOrders />} />
            
            {/* Menu 4: Chef Reports & Kitchen */}
            <Route path="reports_cheff" element={<ChefReports />} />
            
            {/* Menu 5: Delivery */}
            <Route path="delivery" element={<Delivery />} />
            
            {/* Menu 2: Main Access */}
            <Route path="customer_list" element={<CustomerList />} />
            <Route path="add-product" element={<ManageProducts />} />
            <Route path="manage-categories" element={<ManageProducts />} />
            <Route path="manage-users" element={<CustomerList />} />
            
            {/* Menu 6 & 7: Reports & Promotions */}
            <Route path="reports" element={<Reports />} />
            <Route path="promotions" element={<Promotions />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
