import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, TYPOGRAPHY, SPACING } from '../../config/theme.config';
import { useToast } from '../../providers/ToastProvider';
import { authService } from '../../services/authService';

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
};

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last Name is required';

        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address';

        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return newErrors;
    };

    const handleSignup = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            showToast('Please fix errors', 'error');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const signupData = {
                email: email.trim(),
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            };

            localStorage.setItem('signupData', JSON.stringify(signupData));
            await authService.sendOtp(signupData.email);
            showToast('OTP sent to your email!', 'success');
            navigate('/verify-otp');
        } catch (err: any) {
            const msg = err.message || 'Registration failed';
            setErrors({ general: msg });
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper className="flex items-center justify-center min-h-screen bg-white">
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Create Account</h2>
                    <p style={styles.subtitle}>Sign up to get started</p>
                </div>

                <div style={styles.form}>
                    {errors.general && (
                        <div style={styles.generalErrorContainer}>
                            <AlertCircle size={20} color="#C62828" />
                            <span style={{ color: '#C62828', fontSize: '12px', flex: 1 }}>{errors.general}</span>
                        </div>
                    )}

                    <div style={styles.inputContainer}>
                        <Input
                            label="First Name"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            left={<User size={20} color={COLORS.textSecondary} />}
                            error={errors.firstName}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <Input
                            label="Last Name"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            left={<User size={20} color={COLORS.textSecondary} />}
                            error={errors.lastName}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            left={<Mail size={20} color={COLORS.textSecondary} />}
                            error={errors.email}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            left={<Lock size={20} color={COLORS.textSecondary} />}
                            right={
                                <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                    {showPassword ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
                                </div>
                            }
                            error={errors.password}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <Input
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            left={<Lock size={20} color={COLORS.textSecondary} />}
                            right={
                                <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>
                                    {showConfirmPassword ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
                                </div>
                            }
                            error={errors.confirmPassword}
                        />
                    </div>

                    <Button
                        title={loading ? 'Creating Account...' : 'Sign Up'}
                        onClick={handleSignup}
                        loading={loading}
                        fullWidth
                        style={{ marginTop: SPACING.lg }}
                    />

                    <div style={styles.footer}>
                        <span style={styles.footerText}>Already have an account?</span>
                        <span style={styles.footerLink} onClick={() => navigate('/login')}>Login</span>
                    </div>
                </div>
            </div>
        </ScreenWrapper>
    );
};
