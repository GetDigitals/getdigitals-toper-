import { Component } from 'react';

/**
 * We've had multiple reports (both on Netlify and now on Cloudflare
 * Workers, same code) of the screen going fully blank after Login/
 * Register with no visible error anywhere — which means something is
 * throwing during render and React's default behavior (no boundary =
 * unmount everything) is silently wiping the screen.
 *
 * This makes that crash VISIBLE instead of blank, so whoever hits it can
 * screenshot the actual error message and stack instead of just a black
 * screen — that's the only way to actually diagnose it from here on.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught render crash:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.error) {
      const { error, info } = this.state;
      const crashedUrl = window.location.href;
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0B0E14',
            color: '#F5E9D8',
            padding: '24px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: 1.5,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: '22px', marginBottom: '12px' }}>⚠️ App crashed</div>
          <p style={{ marginBottom: '8px', opacity: 0.8 }}>
            Ye screen isliye dikh rahi hai taaki ye pura error text screenshot leke bheja ja sake — pehle ye blank ho jaata tha.
          </p>
          <div
            style={{
              background: '#1a1f2b',
              border: '1px solid #4a90d955',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              wordBreak: 'break-all',
              color: '#7ec8ff',
              fontSize: '11px',
            }}
          >
            URL: {crashedUrl}
          </div>
          <div
            style={{
              background: '#1a1f2b',
              border: '1px solid #E8650A55',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '16px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#ff9d7a',
            }}
          >
            {String(error?.name || 'Error')}: {String(error?.message || error)}
          </div>
          {error?.stack && (
            <details style={{ marginBottom: '16px' }} open>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Stack trace</summary>
              <div
                style={{
                  background: '#1a1f2b',
                  borderRadius: '10px',
                  padding: '14px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '11px',
                  opacity: 0.85,
                }}
              >
                {error.stack}
              </div>
            </details>
          )}
          {info?.componentStack && (
            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Component stack</summary>
              <div
                style={{
                  background: '#1a1f2b',
                  borderRadius: '10px',
                  padding: '14px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '11px',
                  opacity: 0.85,
                }}
              >
                {info.componentStack}
              </div>
            </details>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1a1f2b',
                color: '#F5E9D8',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '12px 20px',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              Reload (same page)
            </button>
            <button
              onClick={() => {
                // A crash on a specific route reloading the SAME url will
                // just crash again in a loop — this jumps to a known-safe
                // screen (clears the hash route) so the app is actually
                // usable again instead of stuck.
                window.location.hash = '#/home';
                window.location.reload();
              }}
              style={{
                background: '#E8650A',
                color: '#0B0E14',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 20px',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              Go to Home (safe)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
