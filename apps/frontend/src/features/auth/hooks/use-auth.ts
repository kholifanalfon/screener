import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/services/auth.api';
import { authKeys } from '@/features/auth/auth.keys';
import type { User, LoginPayload, RegisterPayload } from '@/features/auth/types/auth.types';

export function useMe() {
  return useQuery<User | null>({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        return response.data?.user || null;
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache dianggap segar selama 5 menit
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      return authApi.login(payload);
    },
    onSuccess: (data) => {
      // Update cache user aktif secara instan menggunakan query key terpusat
      queryClient.setQueryData(authKeys.me, data.data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      return authApi.register(payload);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Hapus cache user dan bersihkan seluruh state QueryClient
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
    },
  });
}
