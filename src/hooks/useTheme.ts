import { useThemeContext } from "@/contexts/ThemeContext";

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useThemeContext();

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
}
