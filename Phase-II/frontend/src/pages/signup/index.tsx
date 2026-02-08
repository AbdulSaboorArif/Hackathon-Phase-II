import { AuthForm } from "../../components/auth/AuthForm";
import { AuthProvider } from "../../components/auth/AuthProvider";
import { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    setLoading(true);
    // Redirect to dashboard after successful registration
    window.location.href = "/dashboard";
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-full px-4">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
              Create your account
            </h1>

            <AuthForm
              type="register"
              onSuccess={handleSuccess}
            />

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?
                <a
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}