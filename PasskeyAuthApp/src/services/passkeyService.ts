import {Passkey, PasskeyCreateRequest, PasskeyGetRequest} from 'react-native-passkey';
import api from './api';
import {translate, translateServerMessage} from '../localization';

/**
 * Start passkey registration.
 */
export async function registerPasskey(
  username: string,
): Promise<'registered' | 'skipped'> {
  try {
    // Fetch registration challenge from the backend.
    const { data: options } = await api.post('/api/passkey/register/start', {
      username,
    });

    console.log('Passkey registration options:', options);

    if (options?.alreadyRegistered) {
      return 'skipped';
    }

    // Build the passkey registration request.
    const request: PasskeyCreateRequest = {
      challenge: options.challenge,
      rp: options.rp,
      user: options.user,
      pubKeyCredParams: options.pubKeyCredParams,
      timeout: options.timeout,
      attestation: options.attestation || 'none',
      authenticatorSelection: options.authenticatorSelection,
      excludeCredentials: options.excludeCredentials || [],
    };

    console.log('Passkey create request:', JSON.stringify(request, null, 2));

    // Register using the platform authenticator (Face ID/Touch ID).
    const credential = await Passkey.createPlatformKey(request);

    console.log('Passkey registration credential:', credential);

    // Notify the backend that registration is complete.
    const { data: result } = await api.post('/api/passkey/register/finish', {
      username,
      credential,
    });

    console.log('Passkey registration result:', result);

    return result.verified ? 'registered' : 'skipped';
  } catch (error: any) {
    console.error('Passkey registration error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    
    // Handle user cancellation.
    if (error.message?.includes('cancel') || error.message?.includes('Cancel')) {
      throw new Error(translate('errorsPasskeyRegistrationCanceled'));
    }
    
    // Other errors.
    const serverMessage = translateServerMessage(error.response?.data?.error || '');
    const errorMessage =
      serverMessage || error.message || translate('errorsPasskeyRegistrationFailed');
    const formattedMessage = translate('errorsPasskeyRegistrationFailed');
    throw new Error(`${formattedMessage}: ${errorMessage}`);
  }
}

/**
 * Authenticate with a passkey.
 */
export async function authenticateWithPasskey(): Promise<{ username: string; authMethod: string }> {
  try {
    // Fetch authentication challenge from the backend.
    const { data: options } = await api.post('/api/passkey/login/start');

    console.log('Passkey authentication options:', options);

    // Build the passkey authentication request.
    const request: PasskeyGetRequest = {
      challenge: options.challenge,
      rpId: options.rpId,
      allowCredentials: options.allowCredentials || [],
      timeout: options.timeout,
      userVerification: options.userVerification || 'required',
    };

    // Authenticate using the platform authenticator (Face ID/Touch ID).
    const credential = await Passkey.getPlatformKey(request);

    console.log('Passkey authentication credential:', credential);

    // Notify the backend that authentication is complete.
    const { data: result } = await api.post('/api/passkey/login/finish', {
      credential,
    });

    console.log('Passkey authentication result:', result);

    if (!result.verified) {
      throw new Error(translate('errorsPasskeyVerificationFailed'));
    }

    return {
      username: result.user.username,
      authMethod: result.authMethod,
    };
  } catch (error: any) {
    console.error('Passkey authentication error:', error);
    
    // Handle user cancellation.
    if (error.message?.includes('cancel') || error.message?.includes('Cancel')) {
      throw new Error(translate('errorsPasskeyAuthenticationCanceled'));
    }
    
    // Other errors.
    const errorMessage = translateServerMessage(error.response?.data?.error || '');
    throw new Error(errorMessage || translate('errorsPasskeyAuthenticationFailed'));
  }
}

/**
 * Check whether passkeys are supported.
 */
export function isPasskeySupported(): boolean {
  try {
    return Passkey.isSupported();
  } catch (error) {
    console.error('Passkey support check error:', error);
    return false;
  }
}
