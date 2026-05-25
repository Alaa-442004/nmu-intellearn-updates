import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  FileText,
  User,
  GraduationCap,
  Users,
  BarChart3,
  ClipboardCheck,
  Settings,
  PlusCircle,
  PlayCircle,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "Continue Learning", href: "/dashboard/continue", icon: PlayCircle },
  { label: "Certificates", href: "/certificates", icon: Award },
  { label: "My Exams", href: "/my-exam", icon: FileText },
  { label: "Profile", href: "/profile", icon: User },
];

export const instructorNav: NavItem[] = [
  { label: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
  { label: "Create Course", href: "/instructor/courses/new", icon: PlusCircle },
  { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  { label: "Apply", href: "/instructor/apply", icon: GraduationCap },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Instructor Approvals", href: "/admin/instructors/approvals", icon: ClipboardCheck },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Payments", href: "/admin/payments", icon: BarChart3 },
  { label: "Settings", href: "/admin/profile", icon: Settings },
];
