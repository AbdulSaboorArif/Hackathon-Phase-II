"use client";
import React from "react";
import { STATUS_OPTIONS } from "../../lib/constants";

interface TaskFiltersProps {
  onFilterChange: (status: string) => void;
  currentFilter: string;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter Tasks</h3>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentFilter === option.value
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};