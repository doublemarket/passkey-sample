import React, {createContext, useContext, useState, useEffect} from 'react';
import {AuthState, User, AuthMethod, LoginRequest, RegisterRequest} from '../types';
import {authApi} from '../services/api';
import {authenticateWithPasskey} from '../services/passkeyService';
import {translateServerMessage, useTranslation} from '../localization';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<{success: boolean; message: string}>;
  loginWithPasskey: () => Promise<{
    success: boolean;
    message: string;
    user?: User;
  }>;
  register: (data: RegisterRequest) => Promise<{success: boolean; message: string}>;
  logout: () => Promise<void>;
  setAuthMethod: (method: AuthMethod) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    authMethod: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check the session on app launch.
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await authApi.checkSession();
      if (response.authenticated && response.user) {
        setAuthState({
          user: response.user,
          authMethod: 'password', // Assume password auth when restored from session.
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Session check error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const login = async (
    data: LoginRequest,
  ): Promise<{success: boolean; message: string}> => {
    try {
      const response = await authApi.login(data);
      if (response.success && response.user) {
        setAuthState({
          user: response.user,
          authMethod: 'password',
          isAuthenticated: true,
          isLoading: false,
        });
      return {success: true, message: response.message};
    }
      const message = response.message
        ? translateServerMessage(response.message)
        : t('errorsLoginFailed');
      return {success: false, message};
    } catch (error: any) {
      return {
        success: false,
        message: error.message || t('errorsLoginFailed'),
      };
    }
  };

  const loginWithPasskey = async (): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> => {
    try {
      const result = await authenticateWithPasskey();
      const session = await authApi.checkSession();
      if (session.authenticated && session.user) {
        setAuthState({
          user: session.user,
          authMethod: result.authMethod,
          isAuthenticated: true,
          isLoading: false,
        });
        return {
          success: true,
          message: t('serverPasskeyLoginSuccess'),
          user: session.user,
        };
      }
      return {
        success: false,
        message: t('errorsSessionUnavailable'),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || t('errorsPasskeyAuthenticationFailed'),
      };
    }
  };

  const register = async (
    data: RegisterRequest,
  ): Promise<{success: boolean; message: string}> => {
    try {
      const response = await authApi.register(data);
      if (response.success) {
        return {success: true, message: response.message};
      }
      const message = response.message
        ? translateServerMessage(response.message)
        : t('errorsRegisterFailed');
      return {success: false, message};
    } catch (error: any) {
      return {
        success: false,
        message: error.message || t('errorsRegisterFailed'),
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setAuthState({
        user: null,
        authMethod: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails.
      setAuthState({
        user: null,
        authMethod: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const setAuthMethod = (method: AuthMethod) => {
    setAuthState(prev => ({
      ...prev,
      authMethod: method,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithPasskey,
        register,
        logout,
        setAuthMethod,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
