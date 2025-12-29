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

// WebAuthn configuration
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
 * Start passkey registration.
 * POST /api/passkey/register/start
 */
export async function registerStart(req: Request, res: Response) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    // Ensure the user exists.
    const user = getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Fetch existing passkeys.
    const existingPasskeys = getPasskeysByUserId(user.id);
    if (existingPasskeys.length > 0) {
      return res.json({
        alreadyRegistered: true,
        message: 'Passkey is already registered.',
      });
    }
    const excludeCredentials = existingPasskeys.map((passkey) => ({
      id: isoBase64URL.toBuffer(passkey.credential_id),
      type: 'public-key' as const,
      transports: passkey.transports 
        ? JSON.parse(passkey.transports) 
        : undefined,
    }));

    // Generate registration options.
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
        authenticatorAttachment: 'platform', // Platform authenticators (Face ID/Touch ID)
        requireResidentKey: false, // Relaxed for development
        residentKey: 'preferred', // Changed from required
        userVerification: 'required',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    };

    const registrationOptions = await generateRegistrationOptions(options);

    // Store the challenge.
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
    res.status(500).json({ error: 'Failed to start passkey registration.' });
  }
}

/**
 * Finish passkey registration.
 * POST /api/passkey/register/finish
 */
export async function registerFinish(req: Request, res: Response) {
  try {
    console.log('=== Register Finish Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { username, credential } = req.body;

    if (!username || !credential) {
      console.error('Missing username or credential');
      return res.status(400).json({ error: 'Username and credential are required.' });
    }

    // Ensure the user exists.
    const user = getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Retrieve the stored challenge.
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
      return res.status(400).json({ error: 'Invalid challenge.' });
    }

    // Verification options.
    // Allow origins for both the mobile app and web.
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

    // Verify the response.
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
        error: 'Failed to verify credential.',
        details: verifyError.message 
      });
    }

    if (!verification.verified || !verification.registrationInfo) {
      console.error('Verification failed:', verification);
      return res.status(400).json({ error: 'Failed to verify credential.' });
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    // Save the passkey in the database.
    const credentialIdBase64 = isoBase64URL.fromBuffer(credentialID);
    const publicKeyBase64 = Buffer.from(credentialPublicKey).toString('base64');

    createPasskey({
      userId: user.id,
      credentialId: credentialIdBase64,
      publicKey: publicKeyBase64,
      counter: counter,
      transports: registrationResponse.response.transports,
    });

    // Delete the challenge.
    deleteChallengeByValue(expectedChallenge.challenge);

    // Store in session.
    req.session.userId = user.id;
    req.session.authMethod = 'passkey';

    res.json({
      verified: true,
      message: 'Passkey registration completed.',
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Register finish error:', error);
    res.status(500).json({ error: 'Failed to finish passkey registration.' });
  }
}

/**
 * Start passkey login.
 * POST /api/passkey/login/start
 */
export async function loginStart(req: Request, res: Response) {
  try {
    // Usernameless authentication (no username required).
    const options: GenerateAuthenticationOptionsOpts = {
      rpID,
      timeout: 60000,
      userVerification: 'required',
      // Allow usernameless auth by leaving allowCredentials empty.
    };

    const authenticationOptions = await generateAuthenticationOptions(options);

    // Store the challenge (user_id is null for usernameless).
    createChallenge({
      challenge: authenticationOptions.challenge,
      type: 'authentication',
      expiresInMinutes: 5,
    });

    res.json(authenticationOptions);
  } catch (error) {
    console.error('Login start error:', error);
    res.status(500).json({ error: 'Failed to start passkey login.' });
  }
}

/**
 * Finish passkey login.
 * POST /api/passkey/login/finish
 */
export async function loginFinish(req: Request, res: Response) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Credential is required.' });
    }

    const authenticationResponse: AuthenticationResponseJSON = credential;

    // Retrieve the passkey by credentialId.
    const credentialIdBase64 = authenticationResponse.id;
    const passkey = getPasskeyByCredentialId(credentialIdBase64);

    if (!passkey) {
      return res.status(404).json({ error: 'Passkey not found.' });
    }

    // Retrieve the user.
    const user = getUserById(passkey.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Retrieve the stored challenge.
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
      return res.status(400).json({ error: 'Invalid challenge.' });
    }

    // Verification options.
    // Allow origins for both the mobile app and web.
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

    // Verify the response.
    const verification = await verifyAuthenticationResponse(opts);

    if (!verification.verified) {
      return res.status(400).json({ error: 'Failed to verify authentication.' });
    }

    // Update the counter.
    updatePasskeyCounter(passkey.credential_id, verification.authenticationInfo.newCounter);

    // Delete the challenge.
    deleteChallengeByValue(expectedChallenge.challenge);

    // Store in session.
    req.session.userId = user.id;
    req.session.authMethod = 'passkey';

    res.json({
      verified: true,
      message: 'Passkey login succeeded.',
      user: {
        id: user.id,
        username: user.username,
      },
      authMethod: 'passkey',
    });
  } catch (error) {
    console.error('Login finish error:', error);
    res.status(500).json({ error: 'Failed to finish passkey login.' });
  }
}
