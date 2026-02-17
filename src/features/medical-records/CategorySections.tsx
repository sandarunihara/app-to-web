import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, FolderOpen, Microscope } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useToast } from '../../providers/ToastProvider';
import type { ReportSection, ReportCategory } from '../../types/models';

export const CategorySections: React.FC = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const location = useLocation();
    const { showToast } = useToast();
    const [sections, setSections] = useState<ReportSection[]>([]);
    const [loading, setLoading] = useState(true);
    const category = location.state?.category as ReportCategory | undefined;

    useEffect(() => {
        if (categoryId) {
            fetchSections();
        }
    }, [categoryId]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordsApi.getSectionsByCategory(parseInt(categoryId!));
            setSections(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch sections', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getSectionIcon = (name: string) => {
        switch (name?.toLowerCase()) {
            case 'core investigations':
                return <Microscope size={20} />;
            case 'personal information':
                return <FileText size={20} />;
            default:
                return <FolderOpen size={20} />;
        }
    };

    const getSectionColor = (name: string) => {
        switch (name?.toLowerCase()) {
            case 'core investigations':
                return 'bg-blue-50 text-blue-600';
            case 'personal information':
                return 'bg-green-50 text-green-600';
            default:
                return 'bg-purple-50 text-purple-600';
        }
    };

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Header with back button */}
                <div>
                    <button
                        onClick={() => navigate('/my-reports')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Categories</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {category?.name || 'Category Sections'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select a section to view and manage your records
                    </p>
                </div>

                {/* Sections List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sections.length > 0 ? (
                    <div className="space-y-3">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => navigate(`/my-reports/section/${section.id}`, { 
                                    state: { section, category } 
                                })}
                                className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSectionColor(section.name)}`}>
                                        {getSectionIcon(section.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                            {section.name}
                                        </h3>
                                        {section.description && (
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {section.description}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowLeft className="rotate-180 text-gray-400 group-hover:text-purple-700 transition-colors" size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections found</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            No sections available for this category yet.
                        </p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
