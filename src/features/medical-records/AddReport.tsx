import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../providers/ToastProvider';
import { reportApi } from '../medical-records/services/reportApi';
import { medicalRecordApi } from '../medical-records/services/medicalRecordApi';
// State management removed

interface FormData {
  categoryId: string;
  sectionId: string;
  itemId: string;
  value: string;
}

export function AddReport() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    sectionId: '',
    itemId: '',
    value: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial categories/folders
  React.useEffect(() => {
    const loadFolders = async () => {
      try {
        setLoadingFolders(true);
        const folders = await medicalRecordApi.getFolders();
        setCategories(folders);
      } catch (error: any) {
        showToast('Failed to load categories', 'error');
      } finally {
        setLoadingFolders(false);
      }
    };
    loadFolders();
  }, []);

  // Load sections when category changes
  const handleCategoryChange = async (categoryId: string) => {
    setFormData({ ...formData, categoryId, sectionId: '', itemId: '' });
    setSections([]);
    setItems([]);

    if (!categoryId) return;

    try {
      // Loading sections
      const folderRecords = await medicalRecordApi.getRecordsByFolder(categoryId);
      setSections(folderRecords);
    } catch (error: any) {
      showToast('Failed to load sections', 'error');
    } finally {
      // Done
    }
  };

  // Load items when section changes
  const handleSectionChange = async (sectionId: string) => {
    setFormData({ ...formData, sectionId, itemId: '' });
    setItems([]);

    if (!sectionId) return;

    try {
      // Loading items
      // In a real app, you'd fetch items from the service
      // For now, we'll assume items are part of the section structure
      const mockItems = [
        { id: 'item1', name: 'Weight' },
        { id: 'item2', name: 'Height' },
        { id: 'item3', name: 'Blood Sugar' },
      ];
      setItems(mockItems);
    } catch (error: any) {
      showToast('Failed to load items', 'error');
    } finally {
      // Done
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalSize = files.reduce((acc, f) => acc + f.size, 0) + newFiles.reduce((acc, f) => acc + f.size, 0);

    if (totalSize > 50 * 1024 * 1024) {
      showToast('Total file size cannot exceed 50MB', 'error');
      return;
    }

    setFiles([...files, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.sectionId) newErrors.sectionId = 'Section is required';
    if (!formData.itemId) newErrors.itemId = 'Item is required';
    if (!formData.value.trim()) newErrors.value = 'Value is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Loading state

      // Create the value entry
      const valueData = {
        categoryId: formData.categoryId,
        sectionId: formData.sectionId,
        itemId: formData.itemId,
        value: formData.value,
      };

      const createdValue = await reportApi.createValue(valueData);

      // Upload attachments if any
      if (files.length > 0) {
        for (const file of files) {
          await reportApi.uploadAttachment(createdValue.id, file);
        }
      }

      showToast('Record added successfully', 'success');
      navigate(`/my-reports/${formData.categoryId}`);
    } catch (error: any) {
      showToast(error.message || 'Failed to add record', 'error');
    } finally {
      // Done loading
    }
  };

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/my-reports')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add Medical Record</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loadingFolders}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          {/* Section Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!formData.categoryId || sections.length === 0}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
            {errors.sectionId && <p className="text-red-500 text-sm mt-1">{errors.sectionId}</p>}
          </div>

          {/* Item Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              disabled={!formData.sectionId || items.length === 0}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.itemId && <p className="text-red-500 text-sm mt-1">{errors.itemId}</p>}
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Value <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter the value (e.g., 75 kg, 5.8 ft)"
              className="w-full"
            />
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-input"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label
              htmlFor="file-input"
              className="flex flex-col items-center cursor-pointer hover:border-blue-500 transition"
            >
              <Upload size={32} className="text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">Click to upload attachments</p>
              <p className="text-xs text-gray-500 mt-1">PDF, images, or documents up to 50MB total</p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-900">{files.length} file(s) selected</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm text-gray-600 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Add Record
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ScreenWrapper>
  );
}
