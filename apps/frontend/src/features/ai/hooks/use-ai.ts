import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/features/ai/services/ai.api';
import type { ChatMessageInput } from '@/features/ai/types/ai.types';

export function useAIChat() {
  return useMutation({
    mutationFn: async (payload: { message: string; history: ChatMessageInput[] }) => {
      const response = await aiApi.chat(payload.message, payload.history);
      return response.data;
    },
  });
}

export function useAIAnalyzeStock() {
  return useMutation({
    mutationFn: async (ticker: string) => {
      const response = await aiApi.analyzeStock(ticker);
      return response.data;
    },
  });
}
