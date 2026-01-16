import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function Settings() {
  // Read auth first
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const hasAccess = Boolean(token && role === 'user');

  // Hooks must come before any return
  const [theme, setTheme] = useState(localStorage.getItem('ui:theme') || 'light');
  const [compact, setCompact] = useState(localStorage.getItem('ui:compact') === '1');

  useEffect(() => {
    // Effects can be guarded inside
    if (!hasAccess) return;
    localStorage.setItem('ui:theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [hasAccess, theme]);

  useEffect(() => {
    if (!hasAccess) return;
    localStorage.setItem('ui:compact', compact ? '1' : '0');
  }, [hasAccess, compact]);

  if (!hasAccess) return <Navigate to="/" replace />;

  return (
    <>
      <TopBar />
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: 16,
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 16,
        }}
      >
        <Sidebar />
        <main>
          <h2>Settings</h2>
          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontWeight: 700 }}>Theme</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => setTheme('light')}
                    style={{ padding: '8px 12px', background: theme === 'light' ? '#eef2ff' : 'transparent' }}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    style={{ padding: '8px 12px', background: theme === 'dark' ? '#eef2ff' : 'transparent' }}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 700 }}>Density</label>
                <div style={{ marginTop: 8 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={compact}
                      onChange={(e) => setCompact(e.target.checked)}
                    />{' '}
                    Compact mode
                  </label>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
