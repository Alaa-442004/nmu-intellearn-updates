"use client";

import { usePathname } from "next/navigation";
import { InstructorLayout } from "@/components/layouts/instructor-layout";

const MINIMAL_PATHS = ["/instructor/apply", "/instructor/pending"];

export default function InstructorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMinimal = MINIMAL_PATHS.some((p) => pathname.startsWith(p));

  if (isMinimal) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        {children}
      </div>
    );
  }

  return <InstructorLayout>{children}</InstructorLayout>;
}
