import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexfix.app',
  appName: 'NEXFIX',
  webDir: 'out',
  server: {
    url: 'https://nexfix-umber.vercel.app',
    cleartext: true,
    allowNavigation: ['nexfix-umber.vercel.app', '*.vercel.app'],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#20E3FF",
    },
  },
};

export default config;
