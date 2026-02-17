import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useToast } from '../../providers/ToastProvider';
import type { ReportItem, ReportSection, ReportCategory } from '../../types/models';

export const SectionItems: React.FC = () => {
    const navigate = useNavigate();
    const { sectionId } = useParams<{ sectionId: string }>();
    const location = useLocation();
    const { showToast } = useToast();
    const [items, setItems] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const section = location.state?.section as ReportSection | undefined;
    const category = location.state?.category as ReportCategory | undefined;

    useEffect(() => {
        if (sectionId) {
            fetchItems();
        }
    }, [sectionId]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordsApi.getItemsBySection(parseInt(sectionId!));
            setItems(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch items', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Header with back button */}
                <div>
                    <button
                        onClick={() => navigate(`/my-reports/category/${section?.categoryId || category?.id}`, {
                            state: { category }
                        })}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Sections</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {section?.name || 'Section Items'}
                    </h1>
                    {section?.description && (
                        <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    )}
                </div>

                {/* Items List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => navigate(`/my-reports/item/${item.id}`, { 
                                    state: { item, section, category } 
                                })}
                                className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                            {item.name}
                                        </h3>
                                        {item.description && (
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowLeft className="rotate-180 text-gray-400 group-hover:text-purple-700 transition-colors" size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            No report items available in this section yet.
                        </p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
