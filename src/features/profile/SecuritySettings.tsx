import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Lock, Save } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../providers/ToastProvider';
import { profileApi } from '../../services/profileApi';

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const SecuritySettings: React.FC = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ChangePasswordForm>();

    const newPassword = watch('newPassword');

    const onSubmit = async (data: ChangePasswordForm) => {
        if (data.newPassword !== data.confirmPassword) {
            return; // Should be handled by validation but double checking
        }

        setIsLoading(true);
        try {
            const response = await profileApi.changePassword(
                data.currentPassword,
                data.newPassword
            );

            if (response.success) {
                showToast('Password changed successfully', 'success');
                reset();
            } else {
                showToast(response.message || 'Failed to change password', 'error');
            }
        } catch (error: any) {
            console.error('Failed to change password:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to change password';
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="text-purple-600" size={24} />
                Security Settings
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
                <Input
                    label="Current Password"
                    placeholder="Enter current password"
                    type="password"
                    error={errors.currentPassword?.message}
                    left={<Lock size={18} />}
                    {...register('currentPassword', { required: 'Current password is required' })}
                />

                <Input
                    label="New Password"
                    placeholder="Enter new password"
                    type="password"
                    error={errors.newPassword?.message}
                    left={<Lock size={18} />}
                    {...register('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                />

                <Input
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    type="password"
                    error={errors.confirmPassword?.message}
                    left={<Lock size={18} />}
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (val) => val === newPassword || 'Passwords do not match'
                    })}
                />

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <Button
                        type="submit"
                        loading={isLoading}
                        icon={<Save size={18} />}
                        title="Change Password"
                        className="w-full md:w-auto"
                    />
                </div>
            </form>
        </div>
    );
};
