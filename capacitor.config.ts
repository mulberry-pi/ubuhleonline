import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2090c31f03dc4114920a895ef8ecd1a0',
  appName: 'ubuhle-final-project',
  webDir: 'dist',
  server: {
    url: 'https://2090c31f-03dc-4114-920a-895ef8ecd1a0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      // Request permissions on first use
      saveToGallery: false,
      // Allow users to choose their preference
      promptLabelHeader: 'Photo Access',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Choose from Gallery',
      promptLabelPicture: 'Take a Photo'
    }
  }
};

export default config;
