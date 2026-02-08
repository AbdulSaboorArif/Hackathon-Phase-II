export interface User {
  id: number;
  email: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
}