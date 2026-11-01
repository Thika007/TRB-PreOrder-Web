import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cake } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#fff',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
          animation: 'pulse 1.5s infinite'
        }}>
          <Cake size={30} color="#fff" />
        </div>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#fbbf24', letterSpacing: '0.5px' }}>
          THE ROYAL BAKERY
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Verifying secure counter session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
