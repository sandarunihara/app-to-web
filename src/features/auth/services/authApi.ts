import type {  UserProfile, LoginCredentials, SignupData, OTPVerification, PasswordResetRequest, AuthResponse, ResetPasswordData, ChangePasswordData, GoogleAuthData } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';
import { authService } from '../../../services/authService';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/password-reset/request-otp',
  RESET_PASSWORD: '/auth/password-reset/confirm-otp',
  CHANGE_PASSWORD: '/users/change-password',
  ME: '/users/me',
  LOGOUT: '/auth/logout',
  GOOGLE: '/auth/google',
  REFRESH_TOKEN: '/auth/refresh',
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await authService.login(credentials.email, credentials.password) as any;
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      tokenType: res.tokenType,
      expiresIn: res.expiresIn,
      user: res.user,
    } as AuthResponse;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const res = await authService.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    }) as any;
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      tokenType: res.tokenType,
      expiresIn: res.expiresIn,
      user: res.user,
    } as AuthResponse;
  },

  sendOtp: async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    return await authService.sendOtp(data.email);
  },

  verifyOtp: async (data: OTPVerification): Promise<{ success: boolean; verified: boolean }> => {
    return await authService.verifyOtp(data.email, data.otp);
  },

  confirmSignup: async (data: SignupData): Promise<{ success: boolean; message: string }> => {
    return await authService.confirmSignup(data as any);
  },

  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await backendApi.post<ApiResponse<void>>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
      const success = (res as any)?.success ?? true;
      const message = (res as any)?.message ?? 'If an account exists, a reset code has been sent.';
      return { success, message };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to request password reset');
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await backendApi.post<ApiResponse<void>>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      const success = (res as any)?.success ?? true;
      const message = (res as any)?.message ?? 'Password reset successful';
      return { success, message };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await backendApi.post<ApiResponse<{ success: boolean }>>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
      if (!res) {
        return { success: true, message: 'Password changed successfully' };
      }
      const payload = (res as any).data ?? res;
      const success = payload?.success ?? true;
      const message = (res as any).message ?? 'Password changed successfully';
      return { success, message };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const res = await backendApi.get<ApiResponse<any>>(AUTH_ENDPOINTS.ME);
      return {
        accessToken: '',
        tokenType: 'Bearer',
        user: res.data || res,
      } as AuthResponse;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch current user');
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const res = await backendApi.put<ApiResponse<UserProfile>>('/users/profile', data);
      return res.data || res;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  logout: async (): Promise<void> => {
    try {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('refreshToken');
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loginWithGoogle: async (data: GoogleAuthData): Promise<AuthResponse> => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'WEB-CLIENT-ID';
      const res = await authService.loginWithGoogle(data.idToken, clientId) as any;
      return {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        tokenType: res.tokenType,
        expiresIn: res.expiresIn,
        user: res.user,
      } as AuthResponse;
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const res = await authService.refreshToken() as any;
      return {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        tokenType: res.tokenType,
        expiresIn: res.expiresIn,
        user: res.user,
      } as AuthResponse;
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  },

  getStoredToken: async (): Promise<string | null> => {
    return await authService.getStoredToken();
  },

  isAuthenticated: async (): Promise<boolean> => {
    return await authService.isAuthenticated();
  },
};
