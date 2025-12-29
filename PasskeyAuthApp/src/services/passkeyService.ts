import { Passkey, PasskeyCreateRequest, PasskeyGetRequest } from 'react-native-passkey';
import api from './api';

/**
 * Passkey登録を開始
 */
export async function registerPasskey(
  username: string
): Promise<'registered' | 'skipped'> {
  try {
    // バックエンドから登録チャレンジを取得
    const { data: options } = await api.post('/api/passkey/register/start', {
      username,
    });

    console.log('Passkey registration options:', options);

    if (options?.alreadyRegistered) {
      return 'skipped';
    }

    // Passkey登録リクエストを作成
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

    // プラットフォーム認証器で登録（Face ID/Touch ID）
    const credential = await Passkey.createPlatformKey(request);

    console.log('Passkey registration credential:', credential);

    // バックエンドに登録完了を通知
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
    
    // ユーザーがキャンセルした場合
    if (error.message?.includes('cancel') || error.message?.includes('Cancel')) {
      throw new Error('Passkey登録がキャンセルされました');
    }
    
    // その他のエラー
    const errorMessage = error.message || error.response?.data?.error || 'Passkey登録に失敗しました';
    throw new Error(`Passkey登録エラー: ${errorMessage}`);
  }
}

/**
 * Passkeyで認証
 */
export async function authenticateWithPasskey(): Promise<{ username: string; authMethod: string }> {
  try {
    // バックエンドから認証チャレンジを取得
    const { data: options } = await api.post('/api/passkey/login/start');

    console.log('Passkey authentication options:', options);

    // Passkey認証リクエストを作成
    const request: PasskeyGetRequest = {
      challenge: options.challenge,
      rpId: options.rpId,
      allowCredentials: options.allowCredentials || [],
      timeout: options.timeout,
      userVerification: options.userVerification || 'required',
    };

    // プラットフォーム認証器で認証（Face ID/Touch ID）
    const credential = await Passkey.getPlatformKey(request);

    console.log('Passkey authentication credential:', credential);

    // バックエンドに認証完了を通知
    const { data: result } = await api.post('/api/passkey/login/finish', {
      credential,
    });

    console.log('Passkey authentication result:', result);

    if (!result.verified) {
      throw new Error('Passkey認証の検証に失敗しました');
    }

    return {
      username: result.user.username,
      authMethod: result.authMethod,
    };
  } catch (error: any) {
    console.error('Passkey authentication error:', error);
    
    // ユーザーがキャンセルした場合
    if (error.message?.includes('cancel') || error.message?.includes('Cancel')) {
      throw new Error('Passkey認証がキャンセルされました');
    }
    
    // その他のエラー
    throw new Error(error.response?.data?.error || 'Passkey認証に失敗しました');
  }
}

/**
 * Passkeyがサポートされているか確認
 */
export function isPasskeySupported(): boolean {
  try {
    return Passkey.isSupported();
  } catch (error) {
    console.error('Passkey support check error:', error);
    return false;
  }
}
