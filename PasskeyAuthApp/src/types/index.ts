export interface User {
  id: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  sessionId?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

export type AuthMethod = 'password' | 'passkey';

export interface AuthState {
  user: User | null;
  authMethod: AuthMethod | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
