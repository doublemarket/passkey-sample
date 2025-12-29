import fs from 'fs';
import path from 'path';

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
  mobile?: {
    apiBaseUrl?: string;
  };
  backend?: BackendConfig;
};

const defaultLocalConfigPath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'config',
  'local.json'
);

export const localConfigPath =
  process.env.LOCAL_CONFIG_PATH || defaultLocalConfigPath;

const loadLocalConfig = (): LocalConfig => {
  if (!fs.existsSync(localConfigPath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(localConfigPath, 'utf8');
    return JSON.parse(raw) as LocalConfig;
  } catch (error) {
    console.warn('Failed to read local config:', error);
    return {};
  }
};

export const localConfig = loadLocalConfig();
export const backendLocalConfig: BackendConfig = localConfig.backend ?? {};

export const normalizeStringArray = (
  value?: string[] | string
): string[] => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(item => item.trim()).filter(Boolean);
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export const resolveMaybeRelativePath = (
  filePath?: string
): string | undefined => {
  if (!filePath) {
    return undefined;
  }
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(process.cwd(), filePath);
};
