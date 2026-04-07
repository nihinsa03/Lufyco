import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../api/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    verified: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;
    loading: boolean;
    error: string | null;

    completeOnboarding: () => void;
    signup: (data: any) => Promise<boolean>;
    login: (data: any) => Promise<boolean>;
    verifyEmail: (email: string, otp: string) => Promise<boolean>;
    resendOTP: (email: string) => Promise<boolean>;
    verifyOtp: (otp: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    requestPasswordReset: (email: string) => Promise<boolean>;
    verifyResetOTP: (email: string, otp: string) => Promise<boolean>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isOnboarded: false,
            loading: false,
            error: null,

            completeOnboarding: () => set({ isOnboarded: true }),

            signup: async (data) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/register', data);
                    // Backend sends verification email and returns requiresVerification: true
                    console.log('Signup response:', res.data);

                    // Don't auto-login, user needs to verify email first
                    set({ loading: false });
                    return true;
                } catch (e: any) {
                    const msg = e.response?.data?.message || "Signup Failed";
                    console.error("Signup Store Error:", msg, e);
                    set({ error: msg, loading: false });
                    return false;
                }
            },

            login: async ({ email, password }) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/login', { email, password });

                    const userData = res.data;
                    const appUser = {
                        id: userData._id,
                        name: userData.name,
                        email: userData.email,
                        verified: true, // Assuming login succeeds only if verified or we don't track it strictly
                        // Check if backend returns token
                        isAdmin: userData.isAdmin
                    };

                    // Save token if backend returns it
                    if (userData.token) {
                        // api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                    }

                    set({ user: appUser, token: userData.token || 'mock_token', isAuthenticated: true });
                    return true;
                } catch (e: any) {
                    const msg = e.response?.data?.message || "Login Failed";
                    console.error("Login Store Error:", msg, e);
                    set({ error: msg });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            verifyEmail: async (email, otp) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/verify-email', { email, otp });
                    console.log('Verification response:', res.data);
                    set({ loading: false });
                    return true;
                } catch (e: any) {
                    const msg = e.response?.data?.message || "Verification Failed";
                    console.error("Verify Email Store Error:", msg, e);
                    set({ error: msg, loading: false });
                    return false;
                }
            },

            resendOTP: async (email) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/resend-otp', { email });
                    console.log('Resend OTP response:', res.data);
                    set({ loading: false });
                    return true;
                } catch (e: any) {
                    const msg = e.response?.data?.message || "Failed to resend OTP";
                    console.error("Resend OTP Store Error:", msg, e);
                    set({ error: msg, loading: false });
                    return false;
                }
            },

            verifyOtp: async (otp) => {
                set({ loading: true, error: null });
                try {
                    // Legacy method - keeping for backward compatibility
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (otp !== '123456') throw new Error('Invalid Code');

                    const { user } = get();
                    if (user) {
                        set({ user: { ...user, verified: true }, token: 'mock_token_verified', isAuthenticated: true });
                    }
                    return true;
                } catch (e: any) {
                    set({ error: e.message });
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (updates) => {
                const { user } = get();
                if (user) {
                    set({ user: { ...user, ...updates } });
                }
            },

            // Forgot Password Methods
            requestPasswordReset: async (email) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/forgot-password', { email });
                    console.log('Forgot Password response:', res.data);
                    set({ loading: false });
                    return true;
                } catch (e: any) {
                    console.error('Forgot Password error:', e.response?.data || e);
                    const errorMessage = e.response?.data?.message || 'Failed to send password reset code';
                    set({ error: errorMessage, loading: false });
                    return false;
                }
            },

            verifyResetOTP: async (email, otp) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/verify-reset-otp', { email, otp });
                    console.log('Verify Reset OTP response:', res.data);
                    set({ loading: false });
                    return true;
                } catch (e: any) {
                    console.error('Verify Reset OTP error:', e.response?.data || e);
                    const errorMessage = e.response?.data?.message || 'Invalid or expired verification code';
                    set({ error: errorMessage, loading: false });
                    return false;
                }
            },

            resetPassword: async (email, otp, newPassword) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post('/users/reset-password', { email, otp, newPassword });
                    console.log('Reset Password response:', res.data);
                    set({ loading: false });
                    return true;
                } catch (e: any) {
                    console.error('Reset Password error:', e.response?.data || e);
                    const errorMessage = e.response?.data?.message || 'Failed to reset password';
                    set({ error: errorMessage, loading: false });
                    return false;
                }
            }

        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isOnboarded: state.isOnboarded
            }),
        }
    )
);
