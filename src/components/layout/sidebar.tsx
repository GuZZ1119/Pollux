"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/inbox", label: "Inbox", icon: "📥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

interface Props {
  user: SessionUser | null;
}

export function Sidebar({ user }: Props) {
  const pathname = usePathname();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-200">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Pollux
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">AI Communication Layer</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <a
              href="/auth/logout"
              className="block text-center text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </a>
          </div>
        ) : (
          <a
            href="/auth/login"
            className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign in
          </a>
        )}
      </div>
    </aside>
  );
}
