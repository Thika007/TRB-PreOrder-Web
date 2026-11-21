import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/orders/CreateOrder';
import ManageOrders from './pages/orders/ManageOrders';
import CancelledOrders from './pages/orders/CancelledOrders';
import BillAuthorized from './pages/orders/BillAuthorized';
import ChefReports from './pages/kitchen/ChefReports';
import Delivery from './pages/kitchen/Delivery';
import CustomerList from './pages/customers/CustomerList';
import CreateCustomer from './pages/customers/CreateCustomer';
import ManageProducts from './pages/products/ManageProducts';
import ManageCategories from './pages/categories/ManageCategories';
import ManageSubCategories from './pages/categories/ManageSubCategories';
import CreateUser from './pages/users/CreateUser';
import ManageUsers from './pages/users/ManageUsers';
import Reports from './pages/reports/Reports';
import Promotions from './pages/promotions/Promotions';
import UnderDevelopment from './pages/UnderDevelopment';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route path="cancel_orders" element={<CancelledOrders />} />
              <Route path="bill_authorized" element={<BillAuthorized />} />
              
              {/* Menu 4: Chef Reports & Kitchen (Temporarily Under Development) */}
              <Route path="reports_cheff" element={<UnderDevelopment />} />
              
              {/* Menu 5: Delivery (Temporarily Under Development) */}
              <Route path="delivery" element={<UnderDevelopment />} />
              
              {/* Menu 2: Main Access */}
              <Route path="create-customer" element={<CreateCustomer />} />
              <Route path="customer_list" element={<CustomerList />} />
              <Route path="add-product" element={<ManageProducts />} />
              <Route path="manage-categories" element={<ManageCategories />} />
              <Route path="manage-sub-categories" element={<ManageSubCategories />} />
              <Route path="create-users" element={<CreateUser />} />
              <Route path="manage-users" element={<ManageUsers />} />
              
              {/* Menu 6 & 7: Reports & Promotions (Temporarily Under Development) */}
              <Route path="reports" element={<UnderDevelopment />} />
              <Route path="reports_all" element={<UnderDevelopment />} />
              <Route path="overall-invoices" element={<UnderDevelopment />} />
              <Route path="reports_products_only" element={<UnderDevelopment />} />
              <Route path="reports-overall" element={<UnderDevelopment />} />
              <Route path="all-payment" element={<UnderDevelopment />} />
              <Route path="promotions" element={<UnderDevelopment />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
