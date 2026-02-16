import type { WellnessTip, LearningMaterial, WellnessCategory, ChatMessage, WellnessRecommendation } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';
import { ENDPOINTS } from '../../../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const wellnessApi = {
  getTips: async (category?: WellnessCategory): Promise<WellnessTip[]> => {
    try {
      const url = category 
        ? ENDPOINTS.WELLNESS.TIPS_BY_CATEGORY(category)
        : ENDPOINTS.WELLNESS.TIPS;
      const response = await backendApi.get<ApiResponse<WellnessTip[]>>(url);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch wellness tips');
    }
  },

  getTipById: async (id: string): Promise<WellnessTip | null> => {
    try {
      const response = await backendApi.get<ApiResponse<WellnessTip>>(
        ENDPOINTS.WELLNESS.TIP_DETAIL(id)
      );
      return response.data || null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tip');
    }
  },

  getLearningMaterials: async (category?: WellnessCategory): Promise<LearningMaterial[]> => {
    try {
      const url = category 
        ? ENDPOINTS.WELLNESS.LEARNING_BY_CATEGORY(category)
        : ENDPOINTS.WELLNESS.LEARNING_MATERIALS;
      const response = await backendApi.get<ApiResponse<LearningMaterial[]>>(url);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch learning materials');
    }
  },

  getFeaturedMaterials: async (): Promise<LearningMaterial[]> => {
    try {
      const response = await backendApi.get<ApiResponse<LearningMaterial[]>>(
        ENDPOINTS.WELLNESS.FEATURED_MATERIALS
      );
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch featured materials');
    }
  },

  getMaterialById: async (id: string): Promise<LearningMaterial | null> => {
    try {
      const response = await backendApi.get<ApiResponse<LearningMaterial>>(
        ENDPOINTS.WELLNESS.LEARNING_MATERIAL_DETAIL(id)
      );
      return response.data || null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch material');
    }
  },

  getRecommendations: async (riskLevel?: string): Promise<WellnessRecommendation[]> => {
    try {
      const url = riskLevel 
        ? ENDPOINTS.WELLNESS.BY_RISK_LEVEL(riskLevel.toUpperCase())
        : ENDPOINTS.WELLNESS.RECOMMENDATIONS;
      const response = await backendApi.get<ApiResponse<WellnessRecommendation[]>>(url);
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch recommendations');
    }
  },

  sendChatMessage: async (message: string, history?: { role: string; content: string }[]): Promise<ChatMessage> => {
    try {
      const response = await backendApi.post<ApiResponse<ChatMessage>>(
        ENDPOINTS.WELLNESS.CHAT,
        {
          message,
          history: history || [],
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I am having trouble responding. Please try again later.',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
