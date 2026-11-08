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
import ManageCategories from './pages/categories/ManageCategories';
import CreateUser from './pages/users/CreateUser';
import ManageUsers from './pages/users/ManageUsers';
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
            <Route path="cancel_orders" element={<ManageOrders />} />
            <Route path="bill_authorized" element={<ManageOrders />} />
            
            {/* Menu 4: Chef Reports & Kitchen */}
            <Route path="reports_cheff" element={<ChefReports />} />
            
            {/* Menu 5: Delivery */}
            <Route path="delivery" element={<Delivery />} />
            
            {/* Menu 2: Main Access */}
            <Route path="customer_list" element={<CustomerList />} />
            <Route path="add-product" element={<ManageProducts />} />
            <Route path="manage-categories" element={<ManageCategories />} />
            <Route path="manage-sub-categories" element={<ManageProducts />} />
            <Route path="create-users" element={<CreateUser />} />
            <Route path="manage-users" element={<ManageUsers />} />
            
            {/* Menu 6 & 7: Reports & Promotions */}
            <Route path="reports" element={<Reports />} />
            <Route path="reports_all" element={<Reports />} />
            <Route path="overall-invoices" element={<Reports />} />
            <Route path="reports_products_only" element={<Reports />} />
            <Route path="reports-overall" element={<Reports />} />
            <Route path="all-payment" element={<Reports />} />
            <Route path="promotions" element={<Promotions />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
