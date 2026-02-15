import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const data = await response.json();
          const token = data.access_token;

          // Store token
          if (token) {
            localStorage.setItem("token", token);
            set({ token, isAuthenticated: true });
          }

          // Fetch user info
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            set({
              user: {
                id: userData.id,
                email: userData.email,
              },
              isAuthenticated: true
            });
          }
        } catch (error) {
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error("Registration failed");
          }

          const data = await response.json();
          const token = data.access_token;

          // Store token
          if (token) {
            localStorage.setItem("token", token);
            set({ token, isAuthenticated: true });
          }

          // Fetch user info
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            set({
              user: {
                id: userData.id,
                email: userData.email,
              },
              isAuthenticated: true
            });
          }
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        if (token) {
          localStorage.setItem("token", token);
          set({ token, isAuthenticated: true });
        } else {
          localStorage.removeItem("token");
          set({ token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true, // Skip hydration to prevent SSR issues
    }
  )
);

// Export individual selectors to avoid creating new objects on every render
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};