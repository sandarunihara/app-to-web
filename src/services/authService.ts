/**
 * Auth Service API - Connects to External Auth Microservice
 * 
 * This service handles ALL authentication operations via the Auth Microservice.
 * The backend ONLY receives JWT tokens for validation.
 * 
 * CRITICAL RULES:
 * ✅ USE localStorage for token storage (Web replacement for SecureStore)
 * ✅ ATTACH JWT to all backend API calls
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { secureStorage } from '../utils/storage';

// Auth Service runs on port 8080 (or proxy)
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_URL || '/api/auth';

console.log('=== AUTH SERVICE INITIALIZED ===');
console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
        weight?: number;
        height?: number;
        address?: string;
        nationality?: string;
        avatar?: string;
        role: {
            name: string; // Should be "JENDO_USER"
            permissions: string[];
        };
    };
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

class AuthService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: AUTH_SERVICE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Login user via Auth Microservice
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await this.client.post<ApiResponse<AuthResponse>>('/login', {
                email,
                password,
            });

            console.log('=== LOGIN RESPONSE ===', response.data);
            
            const authData = response.data.data || response.data;

            if (!authData) {
                console.error('Empty auth response:', response.data);
                throw new Error('Empty authentication response from server');
            }

            // Validate user exists
            if (!authData.user) {
                console.error('Missing user in auth response:', authData);
                throw new Error('No user data in authentication response');
            }

            // Validate user role - only JENDO_USER, USER, and ADMIN can access
            const userRole = authData.user?.role?.name;
            const allowedRoles = ['JENDO_USER', 'USER', 'ADMIN'];

            if (!userRole || !allowedRoles.includes(userRole)) {
                throw new Error('Access denied. This account type is not authorized.');
            }

            // Store tokens
            await this.storeToken(authData.accessToken);
            await this.storeRefreshToken(authData.refreshToken);

            // Store user info in localStorage for easy access
            localStorage.setItem('user_info', JSON.stringify(authData.user));

            return authData;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Register new user via Auth Microservice
     */
    async register(payload: RegisterRequest): Promise<AuthResponse> {
        console.log('=== AUTH SERVICE REGISTER ===');

        try {
            const response = await this.client.post<ApiResponse<AuthResponse>>('/register', payload);

            console.log('=== REGISTER RESPONSE ===', response.data);

            const authData = response.data.data || response.data;

            if (!authData) {
                console.error('Empty register response:', response.data);
                throw new Error('Empty authentication response from server');
            }

            if (!authData.user) {
                console.error('Missing user in register response:', authData);
                throw new Error('No user data in registration response');
            }

            // Store tokens
            await this.storeToken(authData.accessToken);
            await this.storeRefreshToken(authData.refreshToken);

            localStorage.setItem('user_info', JSON.stringify(authData.user));

            return authData;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await secureStorage.deleteItem(TOKEN_KEY);
            await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem('user_info');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Login with Google (Adapting mobile flow if possible, or using standard web flow)
     * For now, preserving the method signature but it might need adjustment for Web Google Sign-In.
     * On Web, we usually get an ID token from the Google Button component.
     */
    async loginWithGoogle(idToken: string, clientId: string): Promise<AuthResponse> {
        // Note: Endpoint might be different for web if backend distinguishes
        // But user asked for EXACT same logic/calls.
        // The mobile endpoint is /mobile/google. Ideally backend has /google/callback or similar for web.
        // However, if we get an ID token on web, passing it to /mobile/google MIGHT work if the validation logic is same.
        // We will stick to the requested "exact same backend call".

        try {
            const response = await this.client.post<ApiResponse<AuthResponse>>('/mobile/google', {
                idToken,
                clientId,
            });

            console.log('=== GOOGLE LOGIN RESPONSE ===', response.data);

            const authData = response.data.data || response.data;

            if (!authData) {
                console.error('Empty Google auth response:', response.data);
                throw new Error('Empty authentication response from server');
            }

            if (!authData.user) {
                console.error('Missing user in Google auth response:', authData);
                throw new Error('No user data in Google authentication response');
            }

            // Validate user role
            const userRole = authData.user?.role?.name;
            const allowedRoles = ['JENDO_USER', 'USER', 'ADMIN'];

            if (!userRole || !allowedRoles.includes(userRole)) {
                throw new Error('Access denied. This account type is not authorized.');
            }

            await this.storeToken(authData.accessToken);
            await this.storeRefreshToken(authData.refreshToken);
            localStorage.setItem('user_info', JSON.stringify(authData.user));

            return authData;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Send verification OTP to email
     */
    async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.client.post('/send-otp', { email });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Verify OTP for email
     */
    async verifyOtp(email: string, otp: string): Promise<{ success: boolean; verified: boolean }> {
        try {
            const response = await this.client.post('/verify-otp', { email, otp });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Confirm registration after OTP verified (create user without issuing tokens)
     */
    async confirmSignup(payload: { email: string; password: string; firstName: string; lastName?: string; phone?: string }): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.client.post('/register/confirm', payload);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async getStoredToken(): Promise<string | null> {
        return await secureStorage.getItem(TOKEN_KEY);
    }

    async getStoredRefreshToken(): Promise<string | null> {
        return await secureStorage.getItem(REFRESH_TOKEN_KEY);
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.getStoredToken();
        return !!token;
    }

    async refreshToken(): Promise<AuthResponse> {
        try {
            const refreshToken = await this.getStoredRefreshToken();

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await this.client.post<ApiResponse<AuthResponse>>('/refresh', {
                refreshToken,
            });

            const authData = response.data.data;

            await this.storeToken(authData.accessToken);
            await this.storeRefreshToken(authData.refreshToken);

            return authData;
        } catch (error: any) {
            await this.logout();
            throw this.handleError(error);
        }
    }

    private async storeToken(token: string): Promise<void> {
        await secureStorage.setItem(TOKEN_KEY, token);
    }

    private async storeRefreshToken(token: string): Promise<void> {
        await secureStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    private handleError(error: any): Error {
        console.error('=== AUTH ERROR ===', error);
        
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || 'Authentication failed';
            console.error('Auth service responded with status:', status, 'message:', message);
            return new Error(message);
        } else if (error.request) {
            console.error('Auth service request made but no response:', error.request);
            return new Error('Network error - Auth Service unreachable');
        } else {
            console.error('Error setting up auth request:', error.message);
            return new Error(error.message || 'Unknown error occurred');
        }
    }
}

export const authService = new AuthService();
export type { LoginRequest, RegisterRequest, AuthResponse };
