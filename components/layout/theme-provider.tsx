"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme | null) ?? "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with "system" on both the server-rendered HTML and the
  // client's first (hydration) render pass. Reading localStorage inside a
  // useState initializer runs during that first client render too, and
  // since window/localStorage don't exist on the server, that produced a
  // different value than the server used - a classic hydration mismatch.
  // Instead, the real stored value is only read after mount, in an effect.
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    // Reading localStorage requires an effect since it doesn't exist during
    // SSR - this is the standard "sync with an external system on mount"
    // exception, not an avoidable derived-state case.
    const stored = getStoredTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored);
    applyTheme(stored);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const current = (localStorage.getItem("theme") as Theme | null) ?? "system";
      if (current === "system") applyTheme("system");
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
