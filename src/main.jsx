import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

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
