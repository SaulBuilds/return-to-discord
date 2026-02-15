"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Compass,
  Users,
  MessageCircle,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavSidebar() {
  const pathname = usePathname();
  const { logout } = useLogout({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-sidebar border-r border-border">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blurple">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary">
            Return to Discord
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blurple text-white"
                    : "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-sidebar-hover hover:text-red"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-sidebar">
        {navItems.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5",
                isActive ? "text-blurple" : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
