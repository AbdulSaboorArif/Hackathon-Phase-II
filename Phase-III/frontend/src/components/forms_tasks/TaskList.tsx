"use client";
import React, { useState, useEffect } from "react";
import { Task } from "../../lib/types";
import { formatDate, getStatusColor } from "../../lib/utils";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  const handleCompleteTask = async (taskId: number) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { is_completed: true });
    }
  };

  const handleIncompleteTask = async (taskId: number) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { is_completed: false });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setDeletingId(taskId);
    if (onTaskDelete) {
      await onTaskDelete(taskId);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg">No tasks found</p>
        </div>
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-all duration-200 ${
              task.is_completed
                ? "border-green-500 bg-green-50/30"
                : "border-indigo-500"
            } ${deletingId === task.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  task.is_completed ? "text-gray-500 line-through" : "text-gray-900"
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="ml-4">
                {task.is_completed ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span className="mr-1">✓</span>
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                    <span className="mr-1">⏳</span>
                    Pending
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>{formatDate(task.created_at)}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {task.is_completed ? (
                  <button
                    onClick={() => handleIncompleteTask(task.id)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    Mark Incomplete
                  </button>
                ) : (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={deletingId === task.id}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                >
                  {deletingId === task.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};