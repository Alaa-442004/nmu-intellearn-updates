export type UserRole = "student" | "instructor" | "admin";

export interface SessionUser {
  email: string;
  name: string;
  role: UserRole;
}
