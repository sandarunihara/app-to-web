import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const jendoReportApi = {
  getReportsByUserId: async (userId: number): Promise<any[]> => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(`/jendo-reports/user/${userId}`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch reports');
    }
  },

  getReportById: async (id: string): Promise<any | null> => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/jendo-reports/${id}`);
      return response.data || null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch report');
    }
  },

  createReport: async (request: any): Promise<any> => {
    try {
      const response = await backendApi.post<ApiResponse<any>>('/jendo-reports', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create report');
    }
  },

  downloadReport: async (reportId: string, fileName: string): Promise<void> => {
    try {
      const blob = await backendApi.downloadFile(`/jendo-reports/${reportId}/download`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download report');
    }
  },

  deleteReport: async (id: string): Promise<void> => {
    try {
      await backendApi.delete(`/jendo-reports/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete report');
    }
  },
};
