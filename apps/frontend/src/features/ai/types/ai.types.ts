export interface ChatMessageInput {
  role: 'user' | 'model';
  parts: string;
}

export interface AIChatResponse {
  status: 'success' | 'error';
  data: {
    reply: string;
  };
}

export interface AIAnalyzeResponse {
  status: 'success' | 'error';
  data: {
    analysis: string;
  };
}
