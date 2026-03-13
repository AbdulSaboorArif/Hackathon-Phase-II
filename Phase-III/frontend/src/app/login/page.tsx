"use client";
import { AuthForm } from "../../components/auth/AuthForm";
import { AuthProvider } from "../../components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">✓</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <AuthForm type="login" />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Sign up for free
              </button>
            </p>
          </div>

          {/* Features */}
          <div className="pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">🚀</div>
                <p className="text-xs text-gray-600">Fast & Simple</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-xs text-gray-600">Secure</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📱</div>
                <p className="text-xs text-gray-600">Responsive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
