"use client";
import { AuthForm } from "../../components/auth/AuthForm";
import { AuthProvider } from "../../components/auth/AuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setLoading(true);
    window.location.href = "/dashboard";
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">✓</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Start organizing your tasks today
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <AuthForm
              type="register"
              onSuccess={handleSuccess}
            />
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-purple-600 hover:text-purple-500 transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Benefits */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-4">Join thousands of users who trust us</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">✨</div>
                <p className="text-xs text-gray-600">Free Forever</p>
              </div>
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-xs text-gray-600">Instant Setup</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-xs text-gray-600">Stay Organized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
