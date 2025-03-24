import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, StatusBar } from 'react-native'; // Change this import

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDarkMode ? '#000000' : '#ffffff');
    }
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      await AsyncStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
      setIsDarkMode(!isDarkMode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = {
    dark: {
      background: '#000000', // Changed to absolute black
      surface: '#121212',    // Dark surface color
      primary: '#2196F3',    // Bright blue for better contrast
      secondary: '#03DAC6',  // Teal
      text: '#FFFFFF',       // Pure white text
      textSecondary: '#A0A0A0', // Light gray for secondary text
      border: '#272727',     // Subtle border color
      error: '#CF6679',      // Material Design dark theme error color
      success: '#4CAF50',    // Success green
      warning: '#FB8C00',    // Warning orange
      shadow: 'rgba(0, 0, 0, 0.5)', // Darker shadow for contrast
    },
    light: {
      background: '#f8fafc',
      surface: '#ffffff',
      primary: '#3b82f6',
      secondary: '#0891b2',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  };

  const activeTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      theme: activeTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
