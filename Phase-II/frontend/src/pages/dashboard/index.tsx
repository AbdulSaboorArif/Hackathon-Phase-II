import { useAuth } from "../../services/auth";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome back, {user?.email}!
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  Your Tasks
                </h3>
                <p className="text-gray-600">
                  Manage your personal task list
                </p>
                <button
                  onClick={() => router.push("/tasks")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Tasks
                </button>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Quick Actions
                </h3>
                <p className="text-gray-600">
                  Create new tasks and manage your workflow
                </p>
                <button
                  onClick={() => router.push("/tasks/new")}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Create Task
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium">{user?.id}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}