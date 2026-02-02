// src/capacitor-init.js
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize Capacitor plugins for native feel
 */
export async function initializeCapacitor(navigate) {
  const isNative = Capacitor.isNativePlatform();
  
  if (!isNative) {
    console.log('Running in web browser');
    return;
  }

  console.log('Initializing Capacitor on:', Capacitor.getPlatform());

  // Hide splash screen after app loads
  try {
    await SplashScreen.hide();
  } catch (e) {
    console.warn('SplashScreen hide failed:', e);
  }

  // Configure status bar
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
  } catch (e) {
    console.warn('StatusBar config failed:', e);
  }

  // Handle deep links (Universal Links / App Links)
  CapApp.addListener('appUrlOpen', (event) => {
    console.log('Deep link opened:', event.url);
    
    // Extract path from URL
    // Example: https://moondala.one/r/ABC123
    const url = new URL(event.url);
    const path = url.pathname + url.search + url.hash;
    
    console.log('Navigating to:', path);
    
    if (navigate && path) {
      // Navigate to the path using React Router
      navigate(path, { replace: true });
    }
  });

  // Handle Android back button
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // At root - show exit confirmation
      if (window.confirm('Exit Moondala?')) {
        CapApp.exitApp();
      }
    }
  });

  // Handle app state changes
  CapApp.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Active:', isActive);
    
    if (isActive) {
      // App came to foreground
      // Optionally refresh data
    }
  });

  console.log('✅ Capacitor initialized successfully');
}

/**
 * Open external links in system browser
 */
export async function openExternalLink(url) {
  const isNative = Capacitor.isNativePlatform();
  
  if (!isNative) {
    // Web: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  // Native: use Browser plugin
  try {
    await Browser.open({ 
      url,
      presentationStyle: 'popover',
      toolbarColor: '#0a0a0f',
    });
  } catch (e) {
    console.error('Failed to open browser:', e);
    // Fallback
    window.open(url, '_blank');
  }
}

/**
 * Check if running on native platform
 */
export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform
 */
export function getPlatform() {
  return Capacitor.getPlatform();
}
