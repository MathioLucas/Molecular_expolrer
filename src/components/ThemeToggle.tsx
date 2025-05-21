import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDarkMode(
      storedTheme === 'dark' || 
      (!storedTheme && prefersDarkMode)
    );
  }, []);
  
  // Update the document class and localStorage when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
    >
      {isDarkMode ? (
        <span role="img" aria-label="Light mode" className="text-lg">
          🌞
        </span>
      ) : (
        <span role="img" aria-label="Dark mode" className="text-lg">
          🌙
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;