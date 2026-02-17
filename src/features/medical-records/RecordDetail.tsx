import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash2, FileText, Edit } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useToast } from '../../providers/ToastProvider';
import type { ReportValue } from '../../types/models';

export const RecordDetail: React.FC = () => {
    const navigate = useNavigate();
    const { valueId } = useParams<{ valueId: string }>();
    const { showToast } = useToast();
    const [value, setValue] = useState<ReportValue | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (valueId) {
            fetchValue();
        }
    }, [valueId]);

    const fetchValue = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordsApi.getValueById(parseInt(valueId!));
            setValue(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to load record', 'error');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);
            await medicalRecordsApi.deleteValue(parseInt(valueId!));
            showToast('Record deleted successfully', 'success');
            navigate(-1);
        } catch (error: any) {
            showToast(error.message || 'Failed to delete record', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        try {
            await medicalRecordsApi.deleteAttachment(attachmentId);
            showToast('Attachment deleted successfully', 'success');
            // Refresh the value
            fetchValue();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete attachment', 'error');
        }
    };

    const handleDownload = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    };

    const handleViewAttachment = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </ScreenWrapper>
        );
    }

    if (!value) {
        return (
            <ScreenWrapper>
                <div className="text-center py-12">
                    <p className="text-gray-500">Record not found</p>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Items</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Record Details</h1>
                    <p className="text-sm text-gray-500 mt-1">{value.reportItemName}</p>
                </div>

                {/* Date and Time */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Recorded
                            </label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                                {formatDate(value.valueDate)}
                            </p>
                            <p className="text-sm text-gray-500">
                                at {formatTime(value.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Value */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                    </label>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                        {value.valueNumber !== null && value.valueNumber !== undefined
                            ? value.valueNumber
                            : value.valueText || 'N/A'}
                    </p>
                </div>

                {/* Notes */}
                {value.valueText && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                        </label>
                        <p className="text-gray-900 mt-2">{value.valueText}</p>
                    </div>
                )}

                {/* Attachments */}
                {value.attachments && value.attachments.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Attachments ({value.attachments.length})
                        </h3>
                        <div className="space-y-3">
                            {value.attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between p-4 bg-purple-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm truncate max-w-xs">
                                                {attachment.fileUrl.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-gray-500">{attachment.fileType}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewAttachment(attachment.fileUrl)}
                                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(attachment.fileUrl)}
                                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAttachment(attachment.id)}
                                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Last Updated */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <p className="text-sm text-gray-500">
                        Last updated: {formatDate(value.updatedAt)} at {formatTime(value.updatedAt)}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        title="Edit"
                        mode="contained"
                        onPress={() => navigate(`/my-reports/edit/${valueId}`, { state: { value } })}
                        className="flex-1"
                        icon={<Edit className="w-5 h-5" />}
                    />
                    <Button
                        title={deleting ? 'Deleting...' : 'Delete'}
                        mode="outlined"
                        onPress={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                        icon={<Trash2 className="w-5 h-5" />}
                    />
                </div>
            </div>
        </ScreenWrapper>
    );
};
