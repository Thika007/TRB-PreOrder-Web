import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './styles/index.css';

// ========================================================
// RUNTIME LAN CONNECTION INITIALIZATION
// Reads connection.txt from dist/public to allow manual IP changes
// ========================================================
async function bootstrap() {
  try {
    const res = await fetch('/connection.txt?t=' + Date.now());
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      if (lines.length > 0) {
        let base = lines[0].replace(/\/+$/, '');
        if (base && !base.startsWith('http://') && !base.startsWith('https://')) {
          base = 'http://' + base;
        }

        // Auto-upgrade to HTTPS if loaded over HTTPS to prevent Mixed Content & 301 redirect failures
        if (window.location.protocol === 'https:' && base.startsWith('http://')) {
          base = base.replace(/^http:\/\//i, 'https://');
          console.log('🔒 [TRB POS] Auto-upgraded connection URL to HTTPS:', base);
        }

        // If visited from a public domain and connection.txt has localhost, use the public domain origin
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          if (base.includes('localhost') || base.includes('127.0.0.1')) {
            base = window.location.origin;
          }
        }

        if (base) {
          axios.defaults.baseURL = base;
          console.log('🔗 [TRB POS] Backend Connection URL:', axios.defaults.baseURL);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load /connection.txt, using default connection:', err.message);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
