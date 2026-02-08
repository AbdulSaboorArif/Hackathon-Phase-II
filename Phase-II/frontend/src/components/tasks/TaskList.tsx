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
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
  };

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks found
        </div>
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 mb-3 text-sm">{task.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className={getStatusColor(task.is_completed)}>
                  {task.is_completed ? "Completed" : "Incomplete"}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                Created: {formatDate(task.created_at)}
              </span>
              <div className="flex items-center gap-2">
                {task.is_completed ? (
                  <button
                    onClick={() => handleIncompleteTask(task.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Mark Incomplete
                  </button>
                ) : (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};