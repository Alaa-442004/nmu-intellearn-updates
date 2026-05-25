"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/store/theme-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-lg",
        "bg-card-light dark:bg-card-dark",
        "border border-gray-200 dark:border-gray-700",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "transition-colors duration-200"
      )}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-accent" />
        ) : (
          <Moon className="w-5 h-5 text-primary" />
        )}
      </motion.div>
    </motion.button>
  );
}
