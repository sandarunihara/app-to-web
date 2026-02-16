import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../providers/ToastProvider';
import { authApi } from '../auth/services/authApi';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPasswordReset({ email });
      setOtpSent(true);
      showToast('OTP sent to your email', 'success');
      // Redirect to verify OTP page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password-otp', { state: { email } });
      }, 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            {otpSent
              ? 'Verifying your email...'
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendOtp} className="space-y-6">
          {!otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </ScreenWrapper>
  );
}
