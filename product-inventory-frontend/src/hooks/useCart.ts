import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CartItem } from '@/types';

export const useCart = () => {
    return useQuery<CartItem[]>({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await api.get('http://localhost:3001/api/orders/my-cart');
            return res.data;
        }
    })
}