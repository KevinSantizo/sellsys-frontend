export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  is_platform_admin: boolean;
  created_at: string;
  updated_at?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
};