import { Sidebar } from "@/components/Sidebar";
import { AuthProvider, AuthUser } from "@/components/AuthProvider";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user: AuthUser = {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role as AuthUser["role"],
  };

  return (
    <AuthProvider user={user}>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
