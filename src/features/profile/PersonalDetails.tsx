import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Calendar, MapPin, Flag, Save, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';
import { profileApi } from '../../services/profileApi';

interface PersonalDetailsForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    nationality: string;
}

export const PersonalDetails: React.FC = () => {
    const { user } = useAuth(); // login used to update user context if needed, or we might need a specific updateUser
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PersonalDetailsForm>();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // If we have user in context, pre-fill
                if (user) {
                    setValue('firstName', user.firstName);
                    setValue('lastName', user.lastName);
                    setValue('email', user.email);
                    setValue('phone', user.phone || '');
                    setValue('dateOfBirth', user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
                    setValue('gender', user.gender || '');
                    setValue('address', user.address || '');
                    setValue('nationality', user.nationality || '');
                }

                // Fetch latest from API
                const profile = await profileApi.getProfile();
                setValue('firstName', profile.firstName);
                setValue('lastName', profile.lastName);
                setValue('email', profile.email);
                setValue('phone', profile.phone || '');
                setValue('dateOfBirth', profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
                setValue('gender', profile.gender || '');
                setValue('address', profile.address || '');
                setValue('nationality', profile.nationality || '');
            } catch (error) {
                console.error('Failed to load profile:', error);
                showToast('Failed to load profile data', 'error');
            } finally {
                setIsFetching(false);
            }
        };

        loadProfile();
    }, [user, setValue, showToast]);

    const onSubmit = async (data: PersonalDetailsForm) => {
        setIsLoading(true);
        try {
            await profileApi.updateProfile(data);
            showToast('Profile updated successfully', 'success');

            // Ideally update local auth context too
            // For now, we rely on the fact that next page load or specific action triggers re-fetch
            // But if AuthProvider has a refreshUser method, we'd use it.
            // Assuming we don't, the user might see stale data in header until refresh.
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-purple-600" size={24} />
                Personal Details
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="First Name"
                        placeholder="Enter your first name"
                        error={errors.firstName?.message}
                        left={<User size={18} />}
                        {...register('firstName', { required: 'First name is required' })}
                    />

                    <Input
                        label="Last Name"
                        placeholder="Enter your last name"
                        error={errors.lastName?.message}
                        left={<User size={18} />}
                        {...register('lastName', { required: 'Last name is required' })}
                    />

                    <Input
                        label="Email Address"
                        placeholder="your.email@example.com"
                        type="email"
                        disabled
                        left={<Mail size={18} />}
                        {...register('email')}
                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                    />

                    <Input
                        label="Phone Number"
                        placeholder="+94 77 123 4567"
                        type="tel"
                        error={errors.phone?.message}
                        left={<Phone size={18} />}
                        {...register('phone')}
                    />

                    <Input
                        label="Date of Birth"
                        type="date"
                        error={errors.dateOfBirth?.message}
                        left={<Calendar size={18} />}
                        {...register('dateOfBirth')}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                            {...register('gender')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-[56px] bg-gray-50"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            label="Address"
                            placeholder="Enter your address"
                            error={errors.address?.message}
                            left={<MapPin size={18} />}
                            {...register('address')}
                        />
                    </div>

                    <Input
                        label="Nationality"
                        placeholder="Enter your nationality"
                        error={errors.nationality?.message}
                        left={<Flag size={18} />}
                        {...register('nationality')}
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                        type="submit"
                        loading={isLoading}
                        icon={<Save size={18} />}
                        title="Save Changes"
                        className="w-full md:w-auto"
                    />
                </div>
            </form>
        </div>
    );
};
