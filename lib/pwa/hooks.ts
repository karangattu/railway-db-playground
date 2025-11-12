/**
 * Hook to register and manage the service worker
 * Provides PWA functionality for offline support and caching
 */

'use client';

import { useEffect, useState } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          { scope: '/' }
        );

        console.log('[PWA] Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, show update notification
              console.log('[PWA] New version available. Refresh to update.');
              
              // Dispatch custom event for update notification
              window.dispatchEvent(
                new CustomEvent('service-worker-update', {
                  detail: { registration }
                })
              );
            }
          });
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Service Worker controller changed');
          // Page is now controlled by a new service worker
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    // Register service worker when page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', registerServiceWorker);
    };
  }, []);
}

/**
 * Hook to detect if app is installed
 */
export function useAppInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if running as installed app
    const isInstalledApp = 
      (window.navigator as any).standalone === true || // iOS
      window.matchMedia('(display-mode: standalone)').matches || // Android
      window.matchMedia('(display-mode: window-controls-overlay)').matches; // Windows

    setIsInstalled(isInstalledApp);

    // Listen for install event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] Install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return isInstalled;
}

/**
 * Request notification permission for PWA
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send a notification from the PWA
 */
export function sendNotification(title: string, options: NotificationOptions = {}) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options
      });
    } else {
      new Notification(title, options);
    }
  }
}

/**
 * Check if online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
