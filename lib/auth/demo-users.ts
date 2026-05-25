import type { UserRole } from "./types";

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@knowledgejudge.com",
    password: "Admin123!",
    name: "Platform Admin",
    role: "admin",
  },
  {
    email: "gana@example.com",
    password: "Student123!",
    name: "Gana Student",
    role: "student",
  },
  {
    email: "prof.aya@example.com",
    password: "Instructor123!",
    name: "Prof. Aya",
    role: "instructor",
  },
];

export function findDemoUser(email: string, password: string): DemoUser | null {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === normalized && u.password === password.trim()
    ) ?? null
  );
}
