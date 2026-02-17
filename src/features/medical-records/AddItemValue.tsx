import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { medicalRecordsApi } from './services/medicalRecordsApi';
import { useToast } from '../../providers/ToastProvider';
import { useAuth } from '../../providers/AuthProvider';
import type { ReportItem, ReportSection, ReportCategory } from '../../types/models';

export const AddItemValue: React.FC = () => {
    const navigate = useNavigate();
    const { itemId } = useParams<{ itemId: string }>();
    const location = useLocation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const item = location.state?.item as ReportItem | undefined;
    const section = location.state?.section as ReportSection | undefined;
    const category = location.state?.category as ReportCategory | undefined;

    const [formData, setFormData] = useState({
        valueNumber: '',
        valueText: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(file => {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                const maxSize = 10 * 1024 * 1024; // 10MB

                if (!validTypes.includes(file.type)) {
                    showToast(`${file.name} is not a valid file type`, 'error');
                    return false;
                }
                if (file.size > maxSize) {
                    showToast(`${file.name} exceeds 10MB limit`, 'error');
                    return false;
                }
                return true;
            });
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            showToast('User not authenticated', 'error');
            return;
        }

        if (!formData.valueNumber && !formData.valueText) {
            showToast('Please enter a value', 'error');
            return;
        }

        try {
            setUploading(true);

            // Build payload with only defined values
            const valueData: any = {
                reportItemId: parseInt(itemId!),
                userId: Number(user.id),
                valueDate: new Date().toISOString().split('T')[0],
            };

            // Only include valueNumber if it has a value
            if (formData.valueNumber) {
                valueData.valueNumber = parseFloat(formData.valueNumber);
            }

            // Only include valueText if it has a value
            if (formData.valueText) {
                valueData.valueText = formData.valueText;
            }

            // Step 1: Create the value (without attachments)
            const createdValue = await medicalRecordsApi.createValue(valueData);

            // Step 2: Upload attachments one by one (if any)
            if (files.length > 0 && createdValue?.id) {
                for (const file of files) {
                    await medicalRecordsApi.addAttachment(Number(createdValue.id), file);
                }
            }

            showToast('Record added successfully', 'success');
            navigate(`/my-reports/item/${itemId}`, { state: { item, section, category } });
        } catch (error: any) {
            showToast(error.message || 'Failed to add record', 'error');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon size={20} />;
        }
        return <FileText size={20} />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <ScreenWrapper>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate(`/my-reports/item/${itemId}`, {
                            state: { item, section, category }
                        })}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Records</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Add New {item?.name || 'Record'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter the value, add notes, and attach any supporting documents
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                        {/* Numeric Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numeric Value
                            </label>
                            <Input
                                type="number"
                                name="valueNumber"
                                value={formData.valueNumber}
                                onChange={handleInputChange}
                                placeholder="Enter numeric value (e.g., 25)"
                                step="0.01"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter the measurement or test result
                            </p>
                        </div>

                        {/* Text/Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="valueText"
                                value={formData.valueText}
                                onChange={handleInputChange}
                                placeholder="Add any notes or observations..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachments
                            </label>
                            <div className="space-y-3">
                                {/* Upload Button */}
                                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                                    <Upload size={20} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Upload images or PDF
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                </label>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="text-gray-500">
                                                    {getFileIcon(file)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Supported formats: JPG, PNG, PDF (Max 10MB each)
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/my-reports/item/${itemId}`, {
                                state: { item, section, category }
                            })}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </ScreenWrapper>
    );
};
