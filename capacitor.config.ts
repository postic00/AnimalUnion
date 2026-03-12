import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.postic.animalunion',
  appName: '동물노동조합',
  webDir: 'dist',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-1253913975799895~7503847506',
    },
  },
};

export default config;
