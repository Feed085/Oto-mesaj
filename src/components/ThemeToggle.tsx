import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="
        p-3 rounded-xl
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-300
        hover:scale-105 active:scale-95
      "
      title={theme === "dark" ? "Açık Mod" : "Karanlık Mod"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
