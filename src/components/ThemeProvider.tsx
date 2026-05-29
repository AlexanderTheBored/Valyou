"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start "light" so server and first-client render match.
  // The inline script in <head> already set the .dark class on <html> —
  // CSS-driven styles render correctly from paint one. We sync this state
  // after mount so any JS that branches on `theme` updates without flicker.
  const [theme, setTheme] = useState<Theme>("light");
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cur = document.documentElement.classList.contains("dark") ? "dark" : "light";
    if (cur !== theme) setTheme(cur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      const root = document.documentElement;

      root.classList.add("theme-transition");
      root.classList.toggle("dark", next === "dark");
      try { localStorage.setItem("valyou-theme", next); } catch {}

      if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
      transitionTimeout.current = setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 260);

      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
