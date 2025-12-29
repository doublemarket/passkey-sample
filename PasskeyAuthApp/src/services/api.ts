import axios from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  SessionResponse,
} from '../types';
import { getMobileConfig } from '../config/localConfig';

const { apiBaseUrl } = getMobileConfig();

// バックエンドのURLを設定
// 開発環境: iOSシミュレータはlocalhost、Android EmulatorはIP 10.0.2.2
// 実機の場合はMacのホスト名.localを使用 (mDNS)
export const API_BASE_URL = apiBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // セッションCookie用
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  // ユーザー登録
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('ネットワークエラーが発生しました');
    }
  },

  // ログイン
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('ネットワークエラーが発生しました');
    }
  },

  // ログアウト
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('ログアウトに失敗しました');
    }
  },

  // セッション確認
  checkSession: async (): Promise<SessionResponse> => {
    try {
      const response = await api.get<SessionResponse>('/api/auth/session');
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  },
};

export const passkeyApi = {
  // Passkey登録開始
  registerStart: async (username: string): Promise<any> => {
    try {
      const response = await api.post('/api/passkey/register/start', {
        username,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Passkey登録開始に失敗しました');
      }
      throw new Error('ネットワークエラーが発生しました');
    }
  },

  // Passkey登録完了
  registerFinish: async (username: string, credential: any): Promise<any> => {
    try {
      const response = await api.post('/api/passkey/register/finish', {
        username,
        credential,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Passkey登録完了に失敗しました');
      }
      throw new Error('ネットワークエラーが発生しました');
    }
  },

  // Passkeyログイン開始
  loginStart: async (): Promise<any> => {
    try {
      const response = await api.post('/api/passkey/login/start');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Passkeyログイン開始に失敗しました');
      }
      throw new Error('ネットワークエラーが発生しました');
    }
  },

  // Passkeyログイン完了
  loginFinish: async (credential: any): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/api/passkey/login/finish',
        { credential }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('ネットワークエラーが発生しました');
    }
  },
};

export default api;
