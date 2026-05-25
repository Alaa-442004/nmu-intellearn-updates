"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "default" | "ghost" | "outline";
export type ButtonSize = "default" | "icon" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-white hover:bg-primary-dark",
        variant === "ghost" &&
          "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
        variant === "outline" &&
          "bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
        size === "default" && "h-10 px-4 py-2 text-sm",
        size === "lg" && "h-12 px-6 py-3 text-base",
        size === "icon" && "h-10 w-10 p-0",
        className
      )}
      {...props}
    />
  );
}

