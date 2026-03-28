export interface RequestUser {
  id: number;
  email: string;
  role: string;
  token_version: number;
  is_active: boolean;
}