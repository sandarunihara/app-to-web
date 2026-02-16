import type { TestStatistics, RiskLevel } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface DashboardData {
  currentRiskLevel: RiskLevel;
  lastTestDate: string;
  lastTestScore: number;
  upcomingAppointment?: {
    doctorName: string;
    date: string;
    type: string;
  };
  healthTips: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  recentTests: Array<{
    date: string;
    score: number;
    riskLevel: RiskLevel;
  }>;
}

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await backendApi.get<ApiResponse<DashboardData>>('/dashboard');
      return response.data || {
        currentRiskLevel: 'low',
        lastTestDate: new Date().toISOString(),
        lastTestScore: 0,
        healthTips: [],
        recentTests: [],
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }
  },

  getTestStatistics: async (): Promise<TestStatistics> => {
    try {
      const response = await backendApi.get<ApiResponse<TestStatistics>>('/dashboard/statistics');
      return response.data || {
        totalTests: 0,
        averageScore: 0,
        lastTestDate: new Date().toISOString(),
        riskTrend: 'stable',
        testHistory: [],
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch statistics');
    }
  },

  getQuickActions: async () => {
    try {
      const response = await backendApi.get<ApiResponse<any>>('/dashboard/quick-actions');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch quick actions');
    }
  },
};
