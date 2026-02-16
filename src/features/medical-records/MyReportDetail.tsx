import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, File, Download } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { reportApi } from '../medical-records/services/reportApi';
// Types handled inline

interface ReportValue {
  id: string;
  value: string;
  categoryId: string;
  sectionId: string;
  itemId: string;
  updatedAt?: string;
}

interface ReportData {
  [categoryId: string]: {
    [sectionId: string]: {
      [itemId: string]: any[];
    };
  };
}

export function MyReportDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [reportData, setReportData] = useState<ReportData>({});
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [attachments] = useState<any[]>([]);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    loadReportData();
  }, [categoryId]);

  const loadReportData = async () => {
    try {
      // Loading medical records
      const values = await reportApi.getValuesByUserAndItem(parseInt(categoryId!), parseInt(categoryId!));
      
      // Organize data by hierarchy
      const organized: ReportData = {};
      values.forEach((value: any) => {
        if (!organized[value.categoryId]) {
          organized[value.categoryId] = {};
        }
        if (!organized[value.categoryId][value.sectionId]) {
          organized[value.categoryId][value.sectionId] = {};
        }
        if (!organized[value.categoryId][value.sectionId][value.itemId]) {
          organized[value.categoryId][value.sectionId][value.itemId] = [];
        }
        organized[value.categoryId][value.sectionId][value.itemId].push(value);
      });
      
      setReportData(organized);
    } catch (error: any) {
      showToast(error.message || 'Failed to load medical records', 'error');
      navigate('/my-reports');
    } finally {
      // Done loading
    }
  };

  const handleUpdateValue = async (valueId: string) => {
    try {
      // Updating value
      await reportApi.updateValue(parseInt(valueId), { value: editValue });
      showToast('Value updated successfully', 'success');
      setEditingValueId(null);
      setEditValue('');
      await loadReportData();
    } catch (error: any) {
      showToast(error.message || 'Failed to update value', 'error');
    } finally {
      // Done
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    try {
      // Deleting value
      await reportApi.deleteValue(parseInt(valueId));
      showToast('Value deleted successfully', 'success');
      setShowDeleteConfirm(null);
      await loadReportData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete value', 'error');
    } finally {
      // Done
    }
  };

  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      // Downloading
      await reportApi.downloadAttachment(parseInt(attachmentId));
      showToast('File downloaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to download file', 'error');
    } finally {
      // Done
    }
  };

  const categoryData = categoryId ? reportData[categoryId] : {};

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/my-reports')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-sm text-gray-500 capitalize">Category: {categoryId}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Sections */}
        {Object.keys(categoryData).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(categoryData).map(([sectionId, items]) => (
              <div key={sectionId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-bold text-gray-900 capitalize">{sectionId}</h2>
                </div>

                <div className="divide-y">
                  {Object.entries(items).map(([itemId, values]) => (
                    <div key={itemId} className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 capitalize">{itemId}</h3>
                      
                      <div className="space-y-3">
                        {values.map((value: ReportValue) => (
                          <div key={value.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              {editingValueId === value.id ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                  placeholder="Enter value"
                                />
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-600">Value: <span className="font-semibold text-gray-900">{value.value}</span></p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Updated: {new Date(value.updatedAt || '').toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {editingValueId === value.id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateValue(value.id)}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingValueId(null)}
                                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingValueId(value.id);
                                      setEditValue(value.value);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(value.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No records found for this category</p>
            <button
              onClick={() => navigate('/my-reports/add')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Add Record
            </button>
          </div>
        )}

        {/* Attachments can be added when API provides them */}
        {attachments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attachments</h3>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <File size={20} className="text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round((attachment.fileSize || 0) / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAttachment(attachment.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Download size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/my-reports/add')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Add New Record
          </button>
          <button
            onClick={() => navigate('/my-reports')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-medium"
          >
            Back to Records
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Value?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  await handleDeleteValue(showDeleteConfirm);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
}
