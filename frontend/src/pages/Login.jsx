import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Royal508501');
  const [showPassword, setShowPassword] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
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
      setLocalError(res.error || 'Authentication failed. Please verify credentials.');
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
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0,
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      boxSizing: 'border-box'
    }}>
      {/* ========================================================
          LEFT COLUMN: FULL-HEIGHT FORM & BRANDING
          ======================================================== */}
      <div style={{
        flex: '1 1 50%',
        width: '50%',
        height: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 32px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 5,
        overflowY: 'auto'
      }}>
        {/* Centered Form Inner Wrapper */}
        <div style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 1. TOP LOGO */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 6px 18px rgba(185, 28, 28, 0.22)',
              backgroundColor: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo.webp" 
                alt="The Royal Bakery" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = '<span style="color:#ffffff;font-weight:900;font-size:26px;">RB</span>';
                  }
                }}
              />
            </div>
          </div>

          {/* 2. TITLE & SUBTITLE */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1e293b',
              letterSpacing: '-0.3px',
              margin: '0 0 6px 0',
              lineHeight: '1.2',
              fontFamily: 'serif'
            }}>
              THE ROYAL BAKERY
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: 600,
              letterSpacing: '0.2px',
              margin: 0
            }}>
              Pre-Order &amp; Cake Production POS
            </p>
          </div>

          {/* 3. ERROR BANNER */}
          {localError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '10px 14px',
              borderRadius: '8px',
              color: '#be123c',
              fontSize: '13px',
              marginBottom: '20px',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{localError}</span>
            </div>
          )}

          {/* 4. LOGIN FORM */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* USERNAME FIELD */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '6px'
              }}>
                Username / Staff ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter counter username"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 32px',
                    border: 'none',
                    borderBottom: '1.5px solid #cbd5e1',
                    backgroundColor: 'transparent',
                    color: '#0f172a',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#d97706';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#cbd5e1';
                  }}
                />
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '6px', top: '12px' }} />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 32px',
                    border: 'none',
                    borderBottom: '1.5px solid #cbd5e1',
                    backgroundColor: 'transparent',
                    color: '#0f172a',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#d97706';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#cbd5e1';
                  }}
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '6px', top: '12px' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* AUTHENTICATE BUTTON */}
            <div style={{ marginTop: '8px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '13px 48px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(217, 119, 6, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(217, 119, 6, 0.4)';
                }}
              >
                <span>{submitting ? 'Verifying...' : 'Authenticate'}</span>
                {!submitting && <ArrowRight size={17} />}
              </button>
            </div>
          </form>

          {/* 5. TEST ACCOUNTS TOGGLE LINK (Icon Removed per user request) */}
          <div style={{ marginTop: '22px' }}>
            <button
              type="button"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              style={{
                background: 'none',
                border: 'none',
                color: '#d97706',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ textDecoration: 'underline' }}>Test Accounts</span>
              {showTestAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* QUICK STAFF PROFILE SELECTION (Revealed only when link is clicked) */}
            {showTestAccounts && (
              <div style={{
                marginTop: '12px',
                padding: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '10px'
                }}>
                  Quick Staff Profile Selection:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => quickFill('admin', 'Royal508501')}
                    style={{
                      padding: '8px 12px',
                      background: username === 'admin' ? '#fef3c7' : '#ffffff',
                      border: username === 'admin' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: username === 'admin' ? '#b45309' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    👑 Admin (System)
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill('cashier1', 'Cashier@TRB1')}
                    style={{
                      padding: '8px 12px',
                      background: username === 'cashier1' ? '#fef3c7' : '#ffffff',
                      border: username === 'cashier1' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: username === 'cashier1' ? '#b45309' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    💼 Cashier 01
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill('supervisor', 'Super@TRB2026')}
                    style={{
                      padding: '8px 12px',
                      background: username === 'supervisor' ? '#fef3c7' : '#ffffff',
                      border: username === 'supervisor' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: username === 'supervisor' ? '#b45309' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ⭐ Supervisor
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill('chef_prema', 'Chef@Prema2026')}
                    style={{
                      padding: '8px 12px',
                      background: username === 'chef_prema' ? '#fef3c7' : '#ffffff',
                      border: username === 'chef_prema' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: username === 'chef_prema' ? '#b45309' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🎂 Chef Premaratna
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: FULL-HEIGHT BAKERY SHOWCASE & ORGANIC CURVE
          ======================================================== */}
      <div style={{
        flex: '1 1 50%',
        width: '50%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0f172a'
      }}>
        {/* Organic Curved Wave Divider Overlay (SVG) */}
        <svg 
          viewBox="0 0 100 800" 
          preserveAspectRatio="none" 
          style={{ 
            position: 'absolute', 
            top: '-2px', 
            bottom: '-2px', 
            left: '-2px', 
            height: 'calc(100% + 4px)', 
            width: '110px', 
            zIndex: 3, 
            pointerEvents: 'none' 
          }}
        >
          <path 
            d="M 0,-5 L 40,-5 C 95,140 10,290 65,440 C 115,590 20,700 80,805 L 0,805 Z" 
            fill="#ffffff" 
          />
        </svg>

        {/* Full-Height Bakery Imagery: Cake on Top & Croissants on Bottom */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top Showcase: Royal Chocolate Celebration Cake */}
          <div style={{
            flex: '1 1 50%',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'url(/bakery-showcase.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.35) 100%)'
            }} />
          </div>

          {/* Bottom Showcase: Fresh Baked Artisan Croissants & Pastries */}
          <div style={{
            flex: '1 1 50%',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'url(/bakery-pastry.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(0deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.1) 100%)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
