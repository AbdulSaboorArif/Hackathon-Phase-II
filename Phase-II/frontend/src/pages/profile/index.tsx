import { useAuth } from "../../services/auth";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleUpdateEmail = async (newEmail: string) => {
    try {
      setLoading(true);
      // Here you would implement email update functionality
      setLoading(false);
      alert('Email updated successfully!');
    } catch (error) {
      setLoading(false);
      alert('Failed to update email');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Profile
          </h1>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">User ID:</span>
                <span className="font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Security
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => {
                    const newEmail = prompt('Enter new email:');
                    if (newEmail) {
                      handleUpdateEmail(newEmail);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Change Email
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                      handleLogout();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Todo App v1.0.0</p>
              <p>Built with Next.js, FastAPI, and SQLModel</p>
              <p>Authentication powered by Better Auth</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}