/**
 * Backend API Client
 * 
 * This client handles ALL business logic API calls to Jendo Backend.
 * JWT tokens from Auth Service MUST be attached to every request.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

// Backend runs on port 8090 (or proxy)
const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiErrorResponse {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

class BackendApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: BACKEND_URL,
            timeout: 30000,
            withCredentials: true, // Enable cookies for proxied requests
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const publicEndpoints = ['/public'];
                const isPublicEndpoint = publicEndpoints.some(endpoint =>
                    config.url?.startsWith(endpoint)
                );

                if (!isPublicEndpoint) {
                    const token = await authService.getStoredToken();

                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ApiErrorResponse>) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(token => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                return this.client(originalRequest);
                            })
                            .catch(err => {
                                return Promise.reject(err);
                            });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const authData = await authService.refreshToken();

                        this.processQueue(authData.accessToken, null);

                        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(null, refreshError);
                        await authService.logout();
                        window.location.href = '/login'; // Web navigation logic
                        throw new Error('Session expired. Please login again.');
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                if (error.response?.status === 403) {
                    throw new Error('Access denied. You do not have permission to perform this action.');
                }

                if (error.response?.status === 500) {
                    console.error('Backend 500 Error:', {
                        url: error.config?.url,
                        method: error.config?.method,
                        status: error.response.status,
                        data: error.response.data,
                    });
                }

                const message = error.response?.data?.message || error.response?.statusText || 'An error occurred';
                throw new Error(message);
            }
        );
    }

    private processQueue(token: string | null, error: any): void {
        this.failedQueue.forEach(promise => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve(token);
            }
        });

        this.failedQueue = [];
    }

    getInstance(): AxiosInstance {
        return this.client;
    }

    async get<T = any>(url: string, config?: any): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: any): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    async downloadFile(url: string, _filename?: string): Promise<Blob> {
        const response = await this.client.get(url, {
            responseType: 'blob',
        });
        return response.data;
    }
}

export const backendApi = new BackendApiClient();
export type { ApiErrorResponse };
