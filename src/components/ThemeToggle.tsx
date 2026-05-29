"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  iconSize?: number;
}

export default function ThemeToggle({ className = "", iconSize = 15 }: ThemeToggleProps) {
  const { toggle } = useTheme();

  // Icon visibility is driven by the `.dark` class on <html> via Tailwind's
  // `dark:` variant — same JSX renders on server and client, so no hydration
  // mismatch. The inline theme script in <head> sets the class before paint.
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors overflow-hidden ${className}`}
    >
      <Sun
        size={iconSize}
        className="absolute opacity-0 -rotate-90 scale-50 dark:opacity-100 dark:rotate-0 dark:scale-100 transition-all duration-300"
      />
      <Moon
        size={iconSize}
        className="absolute opacity-100 rotate-0 scale-100 dark:opacity-0 dark:rotate-90 dark:scale-50 transition-all duration-300"
      />
    </button>
  );
}
