export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string[];
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  name?: string;
  roles: string[];
}
