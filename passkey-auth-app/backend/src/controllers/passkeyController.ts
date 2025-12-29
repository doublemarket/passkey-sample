import { Request, Response } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { getUserByUsername, getUserById } from '../models/User';
import {
  createPasskey,
  getPasskeyByCredentialId,
  getPasskeysByUserId,
  updatePasskeyCounter,
} from '../models/Passkey';
import {
  createChallenge,
  getValidChallenge,
  deleteChallengeByValue,
  cleanupUserChallenges,
} from '../models/Challenge';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';
import {
  backendLocalConfig,
  normalizeStringArray,
} from '../config/localConfig';

// WebAuthn設定
const rpName =
  process.env.RP_NAME || backendLocalConfig.rpName || 'Passkey Auth App';
const rpID = process.env.RP_ID || backendLocalConfig.rpId || 'localhost';
const origin =
  process.env.ORIGIN || backendLocalConfig.origin || 'http://localhost:3000';
const iosBundleId =
  process.env.IOS_BUNDLE_ID ||
  process.env.APPLE_BUNDLE_ID ||
  backendLocalConfig.iosBundleId ||
  backendLocalConfig.appleBundleId ||
  'com.example.passkeyauthapp';
const androidApkKeyHashesEnv =
  process.env.ANDROID_APK_KEY_HASHES ||
  process.env.ANDROID_APK_KEY_HASH ||
  backendLocalConfig.androidApkKeyHashes;
const androidSha256FingerprintsEnv =
  process.env.ANDROID_SHA256_CERT_FINGERPRINTS ||
  process.env.ANDROID_SHA256_CERT_FINGERPRINT ||
  backendLocalConfig.androidSha256CertFingerprints;

const sha256FingerprintToBase64Url = (fingerprint: string): string | null => {
  const hex = fingerprint.replace(/:/g, '').toLowerCase();
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/.test(hex)) {
    return null;
  }
  return isoBase64URL.fromBuffer(Buffer.from(hex, 'hex'));
};

const androidApkKeyHashes = [
  ...normalizeStringArray(androidApkKeyHashesEnv),
  ...normalizeStringArray(androidSha256FingerprintsEnv)
    .map(sha256FingerprintToBase64Url)
    .filter((value): value is string => Boolean(value)),
].filter(Boolean);

/**
 * Passkey登録開始
 * POST /api/passkey/register/start
 */
export async function registerStart(req: Request, res: Response) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'ユーザー名が必要です' });
    }

    // ユーザーの存在確認
    const user = getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // 既存のPasskeyを取得
    const existingPasskeys = getPasskeysByUserId(user.id);
    if (existingPasskeys.length > 0) {
      return res.json({
        alreadyRegistered: true,
        message: 'Passkeyは既に登録されています',
      });
    }
    const excludeCredentials = existingPasskeys.map((passkey) => ({
      id: isoBase64URL.toBuffer(passkey.credential_id),
      type: 'public-key' as const,
      transports: passkey.transports 
        ? JSON.parse(passkey.transports) 
        : undefined,
    }));

    // 登録オプション生成
    const options: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID: user.id,
      userName: user.username,
      userDisplayName: user.username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // プラットフォーム認証器（Face ID/Touch ID）
        requireResidentKey: false, // 開発環境用に緩和
        residentKey: 'preferred', // requiredから変更
        userVerification: 'required',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    };

    const registrationOptions = await generateRegistrationOptions(options);

    // チャレンジを保存
    cleanupUserChallenges(user.id, 'registration');
    createChallenge({
      challenge: registrationOptions.challenge,
      userId: user.id,
      type: 'registration',
      expiresInMinutes: 5,
    });

    console.log('Generated registration options:', JSON.stringify({
      challenge: registrationOptions.challenge,
      rp: registrationOptions.rp,
      user: registrationOptions.user,
      pubKeyCredParams: registrationOptions.pubKeyCredParams,
      authenticatorSelection: registrationOptions.authenticatorSelection,
    }, null, 2));

    res.json(registrationOptions);
  } catch (error) {
    console.error('Register start error:', error);
    res.status(500).json({ error: '登録開始に失敗しました' });
  }
}

/**
 * Passkey登録完了
 * POST /api/passkey/register/finish
 */
export async function registerFinish(req: Request, res: Response) {
  try {
    console.log('=== Register Finish Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { username, credential } = req.body;

    if (!username || !credential) {
      console.error('Missing username or credential');
      return res.status(400).json({ error: 'ユーザー名と認証情報が必要です' });
    }

    // ユーザーの存在確認
    const user = getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // 保存されたチャレンジを取得
    const registrationResponse: RegistrationResponseJSON = credential;
    const clientDataJSON = isoBase64URL.toBuffer(
      registrationResponse.response.clientDataJSON
    );
    const clientData = JSON.parse(Buffer.from(clientDataJSON).toString('utf8'));
    const expectedChallenge = getValidChallenge(
      clientData.challenge || '',
      'registration'
    );

    if (!expectedChallenge || expectedChallenge.user_id !== user.id) {
      return res.status(400).json({ error: '無効なチャレンジです' });
    }

    // 検証オプション
    // モバイルアプリとウェブの両方のoriginを許可
    const allowedOrigins = [
      origin,
      `https://${rpID}`,
      `ios:bundle-id:${iosBundleId}`,
      ...androidApkKeyHashes.map(hash => `android:apk-key-hash:${hash}`),
    ];
    
    const opts: VerifyRegistrationResponseOpts = {
      response: registrationResponse,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: allowedOrigins,
      expectedRPID: rpID,
      requireUserVerification: true,
    };

    // レスポンスを検証
    let verification;
    try {
      verification = await verifyRegistrationResponse(opts);
    } catch (verifyError: any) {
      console.error('Verification error details:', {
        message: verifyError.message,
        stack: verifyError.stack,
        credential: JSON.stringify(registrationResponse, null, 2),
      });
      return res.status(400).json({ 
        error: '認証情報の検証に失敗しました',
        details: verifyError.message 
      });
    }

    if (!verification.verified || !verification.registrationInfo) {
      console.error('Verification failed:', verification);
      return res.status(400).json({ error: '認証情報の検証に失敗しました' });
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    // Passkeyをデータベースに保存
    const credentialIdBase64 = isoBase64URL.fromBuffer(credentialID);
    const publicKeyBase64 = Buffer.from(credentialPublicKey).toString('base64');

    createPasskey({
      userId: user.id,
      credentialId: credentialIdBase64,
      publicKey: publicKeyBase64,
      counter: counter,
      transports: registrationResponse.response.transports,
    });

    // チャレンジを削除
    deleteChallengeByValue(expectedChallenge.challenge);

    // セッションに保存
    req.session.userId = user.id;
    req.session.authMethod = 'passkey';

    res.json({
      verified: true,
      message: 'Passkeyの登録が完了しました',
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Register finish error:', error);
    res.status(500).json({ error: '登録完了に失敗しました' });
  }
}

/**
 * Passkeyログイン開始
 * POST /api/passkey/login/start
 */
export async function loginStart(req: Request, res: Response) {
  try {
    // usernameless認証（ユーザー名不要）
    const options: GenerateAuthenticationOptionsOpts = {
      rpID,
      timeout: 60000,
      userVerification: 'required',
      // allowCredentialsを空にしてusernameless認証を有効化
    };

    const authenticationOptions = await generateAuthenticationOptions(options);

    // チャレンジを保存（user_idはnullでusernameless）
    createChallenge({
      challenge: authenticationOptions.challenge,
      type: 'authentication',
      expiresInMinutes: 5,
    });

    res.json(authenticationOptions);
  } catch (error) {
    console.error('Login start error:', error);
    res.status(500).json({ error: 'ログイン開始に失敗しました' });
  }
}

/**
 * Passkeyログイン完了
 * POST /api/passkey/login/finish
 */
export async function loginFinish(req: Request, res: Response) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: '認証情報が必要です' });
    }

    const authenticationResponse: AuthenticationResponseJSON = credential;

    // credentialIdからPasskeyを取得
    const credentialIdBase64 = authenticationResponse.id;
    const passkey = getPasskeyByCredentialId(credentialIdBase64);

    if (!passkey) {
      return res.status(404).json({ error: 'Passkeyが見つかりません' });
    }

    // ユーザーを取得
    const user = getUserById(passkey.user_id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // 保存されたチャレンジを取得
    const authClientDataJSON = isoBase64URL.toBuffer(
      authenticationResponse.response.clientDataJSON
    );
    const authClientData = JSON.parse(
      Buffer.from(authClientDataJSON).toString('utf8')
    );
    const expectedChallenge = getValidChallenge(
      authClientData.challenge,
      'authentication'
    );

    if (!expectedChallenge) {
      return res.status(400).json({ error: '無効なチャレンジです' });
    }

    // 検証オプション
    // モバイルアプリとウェブの両方のoriginを許可
    const allowedOrigins = [
      origin,
      `https://${rpID}`,
      `ios:bundle-id:${iosBundleId}`,
      ...androidApkKeyHashes.map(hash => `android:apk-key-hash:${hash}`),
    ];
    
    const publicKeyBuffer = Buffer.from(passkey.public_key, 'base64');
    const opts: VerifyAuthenticationResponseOpts = {
      response: authenticationResponse,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: allowedOrigins,
      expectedRPID: rpID,
      authenticator: {
        credentialID: isoBase64URL.toBuffer(passkey.credential_id),
        credentialPublicKey: new Uint8Array(publicKeyBuffer),
        counter: passkey.counter,
        transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
      },
      requireUserVerification: true,
    };

    // レスポンスを検証
    const verification = await verifyAuthenticationResponse(opts);

    if (!verification.verified) {
      return res.status(400).json({ error: '認証の検証に失敗しました' });
    }

    // カウンターを更新
    updatePasskeyCounter(passkey.credential_id, verification.authenticationInfo.newCounter);

    // チャレンジを削除
    deleteChallengeByValue(expectedChallenge.challenge);

    // セッションに保存
    req.session.userId = user.id;
    req.session.authMethod = 'passkey';

    res.json({
      verified: true,
      message: 'Passkeyログインに成功しました',
      user: {
        id: user.id,
        username: user.username,
      },
      authMethod: 'passkey',
    });
  } catch (error) {
    console.error('Login finish error:', error);
    res.status(500).json({ error: 'ログイン完了に失敗しました' });
  }
}
