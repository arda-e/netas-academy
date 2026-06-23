import type { Core } from '@strapi/strapi';
import { BackendConfigManager } from '../src/config/env';

const config = (): Core.Config.Plugin => {
  const configManager = BackendConfigManager.process();

  return {
    upload: {
      config: configManager.getUploadConfig(),
    },
    email: {
      config: configManager.getEmailConfig(),
    },
    'csv-exporter': {
      enabled: true,
      config: {},
    },
    'internal-notifications': {
      enabled: true,
      resolve: './src/plugins/internal-notifications',
      config: {},
    },
    'iletisim-merkezi': {
      enabled: true,
      resolve: './src/plugins/iletisim-merkezi',
      config: {},
    },
  };
};

export default config;
