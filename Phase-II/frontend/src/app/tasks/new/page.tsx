"use client";
import { useRouter } from "next/navigation";
import { TaskForm } from "../../../components/forms_tasks/TaskForm";
import { useState } from "react";

export default function NewTaskPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleCreateTask = async (task: { title: string; description?: string }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      router.push("/tasks");
    } catch (error) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push("/tasks")}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
            >
              <span className="text-gray-600 text-xl">←</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create New Task
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-1">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Task</h2>
                <p className="text-gray-600 text-sm">Add a new task to your list</p>
              </div>
            </div>
          </div>

          <TaskForm onSubmit={handleCreateTask} submitButtonText="Create Task" />

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push("/tasks")}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
            >
              ← Back to Tasks
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-blue-900 font-semibold mb-3 flex items-center space-x-2">
            <span className="text-xl">💡</span>
            <span>Tips for Better Tasks</span>
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Use clear, action-oriented titles (e.g., "Review project proposal")</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Add detailed descriptions to provide context</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Break down large tasks into smaller, manageable ones</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
