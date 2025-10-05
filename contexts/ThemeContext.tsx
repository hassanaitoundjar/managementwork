import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Theme } from '../types';
import { settingsStorage } from '../utils/storage';

const CombinedDefaultTheme = {
  ...MD3LightTheme,
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  paperTheme: typeof CombinedDefaultTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await settingsStorage.get();
      setThemeState(settings.theme);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await settingsStorage.updateTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = async () => {
    const currentEffective = getEffectiveTheme();
    const newTheme: Theme = currentEffective === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return systemColorScheme || 'light';
    }
    return theme;
  };

  const isDark = getEffectiveTheme() === 'dark';
  const paperTheme = isDark ? CombinedDarkTheme : CombinedDefaultTheme;

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    paperTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
