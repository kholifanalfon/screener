import { api } from '@/shared/config/axios';
import type { ChatMessageInput, AIChatResponse, AIAnalyzeResponse } from '@/features/ai/types/ai.types';

export const aiApi = {
  chat: async (message: string, history: ChatMessageInput[] = []): Promise<AIChatResponse> => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },

  analyzeStock: async (ticker: string): Promise<AIAnalyzeResponse> => {
    const response = await api.post(`/ai/analyze/${ticker}`);
    return response.data;
  },
};
