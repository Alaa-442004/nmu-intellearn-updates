"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils/cn";
import { clearClientSession } from "@/lib/auth/session";
import type { NavItem } from "./nav-config";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  navItems: NavItem[];
  roleLabel: string;
  userName?: string;
}

export function DashboardShell({
  children,
  title,
  subtitle,
  navItems,
  roleLabel,
  userName,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    clearClientSession();
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-card-light/95 dark:bg-card-dark/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-neutral-200 dark:border-neutral-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" />
              <span className="font-bold text-primary hidden sm:inline">
                NMU IntelliLearn
              </span>
            </Link>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-neutral-600 dark:text-neutral-300 hidden md:inline">
                {userName}
              </span>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 shrink-0",
            "border-r border-neutral-200 dark:border-neutral-800",
            "bg-card-light dark:bg-card-dark p-4 transition-transform lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/admin/dashboard" &&
                  item.href !== "/instructor/dashboard" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 top-16 z-20 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
              )}
              {subtitle && (
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
