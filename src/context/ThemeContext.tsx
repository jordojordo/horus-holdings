import React, { createContext, useContext, useState, useEffect } from 'react';

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
}

interface ThemeContextType {
  currentTheme: THEME;
  updateTheme: (theme: THEME) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<THEME>(THEME.LIGHT);

  const updateTheme = (newTheme: THEME) => {
    setCurrentTheme(newTheme);

    if (newTheme === THEME.DARK) {
      document.documentElement.classList.add(THEME.DARK);
    } else {
      document.documentElement.classList.remove(THEME.DARK);
    }

    localStorage.theme = newTheme;
  };

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = prefersDark ? THEME.DARK : THEME.LIGHT;
    const storedTheme = (localStorage.getItem('theme') as THEME) || defaultTheme;

    updateTheme(storedTheme);
  }, []);


  return (
    <ThemeContext.Provider value={{
      currentTheme,
      updateTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
