import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Cake, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  Server
} from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Royal508501');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLocalError('Please enter your username and password.');
      return;
    }

    setSubmitting(true);
    setLocalError(null);

    const res = await login(username.trim(), password);
    setSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(res.error);
    }
  };

  // Quick Account Autofill for Cashier / Chef / Admin testing
  const quickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setLocalError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090d16',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(217, 119, 6, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(30, 58, 138, 0.2) 0%, transparent 45%)
      `,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Rings */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        right: '-120px',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        border: '1px solid rgba(217, 119, 6, 0.08)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        pointerEvents: 'none'
      }} />

      {/* Main Glassmorphism Login Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(217, 119, 6, 0.1)',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* BRAND EMBLEM & HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px auto',
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(217, 119, 6, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
          }}>
            <Cake size={34} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.6px',
            marginBottom: '4px'
          }}>
            THE ROYAL BAKERY
          </h1>
          <p style={{
            fontSize: '11px',
            color: '#fbbf24',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Pre-Order & Cake Production POS
          </p>
        </div>

        {/* HIGH-SECURITY BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '6px 14px',
          borderRadius: '9999px',
          marginBottom: '24px'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span style={{ fontSize: '11.5px', color: '#6ee7b7', fontWeight: 600 }}>
            256-Bit Encrypted Session • MSSQL Express
          </span>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {localError && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            padding: '12px 14px',
            borderRadius: '10px',
            color: '#fecdd3',
            fontSize: '13px',
            marginBottom: '20px',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <AlertCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{localError}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* USERNAME FIELD */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#cbd5e1',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              System Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter counter username"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  backgroundColor: 'rgba(2, 6, 23, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#cbd5e1',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Security Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  backgroundColor: 'rgba(2, 6, 23, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d97706';
                  e.target.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px 20px',
              marginTop: '8px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14.5px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{submitting ? 'Verifying Credentials...' : 'Authenticate & Open Counter'}</span>
            {!submitting && <ArrowRight size={17} />}
          </button>
        </form>

        {/* DEMO / SHIFT STAFF QUICK SELECTOR */}
        <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Quick Staff Profile Selection:
            </span>
            <span style={{ fontSize: '11px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Test Accounts
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => quickFill('admin', 'Royal508501')}
              style={{
                padding: '7px 10px',
                background: username === 'admin' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: username === 'admin' ? '1px solid #d97706' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: username === 'admin' ? '#fbbf24' : '#cbd5e1',
                fontSize: '11.5px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              👑 Admin (System)
            </button>

            <button
              type="button"
              onClick={() => quickFill('cashier1', 'Cashier@TRB1')}
              style={{
                padding: '7px 10px',
                background: username === 'cashier1' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: username === 'cashier1' ? '1px solid #d97706' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: username === 'cashier1' ? '#fbbf24' : '#cbd5e1',
                fontSize: '11.5px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              💼 Cashier 01
            </button>

            <button
              type="button"
              onClick={() => quickFill('supervisor', 'Super@TRB2026')}
              style={{
                padding: '7px 10px',
                background: username === 'supervisor' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: username === 'supervisor' ? '1px solid #d97706' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: username === 'supervisor' ? '#fbbf24' : '#cbd5e1',
                fontSize: '11.5px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              ⭐ Supervisor
            </button>

            <button
              type="button"
              onClick={() => quickFill('chef_prema', 'Chef@Prema2026')}
              style={{
                padding: '7px 10px',
                background: username === 'chef_prema' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: username === 'chef_prema' ? '1px solid #d97706' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: username === 'chef_prema' ? '#fbbf24' : '#cbd5e1',
                fontSize: '11.5px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              🎂 Chef Premaratna
            </button>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#64748b' }}>
          <span>The Royal Bakery • No. 508, Galle Road, Colombo 06</span>
        </div>
      </div>
    </div>
  );
}

