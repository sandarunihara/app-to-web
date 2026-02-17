import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useToast } from '../../providers/ToastProvider';
import type { ReportValue } from '../../types/models';

export const EditItemValue: React.FC = () => {
    const navigate = useNavigate();
    const { valueId } = useParams<{ valueId: string }>();
    const location = useLocation();
    const { showToast } = useToast();
    
    const [value, setValue] = useState<ReportValue | null>(location.state?.value || null);
    const [loading, setLoading] = useState(!location.state?.value);
    const [updating, setUpdating] = useState(false);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        valueNumber: '',
        valueText: '',
    });

    useEffect(() => {
        if (!value && valueId) {
            fetchValue();
        } else if (value) {
            setFormData({
                valueNumber: value.valueNumber?.toString() || '',
                valueText: value.valueText || '',
            });
        }
    }, [valueId, value]);

    const fetchValue = async () => {
        try {
            setLoading(true);
            const data = await medicalRecordsApi.getValueById(parseInt(valueId!));
            setValue(data);
            setFormData({
                valueNumber: data.valueNumber?.toString() || '',
                valueText: data.valueText || '',
            });
        } catch (error: any) {
            showToast(error.message || 'Failed to load record', 'error');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        
        // Validate file types
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                showToast(`${file.name} is not a valid file type. Only JPG, PNG, and PDF are allowed.`, 'error');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                showToast(`${file.name} is too large. Maximum file size is 10MB.`, 'error');
                return false;
            }
            return true;
        });

        setNewFiles(prev => [...prev, ...validFiles]);
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingAttachment = async (attachmentId: number) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.valueNumber && !formData.valueText) {
            showToast('Please enter either a numeric value or text', 'error');
            return;
        }

        try {
            setUpdating(true);

            // Build payload with only defined values
            const valueData: any = {
                reportItemId: value!.reportItemId,
                userId: value!.userId,
                valueDate: value!.valueDate,
            };

            // Only include valueNumber if it has a value
            if (formData.valueNumber) {
                valueData.valueNumber = parseFloat(formData.valueNumber);
            }

            // Only include valueText if it has a value
            if (formData.valueText) {
                valueData.valueText = formData.valueText;
            }

            // Update the value
            await medicalRecordsApi.updateValue(parseInt(valueId!), valueData);

            // Add new attachments if any
            for (const file of newFiles) {
                await medicalRecordsApi.addAttachment(parseInt(valueId!), file);
            }

            showToast('Record updated successfully', 'success');
            navigate(-1);
        } catch (error: any) {
            showToast(error.message || 'Failed to update record', 'error');
        } finally {
            setUpdating(false);
        }
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
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Record</h1>
                    <p className="text-gray-600 mb-6">{value.reportItemName}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Value Number Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numeric Value (optional)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.valueNumber}
                                onChange={(e) => setFormData({ ...formData, valueNumber: e.target.value })}
                                placeholder="Enter numeric value"
                            />
                        </div>

                        {/* Value Text Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (optional)
                            </label>
                            <textarea
                                value={formData.valueText}
                                onChange={(e) => setFormData({ ...formData, valueText: e.target.value })}
                                placeholder="Enter any notes or text value"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Existing Attachments */}
                        {value.attachments && value.attachments.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Attachments
                                </label>
                                <div className="space-y-2">
                                    {value.attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                                    {attachment.fileUrl.split('/').pop()}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExistingAttachment(attachment.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Attachments Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add New Attachments (optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    JPG, PNG, or PDF (max. 10MB each)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload-edit"
                                />
                                <label htmlFor="file-upload-edit">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        onClick={() => document.getElementById('file-upload-edit')?.click()}
                                    >
                                        Select Files
                                    </button>
                                </label>
                            </div>

                            {/* New Files Preview */}
                            {newFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {newFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-purple-600" />
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                title="Cancel"
                                mode="outlined"
                                onPress={() => navigate(-1)}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                title={updating ? 'Updating...' : 'Update Record'}
                                mode="contained"
                                disabled={updating}
                                className="flex-1"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </ScreenWrapper>
    );
};
