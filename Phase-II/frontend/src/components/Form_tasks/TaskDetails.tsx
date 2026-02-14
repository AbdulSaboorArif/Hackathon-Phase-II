"use client";
import React from "react";
import { Task } from "../../lib/types";

interface TaskDetailsProps {
  task: Task;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
  onDelete: (taskId: number) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onUpdate,
  onDelete,
}) => {
  const handleToggleComplete = async () => {
    const updatedTask = {
      ...task,
      is_completed: !task.is_completed,
      completed_at: !task.is_completed ? new Date().toISOString() : null,
    };

    onUpdate(task.id!, updatedTask);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id!);
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{task.title}</h2>
            <div className="flex items-center space-x-3">
              {task.is_completed ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                  <span className="mr-1">✓</span>
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-500 text-white">
                  <span className="mr-1">⏳</span>
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Body */}
      <div className="bg-white p-8">
        {task.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Description
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-gray-900 font-semibold">
                  {new Date(task.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {task.updated_at && task.updated_at !== task.created_at && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(task.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {task.is_completed && task.completed_at && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(task.completed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleToggleComplete}
            className="flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02]"
          >
            {task.is_completed ? "Mark as Incomplete" : "Mark as Complete"}
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-6 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};