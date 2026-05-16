import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
