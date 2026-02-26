"use client";
import React, { useState } from "react";
import { TaskCreate } from "../../lib/types";

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => void;
  initialValues?: Partial<TaskCreate>;
  submitButtonText?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  initialValues = {},
  submitButtonText = "Create Task",
}) => {
  const [formData, setFormData] = useState({
    title: initialValues.title || "",
    description: initialValues.description || "",
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = (): boolean => {
    let hasErrors = false;
    const newErrors = { ...errors };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      hasErrors = true;
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
      hasErrors = true;
    }

    if (formData.description && formData.description.trim().length > 10000) {
      newErrors.description = "Description cannot exceed 10,000 characters";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          placeholder="e.g., Review project proposal"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{errors.title}</span> 
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Description <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
          rows={4}
          placeholder="Add more details about this task..."
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Creating...</span>
          </span>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
};