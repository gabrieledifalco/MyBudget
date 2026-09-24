export type ProfileType = 'INDIVIDUAL' | 'FAMILY';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileType: ProfileType;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  firstName: string;
  lastName: string;
  profileType: ProfileType;
}
