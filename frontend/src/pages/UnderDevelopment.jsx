import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function UnderDevelopment() {
  const navigate = useNavigate();

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '62vh',
        textAlign: 'center',
        padding: '40px 20px',
        margin: '0 auto',
        maxWidth: '600px'
      }}
    >
      {/* Minimal Icon */}
      <div 
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          color: '#d97706',
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
        }}
      >
        <Construction size={34} />
      </div>

      {/* 404 / Notice Pill */}
      <span 
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#b45309',
          backgroundColor: '#fef3c7',
          padding: '3px 10px',
          borderRadius: '20px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}
      >
        Notice
      </span>

      {/* Main Title */}
      <h1 
        style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 10px 0'
        }}
      >
        Under Development
      </h1>

      {/* Subtitle Message */}
      <p 
        style={{
          fontSize: '15px',
          color: '#64748b',
          maxWidth: '420px',
          margin: '0 0 26px 0',
          lineHeight: '1.55'
        }}
      >
        This page is currently under development. Please check back soon.
      </p>

      {/* Simple Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '13.5px', fontWeight: 600 }}
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/dashboard')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '9px 20px', 
            fontSize: '13.5px', 
            fontWeight: 600,
            backgroundColor: '#0f172a',
            borderColor: '#0f172a'
          }}
        >
          <LayoutDashboard size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
