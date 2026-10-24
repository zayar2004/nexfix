import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexfix.app',
  appName: 'NEXFIX',
  webDir: 'out',
  server: {
    url: 'https://nexfix-umber.vercel.app',
    cleartext: true,
    allowNavigation: ['nexfix-umber.vercel.app'],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
