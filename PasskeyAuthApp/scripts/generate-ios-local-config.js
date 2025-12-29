const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const configPath = path.resolve(__dirname, '..', '..', 'config', 'local.json');
const outputPath = path.resolve(__dirname, '..', 'ios', 'Config', 'Local.xcconfig');

const readConfig = () => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing config/local.json at ${configPath}`);
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw);
};

const resolveAssociatedDomain = (backend) => {
  if (backend.rpId) {
    return backend.rpId;
  }
  if (backend.origin) {
    try {
      const originHost = new URL(backend.origin).hostname;
      if (originHost) {
        return originHost;
      }
    } catch (_error) {
      return 'example.com';
    }
  }
  return 'example.com';
};

const writeConfig = (backend) => {
  const appBundleId =
    backend.iosBundleId || backend.appleBundleId || 'com.example.passkeyauthapp';
  const teamId = backend.appleTeamId || 'YOUR_TEAM_ID';
  const associatedDomain = resolveAssociatedDomain(backend);

  const lines = [
    `APP_BUNDLE_ID = ${appBundleId}`,
    `APPLE_TEAM_ID = ${teamId}`,
    `ASSOCIATED_DOMAIN = ${associatedDomain}`,
    `ATS_EXCEPTION_DOMAIN = ${associatedDomain}`,
  ];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
};

const data = readConfig() || {};
const backend = data.backend || {};
writeConfig(backend);
