import { createContext, useContext } from "react";
import type { Theme } from "@/types";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}
