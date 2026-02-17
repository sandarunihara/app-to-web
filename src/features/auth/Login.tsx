import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, TYPOGRAPHY, SPACING } from '../../config/theme.config';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';
import { authService } from '../../services/authService';

// Styles corresponding to React Native styles
const styles = {
    container: {
        flex: 1,
        padding: SPACING.lg,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        minHeight: '100vh',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        textAlign: 'center' as const,
    },
    logo: {
        fontSize: TYPOGRAPHY.fontSize.display,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.primary,
        marginBottom: SPACING.sm,
        letterSpacing: '2px',
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.xxl,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.textSecondary,
    },
    form: {
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
    },
    inputContainer: {
        marginBottom: SPACING.md,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.lg,
        cursor: 'pointer',
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        textAlign: 'right' as const,
        display: 'block',
        width: '100%',
    },
    divider: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        marginVertical: SPACING.xl,
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
        display: 'flex',
        gap: SPACING.md,
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSize.sm,
    },
    footer: {
        marginTop: SPACING.xxl,
        flexDirection: 'row' as const,
        justifyContent: 'center',
        display: 'flex',
        gap: SPACING.xs,
    },
    footerText: {
        color: COLORS.textSecondary,
    },
    footerLink: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        cursor: 'pointer',
    },
    generalErrorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: '#FFEBEE',
        borderLeft: '4px solid #FF5252',
        padding: SPACING.md,
        borderRadius: SPACING.xs,
        marginBottom: SPACING.md,
    },
    resendButton: {
        marginLeft: 'auto',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: '#FFF8E1',
        border: 'none',
        color: '#F57C00',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '12px',
    },
};

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showResend, setShowResend] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    // Google callback - handles the credential response after user signs in
    const handleGoogleCallback = useCallback(async (response: { credential?: string }) => {
        if (!response?.credential) {
            showToast('Google Sign-In failed. Please try again.', 'error');
            return;
        }

        setGoogleLoading(true);
        try {
            const authResponse = await authService.loginWithGoogle(response.credential, googleClientId!);
            await login(authResponse);
            showToast('Login successful!', 'success');
            navigate('/dashboard');
        } catch (err: any) {
            showToast(err.message || 'Google login failed', 'error');
        } finally {
            setGoogleLoading(false);
        }
    }, [googleClientId, login, navigate, showToast]);

    useEffect(() => {
        if (!googleClientId) {
            return;
        }

        const initializeGoogle = () => {
            if (!window.google?.accounts?.id) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCallback,
                use_fedcm_for_prompt: false, // Disable FedCM to avoid NetworkError
            });

            // Render the official Google Sign-In button in our container
            if (googleButtonRef.current) {
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        text: 'continue_with',
                        shape: 'rectangular',
                        width: 400,
                    }
                );
            }
        };

        if (window.google?.accounts?.id) {
            initializeGoogle();
            return;
        }

        const existingScript = document.querySelector('script[data-google-identity="true"]');
        if (existingScript) {
            existingScript.addEventListener('load', initializeGoogle, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        script.onload = initializeGoogle;
        script.onerror = () => {
            console.error('Failed to load Google Identity Services');
        };
        document.head.appendChild(script);
    }, [googleClientId, handleGoogleCallback]);

    const handleResendVerification = async () => {
        try {
            if (!email) return;
            const trimmedEmail = email.trim();
            if (!trimmedEmail) return;
            localStorage.setItem('resendVerificationEmail', trimmedEmail);
            await authService.sendOtp(trimmedEmail);
            showToast('Verification code sent to your email', 'success');
            navigate('/auth/verify-otp');
        } catch (err: any) {
            showToast(err.message || 'Failed to send verification code', 'error');
        }
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address';

        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return newErrors;
    };

    const handleLogin = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            showToast(Object.values(validationErrors)[0] || 'Please fix errors', 'error');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await authService.login(email.trim(), password);
            await login(response);
            showToast('Login successful!', 'success');
            navigate('/dashboard'); // Route for (tabs)
        } catch (err: any) {
            // Error parsing logic similar to Android
            const msg = err.message || 'An error occurred';
            const msgLower = msg.toLowerCase();

            let errorField: keyof FormErrors = 'general';
            let errorMsg = msg;

            if (msgLower.includes('verify')) {
                setShowResend(true);
                errorMsg = 'Please verify your email before logging in';
            } else {
                setShowResend(false);
            }

            if ((msgLower.includes('email') && msgLower.includes('bound')) || msgLower.includes('user not found')) {
                errorField = 'email';
                errorMsg = 'No account found with this email';
            } else if (msgLower.includes('password') || msgLower.includes('credentials')) {
                errorMsg = 'Your email or password is incorrect';
            }

            setErrors({ [errorField]: errorMsg });
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // No more handleGoogleLogin needed — the rendered Google button handles everything

    return (
        <ScreenWrapper className="flex items-center justify-center min-h-screen bg-white">
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.logo}>JENDO</h1>
                    <h2 style={styles.title}>Welcome Back</h2>
                    <p style={styles.subtitle}>Login to your account</p>
                </div>

                <div style={styles.form}>
                    {errors.general && (
                        <div style={styles.generalErrorContainer}>
                            <AlertCircle size={20} color="#C62828" />
                            <span style={{ color: '#C62828', fontSize: '12px', flex: 1 }}>{errors.general}</span>
                            {showResend && (
                                <button onClick={handleResendVerification} style={styles.resendButton}>
                                    Resend verification
                                </button>
                            )}
                        </div>
                    )}

                    <div style={styles.inputContainer}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({});
                            }}
                            left={<Mail size={20} color={errors.email ? '#FF5252' : COLORS.textSecondary} />}
                            error={errors.email}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors({});
                            }}
                            left={<Lock size={20} color={errors.password ? '#FF5252' : COLORS.textSecondary} />}
                            right={
                                <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                    {showPassword ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
                                </div>
                            }
                            error={errors.password}
                        />
                    </div>

                    <div style={styles.forgotPassword} onClick={() => navigate('/auth/forgot-password')}>
                        <span style={styles.forgotPasswordText}>Forgot Password?</span>
                    </div>

                    <Button
                        title={loading ? 'Logging in...' : 'Login'}
                        onClick={handleLogin}
                        loading={loading}
                        fullWidth
                    />

                    <div style={styles.divider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>Or continue with</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* Google Sign-In button rendered by Google Identity Services */}
                    <div
                        ref={googleButtonRef}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            minHeight: '44px',
                            opacity: googleLoading ? 0.6 : 1,
                            pointerEvents: googleLoading ? 'none' : 'auto',
                        }}
                    />
                    {googleLoading && (
                        <p style={{ textAlign: 'center', color: COLORS.textSecondary, fontSize: '13px', marginTop: '8px' }}>
                            Signing in with Google...
                        </p>
                    )}

                    <div style={styles.footer}>
                        <span style={styles.footerText}>Don't have an account?</span>
                        <span style={styles.footerLink} onClick={() => navigate('/auth/signup')}>Sign Up</span>
                    </div>
                </div>
            </div>
        </ScreenWrapper>
    );
};
