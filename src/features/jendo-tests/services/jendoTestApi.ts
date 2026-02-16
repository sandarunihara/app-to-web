import type { JendoTest, RiskLevel } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

const mapRiskLevel = (level: string): RiskLevel => {
  switch (level?.toUpperCase()) {
    case 'LOW': return 'low';
    case 'MODERATE': return 'moderate';
    case 'HIGH': return 'high';
    default: return 'low';
  }
};

const parseBloodPressure = (bp: string): { systolic: number; diastolic: number } => {
  const [systolic, diastolic] = (bp || '0/0').split('/').map(Number);
  return { systolic: systolic || 0, diastolic: diastolic || 0 };
};

export const jendoTestApi = {
  getAllTests: async (page = 0, size = 100): Promise<JendoTest[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/jendo-tests?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: String(dto.id),
        userId: String(dto.userId),
        userName: dto.userName || '',
        testDate: dto.testDate,
        testTime: dto.testTime || '00:00:00',
        riskLevel: mapRiskLevel(dto.riskLevel),
        score: Number(dto.score) || 0,
        heartRate: Number(dto.heartRate) || 0,
        bloodPressure: dto.bloodPressure || '0/0',
        bloodPressureSystolic: parseBloodPressure(dto.bloodPressure).systolic,
        bloodPressureDiastolic: parseBloodPressure(dto.bloodPressure).diastolic,
        spo2: dto.spo2,
        ecgData: dto.ecgData,
        analysis: dto.analysis,
        suggestions: dto.suggestions || [],
        createdAt: dto.createdAt,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tests');
    }
  },

  getTestsByUserId: async (userId: number, page = 0, size = 100): Promise<JendoTest[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/jendo-tests/user/${userId}?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: String(dto.id),
        userId: String(dto.userId),
        userName: dto.userName || '',
        testDate: dto.testDate,
        testTime: dto.testTime || '00:00:00',
        riskLevel: mapRiskLevel(dto.riskLevel),
        score: Number(dto.score) || 0,
        heartRate: Number(dto.heartRate) || 0,
        bloodPressure: dto.bloodPressure || '0/0',
        bloodPressureSystolic: parseBloodPressure(dto.bloodPressure).systolic,
        bloodPressureDiastolic: parseBloodPressure(dto.bloodPressure).diastolic,
        spo2: dto.spo2,
        ecgData: dto.ecgData,
        analysis: dto.analysis,
        suggestions: dto.suggestions || [],
        createdAt: dto.createdAt,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user tests');
    }
  },

  getTestById: async (id: string): Promise<JendoTest | null> => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/jendo-tests/${id}`);
      const dto = response.data;
      return {
        id: String(dto.id),
        userId: String(dto.userId),
        userName: dto.userName || '',
        testDate: dto.testDate,
        testTime: dto.testTime || '00:00:00',
        riskLevel: mapRiskLevel(dto.riskLevel),
        score: Number(dto.score) || 0,
        heartRate: Number(dto.heartRate) || 0,
        bloodPressure: dto.bloodPressure || '0/0',
        bloodPressureSystolic: parseBloodPressure(dto.bloodPressure).systolic,
        bloodPressureDiastolic: parseBloodPressure(dto.bloodPressure).diastolic,
        spo2: dto.spo2,
        ecgData: dto.ecgData,
        analysis: dto.analysis,
        suggestions: dto.suggestions || [],
        createdAt: dto.createdAt,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch test');
    }
  },

  getTestsByDateRange: async (userId: number, startDate: string, endDate: string): Promise<JendoTest[]> => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(
        `/jendo-tests/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      const data = response.data || [];
      return data.map((dto: any) => ({
        id: String(dto.id),
        userId: String(dto.userId),
        userName: dto.userName || '',
        testDate: dto.testDate,
        testTime: dto.testTime || '00:00:00',
        riskLevel: mapRiskLevel(dto.riskLevel),
        score: Number(dto.score) || 0,
        heartRate: Number(dto.heartRate) || 0,
        bloodPressure: dto.bloodPressure || '0/0',
        bloodPressureSystolic: parseBloodPressure(dto.bloodPressure).systolic,
        bloodPressureDiastolic: parseBloodPressure(dto.bloodPressure).diastolic,
        spo2: dto.spo2,
        ecgData: dto.ecgData,
        analysis: dto.analysis,
        suggestions: dto.suggestions || [],
        createdAt: dto.createdAt,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tests by date range');
    }
  },

  createTest: async (data: any): Promise<JendoTest> => {
    try {
      const response = await backendApi.post<ApiResponse<any>>('/jendo-tests', data);
      const dto = response.data;
      return {
        id: String(dto.id),
        userId: String(dto.userId),
        userName: dto.userName || '',
        testDate: dto.testDate,
        testTime: dto.testTime || '00:00:00',
        riskLevel: mapRiskLevel(dto.riskLevel),
        score: Number(dto.score) || 0,
        heartRate: Number(dto.heartRate) || 0,
        bloodPressure: dto.bloodPressure || '0/0',
        bloodPressureSystolic: parseBloodPressure(dto.bloodPressure).systolic,
        bloodPressureDiastolic: parseBloodPressure(dto.bloodPressure).diastolic,
        spo2: dto.spo2,
        ecgData: dto.ecgData,
        analysis: dto.analysis,
        suggestions: dto.suggestions || [],
        createdAt: dto.createdAt,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create test');
    }
  },

  updateTest: async (id: string, data: any): Promise<JendoTest> => {
    try {
      const response = await backendApi.put<ApiResponse<any>>(`/jendo-tests/${id}`, data);
      const dto = response.data;
      return {
        id: String(dto.id),
        userId: String(dto.userId),
        userName: dto.userName || '',
        testDate: dto.testDate,
        testTime: dto.testTime || '00:00:00',
        riskLevel: mapRiskLevel(dto.riskLevel),
        score: Number(dto.score) || 0,
        heartRate: Number(dto.heartRate) || 0,
        bloodPressure: dto.bloodPressure || '0/0',
        bloodPressureSystolic: parseBloodPressure(dto.bloodPressure).systolic,
        bloodPressureDiastolic: parseBloodPressure(dto.bloodPressure).diastolic,
        spo2: dto.spo2,
        ecgData: dto.ecgData,
        analysis: dto.analysis,
        suggestions: dto.suggestions || [],
        createdAt: dto.createdAt,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update test');
    }
  },

  deleteTest: async (id: string): Promise<void> => {
    try {
      await backendApi.delete(`/jendo-tests/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete test');
    }
  },
};
