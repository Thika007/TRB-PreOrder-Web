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
