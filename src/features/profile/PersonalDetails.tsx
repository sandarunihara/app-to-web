import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Calendar, MapPin, Flag, Save, Loader2, Weight, Ruler, Camera } from 'lucide-react';
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
    weight?: string;
    height?: string;
}

export const PersonalDetails: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    setValue('weight', user.weight ? String(user.weight) : '');
                    setValue('height', user.height ? String(user.height) : '');
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
                setValue('weight', profile.weight ? String(profile.weight) : '');
                setValue('height', profile.height ? String(profile.height) : '');
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
            // Convert weight and height to numbers
            const weight = data.weight ? parseFloat(data.weight) : undefined;
            const height = data.height ? parseFloat(data.height) : undefined;

            // Calculate BMI if both weight and height are provided
            let bmi: number | undefined = undefined;
            if (weight && height) {
                const heightInMeters = height / 100;
                bmi = weight / (heightInMeters * heightInMeters);
            }

            const profileData = {
                ...data,
                weight,
                height,
                bmi,
            };
            await profileApi.updateProfile(profileData);
            showToast('Profile updated successfully', 'success');

            // Refresh user data in context
            await refreshUser();
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

    // Build avatar URL
    const rawAvatar = (user as any)?.avatar || user?.profileImage;
    const userAvatar = avatarPreview || (
        rawAvatar?.startsWith('/uploads/')
            ? `/api${rawAvatar}`
            : rawAvatar
    );
    const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User' : 'User';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7B2D8E&color=fff&size=200`;

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be under 5MB', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        // Upload
        try {
            setUploadingImage(true);
            await profileApi.uploadProfileImage(file);
            showToast('Profile photo updated successfully', 'success');
            await refreshUser();
        } catch (error: any) {
            console.error('Error uploading image:', error);
            setAvatarPreview(null); // Revert preview on failure
            if (error?.response?.status === 413) {
                showToast('Image is too large. Please try a smaller one.', 'error');
            } else {
                showToast('Failed to upload profile photo', 'error');
            }
        } finally {
            setUploadingImage(false);
            // Reset the input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-100">
                <div className="relative group">
                    <img
                        src={userAvatar || defaultAvatar}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-md"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg transition-all border-2 border-white disabled:opacity-70"
                        title="Change profile photo"
                    >
                        {uploadingImage ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Camera size={16} />
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

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

                    <Input
                        label="Weight (kg)"
                        placeholder="Enter your weight in kg"
                        type="number"
                        step="0.1"
                        error={errors.weight?.message}
                        left={<Weight size={18} />}
                        {...register('weight', {
                            min: { value: 1, message: 'Weight must be at least 1 kg' },
                            max: { value: 500, message: 'Weight must be less than 500 kg' }
                        })}
                    />

                    <Input
                        label="Height (cm)"
                        placeholder="Enter your height in cm"
                        type="number"
                        step="0.1"
                        error={errors.height?.message}
                        left={<Ruler size={18} />}
                        {...register('height', {
                            min: { value: 1, message: 'Height must be at least 1 cm' },
                            max: { value: 300, message: 'Height must be less than 300 cm' }
                        })}
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
