import axios from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  SessionResponse,
} from '../types';
import { getMobileConfig } from '../config/localConfig';
import {translate} from '../localization';

const { apiBaseUrl } = getMobileConfig();

// Backend URL configuration:
// - iOS simulator uses localhost
// - Android emulator uses 10.0.2.2
// - Physical devices use your host's .local name (mDNS)
export const API_BASE_URL = apiBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(translate('errorsNetwork'));
    }
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(translate('errorsNetwork'));
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(translate('errorsLogoutFailed'));
    }
  },

  // Check session
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
  // Start passkey registration
  registerStart: async (username: string): Promise<any> => {
    try {
      const response = await api.post('/api/passkey/register/start', {
        username,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          error.response.data.message ||
            translate('errorsPasskeyRegisterStartFailed'),
        );
      }
      throw new Error(translate('errorsNetwork'));
    }
  },

  // Finish passkey registration
  registerFinish: async (username: string, credential: any): Promise<any> => {
    try {
      const response = await api.post('/api/passkey/register/finish', {
        username,
        credential,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          error.response.data.message ||
            translate('errorsPasskeyRegisterFinishFailed'),
        );
      }
      throw new Error(translate('errorsNetwork'));
    }
  },

  // Start passkey login
  loginStart: async (): Promise<any> => {
    try {
      const response = await api.post('/api/passkey/login/start');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          error.response.data.message ||
            translate('errorsPasskeyLoginStartFailed'),
        );
      }
      throw new Error(translate('errorsNetwork'));
    }
  },

  // Finish passkey login
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
      throw new Error(translate('errorsNetwork'));
    }
  },
};

export default api;
