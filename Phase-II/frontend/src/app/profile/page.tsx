"use client";
import { useAuth } from "../../services/auth";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      router.push("/login");
    }
  };

  const handleUpdateEmail = async (newEmail: string) => {
    try {
      setLoading(true);
      // Here you would implement email update functionality
      setLoading(false);
      alert("Email updated successfully!");
    } catch (error) {
      setLoading(false);
      alert("Failed to update email");
    }
  };

  if (!user) {
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <span className="text-gray-600 text-xl">←</span>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Profile Settings
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-4xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.email?.split("@")[0]}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span className="text-2xl">👤</span>
              <span>Account Information</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📧</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🆔</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-gray-900">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span className="text-2xl">🔒</span>
              <span>Security</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Change Email</h4>
                    <p className="text-sm text-gray-600">Update your email address</p>
                  </div>
                  <button
                    onClick={() => {
                      const newEmail = prompt("Enter new email:");
                      if (newEmail) {
                        handleUpdateEmail(newEmail);
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Logout</h4>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span className="text-2xl">ℹ️</span>
              <span>About</span>
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Version</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Frontend</span>
                <span className="font-medium text-gray-900">Next.js 16</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Backend</span>
                <span className="font-medium text-gray-900">FastAPI</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Authentication</span>
                <span className="font-medium text-gray-900">Better Auth</span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
