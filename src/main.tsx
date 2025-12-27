import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// CRITICAL: Ensure React is available globally IMMEDIATELY
// This must happen before any vendor code tries to use React.useState or React.forwardRef
// Libraries like recharts and lucide-react may access React from the global scope
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  (window as any).__REACT_LOADED__ = true;
  
  // Also ensure React is available as a global for CommonJS modules
  if (typeof global !== 'undefined') {
    (global as any).React = React;
  }
  
  // For Node.js-like environments
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).React = React;
  }
  
  console.log('✅ React made available globally');
}

// Error boundary for catching rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #000, #1a1a1a)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#F59E0B',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap app in error boundary and render
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🚀 Starting application...');
console.log('React version:', React.version);
console.log('Root element found:', rootElement);

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <div>
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #F59E0B;">Failed to load application</h1>
        <p style="color: #999; margin-bottom: 20px; font-size: 14px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #F59E0B; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">
          Reload Page
        </button>
        <p style="color: #666; margin-top: 20px; font-size: 12px;">Check browser console (F12) for details</p>
      </div>
    </div>
  `;
}

