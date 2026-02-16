import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const reportApi = {
  getCategories: async () => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>('/reports/categories');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  getCategoryById: async (id: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/reports/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch category');
    }
  },

  getCategoryWithSections: async (id: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/reports/categories/${id}/sections`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch category sections');
    }
  },

  getSectionsByCategory: async (categoryId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(`/reports/categories/${categoryId}/sections`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sections');
    }
  },

  getSectionWithItems: async (sectionId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/reports/sections/${sectionId}/items`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch section items');
    }
  },

  getItemsBySection: async (sectionId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(`/reports/sections/${sectionId}/items`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch items');
    }
  },

  getValuesByUser: async (userId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(`/reports/values/user/${userId}`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch values');
    }
  },

  getValuesByItem: async (itemId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(`/reports/values/item/${itemId}`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch item values');
    }
  },

  getValuesByUserAndItem: async (userId: number, itemId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(`/reports/values/user/${userId}/item/${itemId}`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch values');
    }
  },

  createValue: async (data: any) => {
    try {
      const response = await backendApi.post<ApiResponse<any>>('/reports/values', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create value');
    }
  },

  updateValue: async (id: number, data: any) => {
    try {
      const response = await backendApi.put<ApiResponse<any>>(`/reports/values/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update value');
    }
  },

  deleteValue: async (id: number) => {
    try {
      await backendApi.delete(`/reports/values/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete value');
    }
  },

  uploadAttachment: async (valueId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await backendApi.post<ApiResponse<any>>(
        `/reports/values/${valueId}/attachments`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload attachment');
    }
  },

  downloadAttachment: async (attachmentId: number, fileName?: string) => {
    try {
      const blob = await backendApi.downloadFile(`/reports/attachments/${attachmentId}/download`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `attachment-${attachmentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download attachment');
    }
  },

  deleteAttachment: async (attachmentId: number) => {
    try {
      await backendApi.delete(`/reports/attachments/${attachmentId}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete attachment');
    }
  },
};
