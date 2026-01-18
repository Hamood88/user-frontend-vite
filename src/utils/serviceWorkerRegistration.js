/**
 * Service Worker Registration
 * Handles PWA setup for offline support and caching
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New service worker activated
                console.log('🔄 App updated. Refresh to see latest version');
                // Optional: Show toast to user about update
                if (window.__showUpdateNotification) {
                  window.__showUpdateNotification();
                }
              }
            });
          });
        })
        .catch(err => {
          console.warn('❌ Service Worker registration failed:', err);
        });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'NEW_CONTENT') {
          console.log('📦 New content available');
        }
      });
    });
  } else {
    console.log('⚠️ Service Workers not supported in this browser');
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
      console.log('Service Worker unregistered');
    });
  }
}
