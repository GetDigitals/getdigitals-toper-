import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Surfaces crashes that happen outside React's render cycle (e.g. inside
// an async login/register handler, a Firebase SDK callback, etc.) — an
// ErrorBoundary alone only catches render-phase throws. Without this,
// these show up as nothing but a silent stuck "Please wait..." or a
// blank screen with zero clue what happened.
function showFatalOverlay(title, detail) {
  if (document.getElementById('fatal-error-overlay')) return; // don't stack multiple
  const el = document.createElement('div');
  el.id = 'fatal-error-overlay';
  el.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:#0B0E14;color:#F5E9D8;padding:24px;font-family:monospace;font-size:13px;line-height:1.5;overflow-y:auto;white-space:pre-wrap;word-break:break-word;';
  el.innerHTML = `<div style="font-size:22px;margin-bottom:12px;">⚠️ ${title}</div><div style="background:#1a1f2b;border:1px solid #E8650A55;border-radius:10px;padding:14px;color:#ff9d7a;margin-bottom:16px;">${detail}</div><button id="fatal-error-reload" style="background:#E8650A;color:#0B0E14;border:none;border-radius:10px;padding:12px 20px;font-weight:700;font-family:inherit;">Reload</button>`;
  document.body.appendChild(el);
  document.getElementById('fatal-error-reload').onclick = () => window.location.reload();
}
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandledrejection]', e.reason);
  showFatalOverlay('Unhandled error', String(e.reason?.stack || e.reason?.message || e.reason));
});
window.addEventListener('error', (e) => {
  console.error('[window.onerror]', e.error || e.message);
  showFatalOverlay('Script error', String(e.error?.stack || e.message));
});

// Minimal offline-first service worker registration.
// Caches the built app shell so it works with zero network after first load.
//
// Auto-refresh for ALREADY-OPEN tabs when a new version deploys: the
// `controllerchange` event fires whenever the active service worker
// changes — but that includes the very FIRST time a page is ever
// controlled (a brand-new registration, or a tab whose site data was
// cleared), not just genuine version updates. Force-reloading on that
// first activation interrupted whatever the student was doing at that
// exact moment (e.g. mid login/register submit), which looked like the
// screen going blank and never proceeding.
//
// The fix: only treat it as a real update — and reload — if this page
// was ALREADY being served by a service worker when it loaded (i.e.
// there's something stale to actually replace). If the page loaded
// uncontrolled (first-ever visit, fresh install), the first activation
// is normal and must NOT trigger a reload.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });

  let hasReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || hasReloaded) return;
    hasReloaded = true;
    window.location.reload();
  });
}
