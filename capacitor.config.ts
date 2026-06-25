import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kpnpamerica.shop',
  appName: 'KPNP USA',
  webDir: 'dist',
  server: {
    url: 'https://94e841a5-2ba2-4833-ad3c-077e789bf5d9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
