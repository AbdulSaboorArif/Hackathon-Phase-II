const getApiBaseUrl = () => {
  // Use environment variable if set (production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback for local development
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper to get auth headers
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async get(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
         ...(getAuthHeaders() as HeadersInit),
         ...(options.headers as HeadersInit),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async post(endpoint: string, data: any, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         ...(getAuthHeaders() as HeadersInit),
         ...(options.headers as HeadersInit),
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async put(endpoint: string, data: any, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
         ...(getAuthHeaders() as HeadersInit),
         ...(options.headers as HeadersInit),
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async patch(endpoint: string, data: any, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeaders() as HeadersInit),
        ...(options.headers as HeadersInit),
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async delete(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
         ...(getAuthHeaders() as HeadersInit),
         ...(options.headers as HeadersInit),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },
};

export const authAPI = {
  async login(email: string, password: string) {
    return api.post("/auth/login", { email, password });
  },

  async register(email: string, password: string) {
    return api.post("/auth/register", { email, password });
  },

  async getCurrentUser() {
    return api.get("/auth/user");
  },
};

export const tasksAPI = {
  async getTasks() {
    return api.get("/tasks");
  },

  async getTask(id: number) {
    return api.get(`/tasks/${id}`);
  },

  async createTask(task: { title: string; description?: string }) {
    return api.post("/tasks", task);
  },

  async updateTask(id: number, task: { title?: string; description?: string; is_completed?: boolean }) {
    return api.put(`/tasks/${id}`, task);
  },

  async deleteTask(id: number) {
    return api.delete(`/tasks/${id}`);
  },

  async completeTask(id: number) {
    return api.patch(`/tasks/${id}/complete`, {});
  },

  async incompleteTask(id: number) {
    return api.patch(`/tasks/${id}/incomplete`, {});
  },
};