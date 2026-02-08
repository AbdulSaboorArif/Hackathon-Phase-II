import { useAuth } from "../../services/auth";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { Task } from "../../lib/types";
import { TaskList } from "./TaskList";
import { TaskForm } from "./TaskForm";
import { TaskFilters } from "./TaskFilters";
import { formatDate, getStatusColor } from "../../lib/utils";
import { useRouter } from "next/navigation";

interface TasksPageProps {
  tasks: Task[];
  onCreateTask: (task: TaskCreate) => void;
  onUpdateTask: (taskId: number, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: number) => void;
}

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
      } catch (err) {
        setError("Failed to load tasks");
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData: TaskCreate) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
      setFilteredTasks(prevTasks => [...prevTasks, newTask]);
    } catch (err) {
      setError("Failed to create task");
      console.error("Error creating task:", err);
    }
  };

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

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      setFilteredTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
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

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setFilteredTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const handleFilterChange = (status: string) => {
    setCurrentFilter(status);
    if (status === "all") {
      setFilteredTasks(tasks);
    } else if (status === "completed") {
      setFilteredTasks(tasks.filter(task => task.is_completed));
    } else {
      setFilteredTasks(tasks.filter(task => !task.is_completed));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
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
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            My Tasks
          </h1>

          <TaskFilters
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
          />

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create New Task
            </h2>
            <TaskForm onSubmit={handleCreateTask} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
            </h2>
            <TaskList
              tasks={filteredTasks}
              onTaskUpdate={handleUpdateTask}
              onTaskDelete={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}