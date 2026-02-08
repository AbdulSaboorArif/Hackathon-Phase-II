import React, { useState } from "react";
import { STATUS_OPTIONS } from "../../lib/constants";

interface TaskFiltersProps {
  onFilterChange: (status: string) => void;
  currentFilter: string;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleFilterChange = (status: string) => {
    onFilterChange(status);
    setShowOptions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showOptions ? "Hide" : "Show"} Options
        </button>
      </div>

      {showOptions && (
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`w-full px-3 py-2 text-left rounded hover:bg-gray-100 ${
                currentFilter === option.value
                  ? "bg-blue-50 border border-blue-200"
                  : "border border-transparent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};