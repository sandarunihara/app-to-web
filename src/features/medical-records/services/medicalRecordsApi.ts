import type { ReportCategory, ReportSection, ReportItem, ReportValue, ReportValueRequest } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const medicalRecordsApi = {
  // Get all report categories
  getCategories: async (): Promise<ReportCategory[]> => {
    try {
      const response = await backendApi.get<ApiResponse<ReportCategory[]>>('/report-categories');
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  // Get all report sections
  getSections: async (): Promise<ReportSection[]> => {
    try {
      const response = await backendApi.get<ApiResponse<ReportSection[]>>('/report-sections');
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sections');
    }
  },

  // Get sections by category ID (client-side filter)
  getSectionsByCategory: async (categoryId: number): Promise<ReportSection[]> => {
    try {
      const allSections = await medicalRecordsApi.getSections();
      return allSections.filter(section => section.categoryId === categoryId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sections');
    }
  },

  // Get all report items
  getItems: async (): Promise<ReportItem[]> => {
    try {
      const response = await backendApi.get<ApiResponse<ReportItem[]>>('/report-items');
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch items');
    }
  },

  // Get items by section ID (client-side filter)
  getItemsBySection: async (sectionId: number): Promise<ReportItem[]> => {
    try {
      const allItems = await medicalRecordsApi.getItems();
      return allItems.filter(item => item.sectionId === sectionId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch items');
    }
  },

  // Get report item by ID
  getItemById: async (itemId: number): Promise<ReportItem> => {
    try {
      const response = await backendApi.get<ApiResponse<ReportItem>>(`/report-items/${itemId}`);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch item');
    }
  },

  // Get all values for a report item
  getItemValues: async (itemId: number, userId: number): Promise<ReportValue[]> => {
    try {
      const response = await backendApi.get<ApiResponse<ReportValue[]>>(`/report-values/user/${userId}`);
      const allValues = response.data || response;
      // Filter by itemId on the frontend
      return allValues.filter(value => value.reportItemId === itemId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch item values');
    }
  },

  // Create report value (without attachments)
  createValue: async (valueData: ReportValueRequest): Promise<ReportValue> => {
    try {
      const response = await backendApi.post<ApiResponse<ReportValue>>('/report-values', valueData);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create value');
    }
  },

  // Create report value with attachments
  createValueWithAttachments: async (valueData: ReportValueRequest, files: File[]): Promise<ReportValue> => {
    try {
      const formData = new FormData();
      // Send 'value' as a JSON Blob so Spring Boot @RequestPart can deserialize it
      const valueBlob = new Blob([JSON.stringify(valueData)], { type: 'application/json' });
      formData.append('value', valueBlob);
      files.forEach(file => {
        formData.append('files', file);
      });

      // Don't set Content-Type manually — the browser needs to set it with the correct boundary
      const response = await backendApi.post<ApiResponse<ReportValue>>('/report-values/with-attachments', formData, {
        headers: {
          'Content-Type': undefined as any,
        },
      });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create value with attachments');
    }
  },

  // Add attachment to existing value
  addAttachment: async (valueId: number, file: File): Promise<ReportValue> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await backendApi.post<ApiResponse<ReportValue>>(`/report-values/${valueId}/attachments`, formData);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add attachment');
    }
  },

  // Get value by ID
  getValueById: async (valueId: number): Promise<ReportValue> => {
    try {
      const response = await backendApi.get<ApiResponse<ReportValue>>(`/report-values/${valueId}`);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch value');
    }
  },

  // Update value
  updateValue: async (valueId: number, valueData: ReportValueRequest): Promise<ReportValue> => {
    try {
      const response = await backendApi.put<ApiResponse<ReportValue>>(`/report-values/${valueId}`, valueData);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update value');
    }
  },

  // Delete value
  deleteValue: async (valueId: number): Promise<void> => {
    try {
      await backendApi.delete(`/report-values/${valueId}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete value');
    }
  },

  // Delete attachment
  deleteAttachment: async (attachmentId: number): Promise<void> => {
    try {
      await backendApi.delete(`/report-values/attachments/${attachmentId}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete attachment');
    }
  },

  // Get download URL for attachment
  getAttachmentDownloadUrl: (attachmentId: number): string => {
    return `/api/report-values/attachments/${attachmentId}/download`;
  },
};
