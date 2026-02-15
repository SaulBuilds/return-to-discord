import { NavSidebar } from "@/components/nav-sidebar";
import { NotificationBell } from "@/components/notification-bell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavSidebar />
      {/* Top bar for mobile + notification bell */}
      <header className="md:ml-64 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:px-6">
        <span className="text-lg font-bold text-text-primary md:hidden">
          Return to Discord
        </span>
        <div className="hidden md:block" />
        <NotificationBell />
      </header>
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
