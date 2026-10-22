import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexfix.app',
  appName: 'NEXFIX',
  webDir: 'out',
  server: {
    url: 'https://nexfix-umber.vercel.app',
    cleartext: false,
  },
};

export default config;
