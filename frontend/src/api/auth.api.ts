import { api, tokenStorage } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  tokenStorage.set(data.token);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  tokenStorage.set(data.token);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export function logout(): void {
  tokenStorage.clear();
}
