import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { subscribeAcsatAlert } from '../utils/acsatAlert';

// Single shared info popup for every ACSAT dashboard, mounted once in App.js.
// Replaces window.alert() so all "info" messages look the same across the app.
export default function AcsatAlertModal() {
  const [message, setMessage] = useState(null);

  useEffect(() => subscribeAcsatAlert(setMessage), []);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483000,
      }}
      onClick={() => setMessage(null)}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem 1.75rem',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Info size={28} color="#3b82f6" />
        </div>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', lineHeight: 1.5, color: '#374151', whiteSpace: 'pre-line' }}>
          {message}
        </p>
        <button
          onClick={() => setMessage(null)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.55rem 2rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
