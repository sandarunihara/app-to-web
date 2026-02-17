import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { profileApi } from '../features/profile/services/profileApi';
import type { AuthResponse } from '../services/authService';
import type { UserProfile } from '../types/models';

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    login: (data: AuthResponse) => Promise<void>;
    loginWithGoogle: (data: { idToken: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start as true - checking session

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = await authService.getStoredToken();

                if (token) {
                    // Fetch user profile from backend
                    try {
                        const profile = await profileApi.getProfile();
                        setUser(profile);
                        localStorage.setItem('user_profile', JSON.stringify(profile));
                    } catch (profileError: any) {
                        // If 401, try to refresh token
                        if (profileError?.response?.status === 401) {
                            try {
                                await authService.refreshToken();
                                const profile = await profileApi.getProfile();
                                setUser(profile);
                                localStorage.setItem('user_profile', JSON.stringify(profile));
                            } catch (refreshError) {
                                console.error('Token refresh failed:', refreshError);
                                await authService.logout();
                                setUser(null);
                            }
                        } else {
                            console.error('Failed to fetch profile:', profileError);
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Session restoration failed:', error);
                await authService.logout();
                setUser(null);
            } finally {
                setIsLoading(false); // Done checking session
            }
        };

        checkSession();
    }, []);

    const refreshUser = async () => {
        try {
            const profile = await profileApi.getProfile();
            setUser(profile);
            localStorage.setItem('user_profile', JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    };

    const login = async (data: AuthResponse) => {
        if (!data || !data.user) {
            console.error('Invalid login data received:', data);
            throw new Error('Invalid authentication response: missing user data');
        }

        // Set initial user data from login response
        const userWithDefaults = {
            ...data.user,
            phone: data.user.phone || '',
            createdAt: (data.user as any).createdAt || new Date().toISOString(),
            updatedAt: (data.user as any).updatedAt || new Date().toISOString(),
        } as UserProfile;
        setUser(userWithDefaults);
        localStorage.setItem('user_profile', JSON.stringify(userWithDefaults));
        
        // Fetch complete profile from API to ensure all fields are up to date
        try {
            const profile = await profileApi.getProfile();
            setUser(profile);
            localStorage.setItem('user_profile', JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to fetch complete profile after login:', error);
            // Keep the user data from login response if profile fetch fails
        }
    };

    const loginWithGoogle = async (data: { idToken: string }) => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'WEB-CLIENT-ID';
        const response = await authService.loginWithGoogle(data.idToken, clientId);
        await login(response);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        localStorage.removeItem('user_profile');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                loginWithGoogle,
                logout,
                isAuthenticated: !!user,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
