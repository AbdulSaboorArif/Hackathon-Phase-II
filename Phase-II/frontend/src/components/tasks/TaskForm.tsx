import React, { useState } from "react";
import { TaskCreate } from "../../lib/types";
import { validateEmail, validatePassword } from "../../lib/utils";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
          placeholder="Enter task description (optional)"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : submitButtonText}
      </button>
    </form>
  );
};