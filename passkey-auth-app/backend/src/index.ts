import express from 'express';
import session from 'express-session';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import { initDatabase } from './utils/database';
import authRoutes from './routes/authRoutes';
import passkeyRoutes from './routes/passkeyRoutes';
import {
  backendLocalConfig,
  normalizeStringArray,
  resolveMaybeRelativePath,
} from './config/localConfig';

const app = express();
const portEnv = process.env.PORT ? Number(process.env.PORT) : undefined;
const PORT = portEnv || backendLocalConfig.port || 3000;

// データベース初期化
initDatabase();

// ミドルウェア設定
const corsOrigins = normalizeStringArray(
  process.env.CORS_ORIGINS ||
    process.env.ORIGIN ||
    backendLocalConfig.corsOrigins ||
    backendLocalConfig.origin
);
const sessionSecret =
  process.env.SESSION_SECRET ||
  backendLocalConfig.sessionSecret ||
  'your-secret-key-change-in-production';
const isSessionSecretConfigured = Boolean(
  process.env.SESSION_SECRET || backendLocalConfig.sessionSecret
);

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? corsOrigins
    : true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// アクセスログ
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });
  next();
});

// apple-app-site-association を動的に返す（実行環境のTeam IDに合わせる）
const appleTeamId =
  process.env.APPLE_TEAM_ID ||
  backendLocalConfig.appleTeamId ||
  'YOUR_TEAM_ID';
const appleBundleId =
  process.env.APPLE_BUNDLE_ID ||
  backendLocalConfig.appleBundleId ||
  'com.example.passkeyauthapp';
const appleAppId = `${appleTeamId}.${appleBundleId}`;
const appleAppSiteAssociation = {
  applinks: {},
  webcredentials: {
    apps: [appleAppId],
  },
  appclips: {},
};

const androidPackageName =
  process.env.ANDROID_PACKAGE_NAME ||
  backendLocalConfig.androidPackageName ||
  'com.example.passkeyauthapp';
const androidSha256Fingerprints = normalizeStringArray(
  process.env.ANDROID_SHA256_CERT_FINGERPRINTS ||
    process.env.ANDROID_SHA256_CERT_FINGERPRINT ||
    backendLocalConfig.androidSha256CertFingerprints
);

const androidAssetLinksRelations = [
  'delegate_permission/common.get_login_creds',
];
if (
  process.env.ANDROID_HANDLE_ALL_URLS === 'true' ||
  backendLocalConfig.androidHandleAllUrls === true
) {
  androidAssetLinksRelations.push('delegate_permission/common.handle_all_urls');
}

const androidAssetLinks = [
  {
    relation: androidAssetLinksRelations,
    target: {
      namespace: 'android_app',
      package_name: androidPackageName,
      sha256_cert_fingerprints: androidSha256Fingerprints,
    },
  },
];

const sendAppleAppSiteAssociation = (_req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(appleAppSiteAssociation));
};

app.get('/.well-known/apple-app-site-association', sendAppleAppSiteAssociation);
app.get('/apple-app-site-association', sendAppleAppSiteAssociation);
app.get('/.well-known/assetlinks.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(androidAssetLinks));
});

// 静的ファイル配信（apple-app-site-association用）
app.use(express.static('public'));

// セッション設定
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24時間
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/passkey', passkeyRoutes);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// サーバー起動（HTTPSを使用）
const certPath = resolveMaybeRelativePath(
  process.env.HTTPS_CERT_PATH || backendLocalConfig.https?.certPath
);
const keyPath = resolveMaybeRelativePath(
  process.env.HTTPS_KEY_PATH || backendLocalConfig.https?.keyPath
);
const httpsHost =
  process.env.HTTPS_HOSTNAME || backendLocalConfig.https?.hostname || 'localhost';
const rpId = process.env.RP_ID || backendLocalConfig.rpId || 'localhost';
const origin = process.env.ORIGIN || backendLocalConfig.origin || 'http://localhost:3000';

// 証明書ファイルの存在確認
if (certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🚀 HTTPS Server is running on https://${httpsHost}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Session secret is ${isSessionSecretConfigured ? 'configured' : 'using default (change in production!)'}`);
    console.log(`🔑 WebAuthn RP_ID: ${rpId}`);
    console.log(`🌐 WebAuthn ORIGIN: ${origin}`);
    console.log(`✅ SSL certificates loaded successfully`);
  });
} else {
  console.warn('⚠️  SSL certificates not found, falling back to HTTP');
  app.listen(PORT, () => {
    console.log(`🚀 HTTP Server is running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Session secret is ${isSessionSecretConfigured ? 'configured' : 'using default (change in production!)'}`);
    console.log(`🔑 WebAuthn RP_ID: ${rpId}`);
    console.log(`🌐 WebAuthn ORIGIN: ${origin}`);
  });
}
