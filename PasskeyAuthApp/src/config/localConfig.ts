type MobileConfig = {
  apiBaseUrl?: string;
};

type BackendConfig = {
  port?: number;
  sessionSecret?: string;
  origin?: string;
  corsOrigins?: string[] | string;
  rpId?: string;
  rpName?: string;
  appleTeamId?: string;
  appleBundleId?: string;
  iosBundleId?: string;
  androidPackageName?: string;
  androidSha256CertFingerprints?: string[] | string;
  androidApkKeyHashes?: string[] | string;
  androidHandleAllUrls?: boolean;
  https?: {
    certPath?: string;
    keyPath?: string;
    hostname?: string;
  };
};

type LocalConfig = {
  mobile?: MobileConfig;
  backend?: BackendConfig;
};

// local.json is gitignored and stores environment-specific settings.
const localConfig = require('config/local.json') as LocalConfig;

export const getMobileConfig = () => ({
  apiBaseUrl: localConfig.mobile?.apiBaseUrl ?? 'http://localhost:3000',
});

export const getBackendConfig = () => localConfig.backend ?? {};
