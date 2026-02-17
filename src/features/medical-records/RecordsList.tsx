import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Heart, Activity } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useToast } from '../../providers/ToastProvider';
import type { ReportCategory } from '../../types/models';

export const RecordsList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [categories, setCategories] = useState<ReportCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordsApi.getCategories();
            setCategories(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (name: string) => {
        switch (name?.toLowerCase()) {
            case 'diabetics':
            case 'diabetes':
                return <Activity size={24} />;
            case 'cardiovascular':
            case 'cardio':
                return <Heart size={24} />;
            default:
                return <FolderOpen size={24} />;
        }
    };

    const getCategoryColor = (name: string) => {
        switch (name?.toLowerCase()) {
            case 'diabetics':
            case 'diabetes':
                return 'bg-blue-50 text-blue-600 hover:bg-blue-100';
            case 'cardiovascular':
            case 'cardio':
                return 'bg-red-50 text-red-600 hover:bg-red-100';
            default:
                return 'bg-purple-50 text-purple-600 hover:bg-purple-100';
        }
    };

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your prescriptions and reports securely</p>
                    </div>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => navigate(`/my-reports/category/${category.id}`, { state: { category } })}
                                className={`${getCategoryColor(category.name)} text-left p-6 rounded-xl border border-transparent transition-all hover:shadow-md group`}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center group-hover:bg-white/80 transition-colors">
                                        {getCategoryIcon(category.name)}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                                <p className="text-sm opacity-75">View {category.name.toLowerCase()} records</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No records found</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            Upload your medical prescriptions and reports to keep them organized and safe.
                        </p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
