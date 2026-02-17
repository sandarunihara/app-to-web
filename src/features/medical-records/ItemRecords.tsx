import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Eye, Calendar } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useAuth } from '../../providers/AuthProvider';
import type { ReportValue, ReportItem, ReportSection, ReportCategory } from '../../types/models';

export const ItemRecords: React.FC = () => {
    const navigate = useNavigate();
    const { itemId } = useParams<{ itemId: string }>();
    const location = useLocation();
    const { user } = useAuth();
    const [values, setValues] = useState<ReportValue[]>([]);
    const [loading, setLoading] = useState(true);
    const item = location.state?.item as ReportItem | undefined;
    const section = location.state?.section as ReportSection | undefined;
    const category = location.state?.category as ReportCategory | undefined;

    useEffect(() => {
        if (itemId && user) {
            fetchValues();
        }
    }, [itemId, user]);

    const fetchValues = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordsApi.getItemValues(parseInt(itemId!), Number(user!.id));
            setValues(data.sort((a, b) => new Date(b.valueDate).getTime() - new Date(a.valueDate).getTime()));
        } catch (error: any) {
            console.error('Failed to fetch records:', error);
            setValues([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getValue = (value: ReportValue): string => {
        if (value.valueNumber !== null && value.valueNumber !== undefined) {
            return value.valueNumber.toString();
        }
        if (value.valueText) {
            return value.valueText;
        }
        return '-';
    };

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Header with back button */}
                <div>
                    <button
                        onClick={() => navigate(`/my-reports/section/${section?.id || item?.sectionId}`, {
                            state: { section, category }
                        })}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Items</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {item?.name || 'Item Records'}
                    </h1>
                    {item?.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Date</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Value</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Notes</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase text-right">View</span>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="divide-y divide-gray-50">
                            {[1, 2].map(i => (
                                <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="flex justify-end">
                                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : values.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {values.map(value => (
                                <div key={value.id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-900">{formatDate(value.valueDate)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-semibold text-gray-900">{getValue(value)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-600 truncate">
                                            {value.valueText || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={() => navigate(`/my-reports/value/${value.id}`, {
                                                state: { value, item, section, category }
                                            })}
                                            className="p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500 text-sm">No records found for this item</p>
                        </div>
                    )}
                </div>

                {/* Add New Record Button */}
                <button
                    onClick={() => navigate(`/my-reports/item/${itemId}/add`, {
                        state: { item, section, category }
                    })}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-colors font-medium shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add New {item?.name || 'Record'}</span>
                </button>
            </div>
        </ScreenWrapper>
    );
};
