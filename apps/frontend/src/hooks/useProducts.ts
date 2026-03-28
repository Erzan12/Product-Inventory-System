import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ProductResponse {
  data: any[]; // You can define a strict Product interface later based on your Swagger output
  meta: {
    totalItems: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export function useProducts(params?: { category?: string; search?: string; page?: number, limit?: number; }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductResponse>('/products', {
        params: {
          category: params?.category,
          search: params?.search,
          page: params?.page,
        },
      });
      return data;
    },
  });
}