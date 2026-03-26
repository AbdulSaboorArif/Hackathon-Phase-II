"use client"
import { useAuth } from "../services/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-200">
                <span className="text-white text-4xl font-bold">✓</span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome to Todo App
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              A modern, powerful task management application built for productivity.
              Organize your life, one task at a time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                Get Started →
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                >
                  Go to Dashboard
                </button>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-200">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Simple</h3>
                <p className="text-gray-600">
                  Intuitive interface designed for speed. Create and manage tasks in seconds.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-200">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure</h3>
                <p className="text-gray-600">
                  Your data is protected with industry-standard authentication and encryption.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-200">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Responsive</h3>
                <p className="text-gray-600">
                  Works seamlessly on desktop, tablet, and mobile devices.
                </p>
              </div>
            </div>

            {/* Additional Features */}
            <div className="mt-20 bg-white rounded-3xl shadow-2xl border border-gray-200 p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Todo App?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Clean Interface</h4>
                    <p className="text-sm text-gray-600">Beautiful, distraction-free design</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Lightning Fast</h4>
                    <p className="text-sm text-gray-600">Optimized for performance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Stay Organized</h4>
                    <p className="text-sm text-gray-600">Filter and manage tasks easily</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💾</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Cloud Sync</h4>
                    <p className="text-sm text-gray-600">Access from anywhere, anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Built with Next.js, FastAPI, and Better Auth</p>
            <p className="mt-2">© 2026 Todo App. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}