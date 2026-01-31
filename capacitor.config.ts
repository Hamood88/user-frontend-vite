import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moondala.app',
  appName: 'Moondala',
  webDir: 'dist',
  server: {
    // Allow Capacitor to handle all navigation
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a0a0f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0f",
    },
    App: {
      handleApplicationURLOpen: true,
    },
    Browser: {
      // Open external links in system browser
      presentationStyle: 'popover',
    },
  },
};

export default config;
