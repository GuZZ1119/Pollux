import type { SessionUser } from "@/lib/types";
import { Sidebar } from "./sidebar";

interface Props {
  children: React.ReactNode;
  user: SessionUser | null;
}

export function AppShell({ children, user }: Props) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
