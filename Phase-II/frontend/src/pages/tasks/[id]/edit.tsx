import { useAuth } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditTaskPage() {
  const auth = useAuth();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, router]);

  
  useEffect(() => {
    if (id) {
      router.push(`/tasks/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}