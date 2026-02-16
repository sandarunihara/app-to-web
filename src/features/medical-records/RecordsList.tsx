import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Trash2, Download, Eye, FolderOpen } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { medicalRecordApi } from './services/medicalRecordApi';
import { reportApi } from './services/reportApi';
import { useToast } from '../../providers/ToastProvider';

export const RecordsList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const folders = await medicalRecordApi.getFolders();
            setRecords(folders);
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch records', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await reportApi.deleteValue(parseInt(id));
            showToast('Record deleted successfully', 'success');
            await fetchRecords();
            setShowDeleteConfirm(null);
        } catch (error: any) {
            showToast(error.message || 'Failed to delete record', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'prescriptions': return 'bg-blue-50 text-blue-600';
            case 'lab reports': return 'bg-purple-50 text-purple-600';
            case 'medical history': return 'bg-green-50 text-green-600';
            default: return 'bg-gray-50 text-gray-600';
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
                    <button
                        onClick={() => navigate('/my-reports/add')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Upload size={16} />
                        <span>Add Record</span>
                    </button>
                </div>

                {/* Records Table / List */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-100">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="px-6 py-5 border-b border-gray-50 last:border-0 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-lg bg-gray-100 animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                                    <div className="h-3 bg-gray-50 rounded w-1/4 animate-pulse"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded bg-gray-50 animate-pulse"></div>
                                    <div className="w-8 h-8 rounded bg-gray-50 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : records.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        {/* Table Header (desktop) */}
                        <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <span className="col-span-5">Name</span>
                            <span className="col-span-3">Category</span>
                            <span className="col-span-2">Type</span>
                            <span className="col-span-2 text-right">Actions</span>
                        </div>

                        {records.map(record => (
                            <div
                                key={record.id}
                                className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                onClick={() => navigate(`/my-reports/${record.id}`)}
                            >
                                {/* Name */}
                                <div className="md:col-span-5 flex items-center gap-3.5 mb-2 md:mb-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(record.name)}`}>
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">{record.name}</h3>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="md:col-span-3 mb-2 md:mb-0">
                                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
                                        {record.name}
                                    </span>
                                </div>

                                {/* Type */}
                                <div className="md:col-span-2 mb-2 md:mb-0">
                                    <span className="text-xs text-gray-400">Document</span>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-2 flex items-center gap-1.5 justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/my-reports/${record.id}`);
                                        }}
                                        className="p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showToast('Download feature coming soon', 'info');
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(record.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen size={28} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No records found</h3>
                        <p className="text-gray-400 text-center max-w-sm mt-1 mb-6 text-sm">
                            Upload your medical prescriptions and reports to keep them organized and safe.
                        </p>
                        <button
                            onClick={() => navigate('/my-reports/add')}
                            className="px-6 py-2.5 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors"
                        >
                            Add First Record
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={20} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Record?</h3>
                        <p className="text-gray-500 text-center text-sm mb-6">This action cannot be undone. The record will be permanently removed.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await handleDelete(showDeleteConfirm);
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ScreenWrapper>
    );
};
