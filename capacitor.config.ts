import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pantrix.app',
  appName: 'Pantrix',
  webDir: 'build',
  
  // Server configuration (for development)
  server: {
    // For live reload during development
    // url: 'http://localhost:5173',
    // cleartext: true,
  },
  
  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    // Set to your preferred scheme
    scheme: 'Pantrix',
    // Background modes if needed
    // backgroundColor: '#ffffff',
  },
  
  // Plugins configuration
  plugins: {
    Camera: {
      // Customize camera behavior
    },
    SplashScreen: {
      launchShowDuration: 0, // Hide immediately - React animated splash will take over
      launchAutoHide: true,
      backgroundColor: '#FAFAFA', // Match app background
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#16a34a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
