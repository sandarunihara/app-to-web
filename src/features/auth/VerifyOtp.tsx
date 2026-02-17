import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';

import { Input } from '../../components/ui/Input';
import { useToast } from '../../providers/ToastProvider';
import { authApi } from '../auth/services/authApi';

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const storedSignupData = localStorage.getItem('signupData');
  const storedResendEmail = localStorage.getItem('resendVerificationEmail');
  
  // Get email from various sources
  let email = '';
  if (storedResendEmail) {
    email = storedResendEmail;
  } else if (location.state?.email) {
    email = location.state.email;
  } else if (storedSignupData) {
    try {
      const signupData = JSON.parse(storedSignupData);
      email = signupData.email;
    } catch {
      // Invalid signup data
    }
  }

  // Check if we have required data on mount
  useEffect(() => {
    if (!email) {
      showToast('Session expired. Please start again.', 'error');
      navigate('/signup', { replace: true });
    }
  }, [email, navigate, showToast]);

  // Don't render form if no email
  if (!email) {
    return null;
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter a valid OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      
      // If this is from signup flow, confirm the signup
      if (storedSignupData) {
        const signupData = JSON.parse(storedSignupData);
        await authApi.confirmSignup(signupData);
        localStorage.removeItem('signupData');
        showToast('Account created successfully! Please login.', 'success');
        navigate('/login');
        return;
      }

      // If this is from resend verification flow
      if (storedResendEmail) {
        localStorage.removeItem('resendVerificationEmail');
      }

      showToast('Email verified successfully! Please login.', 'success');
      navigate('/login');
    } catch (error: any) {
      showToast(error.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={() => navigate(storedSignupData ? '/signup' : '/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h1>
          <p className="text-gray-600">Enter the OTP sent to {email}</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-xl tracking-widest"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Didn't receive the OTP?{' '}
          <button className="text-blue-500 hover:text-blue-600 font-medium">
            Resend OTP
          </button>
        </p>
      </div>
    </ScreenWrapper>
  );
}
