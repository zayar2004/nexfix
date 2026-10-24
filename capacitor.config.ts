import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexfix.app',
  appName: 'NEXFIX',
  webDir: 'out',
  // server.url ကို ဖျက်လိုက်ပါ (Local Mode ဖြစ်သွားမယ်)
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#20E3FF",
    },
  },
};

export default config;
