import { StudentLayout } from "@/components/layouts/student-layout";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayout>{children}</StudentLayout>;
}
