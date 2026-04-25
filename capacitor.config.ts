import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coin.app',
  appName: 'coin',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#F5F2EC',
  },
};

export default config;
