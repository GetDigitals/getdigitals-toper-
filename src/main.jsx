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
// Auto-refresh: our sw.js calls skipWaiting() + clients.claim() on every
// new deploy, which hands control to the new service worker immediately —
// but a tab that's ALREADY open (sitting on the old JS in memory, since
// this is a single-page app with no further page navigations) won't pick
// up new code on its own. The controllerchange listener below forces a
// one-time reload the moment that handover happens, so an old tab that
// was sitting on a stale "Payment Pending" (or any other stale state)
// gets the new build automatically instead of needing a manual refresh.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });

  let hasReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloaded) return;
    hasReloaded = true;
    window.location.reload();
  });
}
