"use client";

import { LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden h-10 min-w-[280px] items-center gap-2 rounded-md border border-border bg-surface px-3 md:flex">
          <Search className="h-4 w-4 text-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            placeholder="Search projects or tasks"
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink">{user?.name ?? "Workspace"}</p>
          <p className="text-xs text-muted">{user?.email ?? "Role based access"}</p>
        </div>
        <Button variant="secondary" onClick={logout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
