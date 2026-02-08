import { useState } from "react";
import { useAuth } from "../services/auth";

interface TaskDetailsProps {
  task: {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  };
  onUpdate?: (updates: Partial<{
    title?: string;
    description?: string;
    completed?: boolean;
  }>) => void;
  onDelete?: () => void;
}

export default function TaskDetails({ task, onUpdate, onDelete }: TaskDetailsProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [completed, setCompleted] = useState(task.completed);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleSave = async () => {
    if (onUpdate) {
      setIsLoading(true);
      try {
        await onUpdate({
          title,
          description: description.trim() || undefined,
          completed,
        });
        setEditing(false);
      } catch (error) {
        console.error("Failed to update task:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      if (confirm("Are you sure you want to delete this task?")) {
        setIsLoading(true);
        try {
          await onDelete();
        } catch (error) {
          console.error("Failed to delete task:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (editing) {
    return (
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Task Title
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Task Description
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 border-zinc-300 dark:border-zinc-600 rounded dark:bg-zinc-800"
                />
                <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
                  Mark as Completed
                </span>
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 dark:bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              {description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              Created: {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.updated_at !== task.created_at && (
              <span>
                Updated: {new Date(task.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-300">
            {completed ? "Completed" : "Pending"}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}