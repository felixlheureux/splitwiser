import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
}

// Standard service worker registration: caches new versions in background with ZERO mid-session reloads
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Proactively check for updates and refresh system theme color when returning to the app
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            void reg.update();
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
              metaTheme.setAttribute('content', '#ffffff');
            }
          }
        });
      })
      .catch(() => {
        // Ignore registration failures in private/restricted environments
      });
  });
}


