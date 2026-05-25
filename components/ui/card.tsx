"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-700",
        "bg-white/70 dark:bg-black/20",
        className
      )}
      {...props}
    />
  );
}

