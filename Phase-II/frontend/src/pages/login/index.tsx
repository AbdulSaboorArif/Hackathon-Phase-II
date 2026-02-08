import { AuthForm } from "../../components/auth/AuthForm";
import { AuthProvider } from "../../components/auth/AuthProvider";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    setLoading(true);
    // Redirect to dashboard after successful login
    window.location.href = "/dashboard";
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-full px-4">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
              Welcome back!
            </h1>

            <AuthForm
              type="login"
              onSuccess={handleSuccess}
            />

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?
                <a
                  href="/signup"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}