import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Activity, Ruler, Weight, AlertCircle, Save, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../providers/ToastProvider';
import { profileApi, type HealthParameters } from '../../services/profileApi';

interface HealthProfileForm {
    height: number;
    weight: number;
    bloodType: string;
    allergies: string; // Comma separated for input
    chronicConditions: string; // Comma separated for input
}

export const HealthProfile: React.FC = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [bmi, setBmi] = useState<{ value: string; status: string; color: string } | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<HealthProfileForm>();

    const height = watch('height');
    const weight = watch('weight');

    useEffect(() => {
        if (height && weight) {
            const h = height / 100; // cm to m
            const bmiValue = weight / (h * h);
            const value = bmiValue.toFixed(1);

            let status = 'Normal';
            let color = '#10B981'; // green-500

            if (bmiValue < 18.5) {
                status = 'Underweight';
                color = '#F59E0B'; // amber-500
            } else if (bmiValue >= 25 && bmiValue < 30) {
                status = 'Overweight';
                color = '#F59E0B';
            } else if (bmiValue >= 30) {
                status = 'Obese';
                color = '#EF4444'; // red-500
            }

            setBmi({ value, status, color });
        } else {
            setBmi(null);
        }
    }, [height, weight]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Fetch profile to get health parameters
                const profile = await profileApi.getProfile();
                const health = profile.healthParameters || {};

                // Also check top-level height/weight if not in healthParameters (backward compatibility)
                const h = health.height || profile.height || 0;
                const w = health.weight || profile.weight || 0;

                setValue('height', h);
                setValue('weight', w);
                setValue('bloodType', health.bloodType || '');
                setValue('allergies', health.allergies?.join(', ') || '');
                setValue('chronicConditions', health.chronicConditions?.join(', ') || '');
            } catch (error) {
                console.error('Failed to load health profile:', error);
                showToast('Failed to load health data', 'error');
            } finally {
                setIsFetching(false);
            }
        };

        loadProfile();
    }, [setValue, showToast]);

    const onSubmit = async (data: HealthProfileForm) => {
        setIsLoading(true);
        try {
            const apiData: Partial<HealthParameters> = {
                height: Number(data.height),
                weight: Number(data.weight),
                bloodType: data.bloodType,
                allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
                chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
            };

            await profileApi.updateHealthParameters(apiData);
            showToast('Health profile updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update health profile:', error);
            showToast('Failed to update health profile', 'error');
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
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="text-purple-600" size={24} />
                    Health Profile
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Height (cm)"
                            placeholder="e.g. 175"
                            type="number"
                            error={errors.height?.message}
                            left={<Ruler size={18} />}
                            {...register('height', { required: 'Height is required', min: 0 })}
                        />

                        <Input
                            label="Weight (kg)"
                            placeholder="e.g. 70"
                            type="number"
                            error={errors.weight?.message}
                            left={<Weight size={18} />}
                            {...register('weight', { required: 'Weight is required', min: 0 })}
                        />

                        <div className="md:col-span-2">
                            {/* BMI Card */}
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">Body Mass Index (BMI)</h3>
                                    <p className="text-xs text-gray-500 mt-1">Calculated based on height and weight</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{bmi ? bmi.value : '--'}</div>
                                    <div className="text-sm font-medium" style={{ color: bmi?.color || '#9CA3AF' }}>
                                        {bmi ? bmi.status : 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                            <select
                                {...register('bloodType')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-[56px] bg-gray-50"
                            >
                                <option value="">Select Blood Type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <Input
                            label="Allergies (comma separated)"
                            placeholder="e.g. Penicillin, Peanuts"
                            left={<AlertCircle size={18} />}
                            {...register('allergies')}
                        />

                        <div className="md:col-span-2">
                            <Input
                                label="Chronic Conditions (comma separated)"
                                placeholder="e.g. Hypertension, Diabetes"
                                left={<Activity size={18} />}
                                {...register('chronicConditions')}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button
                            type="submit"
                            loading={isLoading}
                            icon={<Save size={18} />}
                            title="Update Health Profile"
                            className="w-full md:w-auto"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};
