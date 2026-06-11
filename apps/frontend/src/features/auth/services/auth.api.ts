import { api } from '@/shared/config/axios';
import type { User, LoginPayload, RegisterPayload, AuthApiResponse } from '@/features/auth/types/auth.types';

export const authApi = {
  getMe: async (): Promise<AuthApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<AuthApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  logout: async (): Promise<AuthApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
