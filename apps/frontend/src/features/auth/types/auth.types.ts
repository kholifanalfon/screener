export interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  fullName?: string;
}

export interface AuthApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}
