import { useAuth } from "../app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, authError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return authError ? <div className="bg-red-600 text-white p-2 text-center">{authError}</div> : null;
  return <>{children}</>;
} 