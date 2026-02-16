import type { MedicalRecord, MedicalFolder } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const medicalRecordApi = {
  getFolders: async (): Promise<MedicalFolder[]> => {
    try {
      const response = await backendApi.get<ApiResponse<MedicalFolder[]>>('/medical-records/folders');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch folders');
    }
  },

  getFolderById: async (id: string): Promise<MedicalFolder | null> => {
    try {
      const response = await backendApi.get<ApiResponse<MedicalFolder>>(`/medical-records/folders/${id}`);
      return response.data || null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch folder');
    }
  },

  getRecordsByFolder: async (folderId: string): Promise<MedicalRecord[]> => {
    try {
      const response = await backendApi.get<ApiResponse<MedicalRecord[]>>(`/medical-records/folder/${folderId}`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch records');
    }
  },

  getAllRecords: async (): Promise<MedicalRecord[]> => {
    try {
      const response = await backendApi.get<ApiResponse<MedicalRecord[]>>('/medical-records');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch medical records');
    }
  },

  getRecordById: async (id: string): Promise<MedicalRecord | null> => {
    try {
      const response = await backendApi.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
      return response.data || null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch record');
    }
  },

  createRecord: async (data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    try {
      const response = await backendApi.post<ApiResponse<MedicalRecord>>('/medical-records', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create record');
    }
  },

  updateRecord: async (id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    try {
      const response = await backendApi.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update record');
    }
  },

  deleteRecord: async (id: string): Promise<void> => {
    try {
      await backendApi.delete(`/medical-records/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete record');
    }
  },

  searchRecords: async (query: string): Promise<MedicalRecord[]> => {
    try {
      const response = await backendApi.get<ApiResponse<MedicalRecord[]>>(
        `/medical-records/search?q=${encodeURIComponent(query)}`
      );
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search records');
    }
  },
};
