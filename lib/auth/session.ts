"use client";

import type { SessionUser, UserRole } from "./types";

export function getClientSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("nmu_role") as UserRole | null;
  const email = localStorage.getItem("nmu_email");
  const name = localStorage.getItem("nmu_name");
  if (!role || !email || !name) return null;
  return { role, email, name };
}

export function setClientSession(user: SessionUser): void {
  localStorage.setItem("nmu_role", user.role);
  localStorage.setItem("nmu_email", user.email);
  localStorage.setItem("nmu_name", user.name);
  if (user.role === "student") {
    localStorage.setItem("currentStudentEmail", user.email);
  }
  if (user.role === "instructor") {
    localStorage.setItem("currentInstructorEmail", user.email);
  }
}

export function clearClientSession(): void {
  localStorage.removeItem("nmu_role");
  localStorage.removeItem("nmu_email");
  localStorage.removeItem("nmu_name");
  localStorage.removeItem("currentStudentEmail");
  localStorage.removeItem("currentInstructorEmail");
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "instructor":
      return "/instructor/dashboard";
    case "student":
      return "/dashboard";
  }
}
