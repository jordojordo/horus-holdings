import React from 'react';

import { THEME, useTheme } from '../context/ThemeContext';

const ToggleThemeButton: React.FC = () => {
  const { currentTheme, updateTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = currentTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;

    updateTheme(newTheme);
  };

  return (
    <button
      aria-label="Toggle Theme"
      title="Toggle Theme"
      className="btn text-bold"
      data-testid="toggle-theme-button"
      onClick={toggleTheme}
    >
      {currentTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK}
    </button>
  );
};

export default ToggleThemeButton;
