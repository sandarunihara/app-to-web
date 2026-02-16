import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';

import { Input } from '../../components/ui/Input';
import { useToast } from '../../providers/ToastProvider';
import { authApi } from '../auth/services/authApi';

export function ResetPasswordOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter a valid OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      // Verify the OTP
      await authApi.verifyOtp({ email, otp });
      showToast('OTP verified successfully', 'success');
      navigate('/new-password', { state: { email, otp } });
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
          onClick={() => navigate('/forgot-password')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Forgot Password
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
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
