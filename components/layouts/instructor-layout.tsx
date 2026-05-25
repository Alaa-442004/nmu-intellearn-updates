"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "./dashboard-shell";
import { instructorNav } from "./nav-config";
import { getClientSession } from "@/lib/auth/session";

export function InstructorLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const [userName, setUserName] = useState<string>();

  useEffect(() => {
    const session = getClientSession();
    if (session) setUserName(session.name);
  }, []);

  return (
    <DashboardShell
      title={title}
      subtitle={subtitle}
      navItems={instructorNav}
      roleLabel="Instructor"
      userName={userName}
    >
      {children}
    </DashboardShell>
  );
}
