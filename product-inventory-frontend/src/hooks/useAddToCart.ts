// src/hooks/useAddToCart.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { productId: number; quantity: number }) =>
      axios.post('/api/cart/add', payload), // adjust URL if needed

    onSuccess: () => {
      // 🔁 Invalidate cart cache so it refetches
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
