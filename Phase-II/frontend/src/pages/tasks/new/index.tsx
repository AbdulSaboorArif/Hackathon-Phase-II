import { useRouter } from "next/navigation";
import { TaskForm } from "../../components/tasks/TaskForm";

export default function NewTaskPage() {
  const router = useRouter();

  const handleCreateTask = async (task: { title: string; description?: string }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      router.push("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Create New Task
        </h1>
        <TaskForm onSubmit={handleCreateTask} submitButtonText="Create Task" />
      </div>
    </div>
  );
}