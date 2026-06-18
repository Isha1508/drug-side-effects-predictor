import { ReactNode, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { darkMode, toggleDarkMode } = useAppStore();

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && !darkMode) {
      toggleDarkMode();
    }
  }, []);

  return <>{children}</>;
}
