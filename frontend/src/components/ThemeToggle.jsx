import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();
  
  const isDark = theme === "dark" || theme === "night" || theme === "forest" || theme === "black";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 hover:text-primary transition-all hover:scale-105"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <Sun className="size-4" />
          <span className="hidden sm:inline font-medium">Light</span>
        </>
      ) : (
        <>
          <Moon className="size-4" />
          <span className="hidden sm:inline font-medium">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
