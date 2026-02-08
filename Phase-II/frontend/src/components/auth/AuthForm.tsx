import React, { useState } from "react";
import { useAuth } from "../services/auth";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  type: "login" | "register";
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "login") {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await register(email, password);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {type === "login"
              ? "Or"
              : "Already have an account? "
            }
            <button
              onClick={() => router.push(type === "login" ? "/register" : "/login")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {type === "login" ? "Sign up instead" : "Sign in instead"}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>

            {type === "register" && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Loading..." : (type === "login" ? "Sign in" : "Create account")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const LoginForm: React.FC = () => {
  return <AuthForm type="login" />;
};

export const RegisterForm: React.FC = () => {
  return <AuthForm type="register" />;
};