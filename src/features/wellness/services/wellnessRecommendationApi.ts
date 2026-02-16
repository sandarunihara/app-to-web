import { backendApi } from '../../../services/backendApi';
import { ENDPOINTS } from '../../../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const wellnessRecommendationApi = {
  getByRiskLevel: async (riskLevel: string) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(
        ENDPOINTS.WELLNESS.BY_RISK_LEVEL(riskLevel.toUpperCase())
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching wellness recommendations:', error);
      return [];
    }
  },

  getForUser: async (userId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any[]>>(
        ENDPOINTS.WELLNESS.FOR_USER(userId)
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching user recommendations:', error);
      return [];
    }
  },

  getDailyAiTipsForUser: async (userId: number) => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(
        ENDPOINTS.WELLNESS.DAILY_AI_TIPS(userId)
      );
      return response.data || {};
    } catch (error: any) {
      console.error('Error fetching daily tips:', error);
      return {};
    }
  },
};
