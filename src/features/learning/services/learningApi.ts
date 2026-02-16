import { backendApi } from '../../../services/backendApi';
import type { LearningMaterial } from '../../../types/models';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface PaginationResponse<T> {
  content: T[];
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
}

export const learningApi = {
  getAllMaterials: async (page = 0, size = 50): Promise<LearningMaterial[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/learning-materials?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        type: dto.type,
        contentUrl: dto.contentUrl,
        duration: dto.duration,
        author: dto.author,
        publishedAt: dto.publishedAt,
        thumbnailUrl: dto.thumbnailUrl,
        viewCount: dto.viewCount || 0,
        isFeatured: dto.isFeatured || false,
        content: dto.content,
        videoUrl: dto.videoUrl,
      })) as LearningMaterial[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch learning materials');
    }
  },

  getMaterialById: async (id: string): Promise<LearningMaterial> => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(
        `/learning-materials/${id}`
      );
      const dto = response.data || response;
      return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        type: dto.type,
        contentUrl: dto.contentUrl,
        duration: dto.duration,
        author: dto.author,
        publishedAt: dto.publishedAt,
        thumbnailUrl: dto.thumbnailUrl,
        viewCount: dto.viewCount || 0,
        isFeatured: dto.isFeatured || false,
        content: dto.content,
        videoUrl: dto.videoUrl,
      } as LearningMaterial;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch learning material');
    }
  },

  getMaterialsByCategory: async (category: string, page = 0, size = 50): Promise<LearningMaterial[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/learning-materials/category/${category}?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        type: dto.type,
        contentUrl: dto.contentUrl,
        duration: dto.duration,
        author: dto.author,
        publishedAt: dto.publishedAt,
        thumbnailUrl: dto.thumbnailUrl,
        viewCount: dto.viewCount || 0,
        isFeatured: dto.isFeatured || false,
        content: dto.content,
        videoUrl: dto.videoUrl,
      } as LearningMaterial));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch materials by category');
    }
  },

  searchMaterials: async (query: string, page = 0, size = 50): Promise<LearningMaterial[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/learning-materials/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        type: dto.type,
        contentUrl: dto.contentUrl,
        duration: dto.duration,
        author: dto.author,
        publishedAt: dto.publishedAt,
        thumbnailUrl: dto.thumbnailUrl,
        viewCount: dto.viewCount || 0,
        isFeatured: dto.isFeatured || false,
        content: dto.content,
        videoUrl: dto.videoUrl,
      } as LearningMaterial));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search materials');
    }
  },

  getFeaturedMaterials: async (): Promise<LearningMaterial[]> => {
    try {
      const response = await backendApi.get<ApiResponse<LearningMaterial[]>>(
        '/learning-materials/featured'
      );
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch featured materials');
    }
  },
};
