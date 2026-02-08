import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Task } from "../../lib/types";
import { TaskDetails } from "../../components/tasks/TaskDetails";

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Task not found");
        }

        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError("Failed to load task");
        console.error("Error fetching task:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTask(prevTask => prevTask ? { ...prevTask, ...updates } : null);
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      router.push("/tasks");
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => router.push("/tasks")}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium mb-2">Task Not Found</h3>
            <p className="text-red-600 text-sm">The task you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push("/tasks")}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Task Details
        </h1>
        <TaskDetails
          task={task}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
}