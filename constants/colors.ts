/**
 * Color Schema for Shihabfalling Employee Management App
 * Modern color palette with light/dark theme support
 */

// Primary Brand Colors
export const BrandColors = {
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#7c3aed',
  secondary: '#764ba2',
  accent: '#f093fb',
  
  // Gradient combinations
  gradientPrimary: ['#667eea', '#764ba2'],
  gradientSecondary: ['#764ba2', '#f093fb'],
  gradientFull: ['#667eea', '#764ba2', '#f093fb'],
} as const;

// Semantic Colors
export const SemanticColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Status colors
  active: '#22c55e',
  inactive: '#6b7280',
  pending: '#f59e0b',
  completed: '#10b981',
} as const;

// Light Theme Colors
export const LightTheme = {
  // Background colors
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceVariant: '#f1f5f9',
  
  // Text colors
  onBackground: '#1e293b',
  onSurface: '#334155',
  onSurfaceVariant: '#64748b',
  
  // Border and outline colors
  outline: '#e2e8f0',
  outlineVariant: '#cbd5e1',
  
  // Interactive colors
  primary: BrandColors.primary,
  primaryContainer: '#e0e7ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#1e1b4b',
  
  secondary: BrandColors.secondary,
  secondaryContainer: '#f3e8ff',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#581c87',
  
  // Status colors
  error: SemanticColors.error,
  errorContainer: '#fef2f2',
  success: SemanticColors.success,
  successContainer: '#f0fdf4',
  warning: SemanticColors.warning,
  warningContainer: '#fffbeb',
} as const;

// Dark Theme Colors
export const DarkTheme = {
  // Background colors
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  
  // Text colors
  onBackground: '#f1f5f9',
  onSurface: '#e2e8f0',
  onSurfaceVariant: '#94a3b8',
  
  // Border and outline colors
  outline: '#475569',
  outlineVariant: '#64748b',
  
  // Interactive colors
  primary: '#8b5cf6',
  primaryContainer: '#4c1d95',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#e0e7ff',
  
  secondary: '#a855f7',
  secondaryContainer: '#581c87',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#f3e8ff',
  
  // Status colors
  error: '#f87171',
  errorContainer: '#7f1d1d',
  success: '#34d399',
  successContainer: '#14532d',
  warning: '#fbbf24',
  warningContainer: '#92400e',
} as const;

// Component-specific Colors
export const ComponentColors = {
  // Tab bar colors
  tabBar: {
    light: {
      background: '#ffffff',
      border: 'rgba(0, 0, 0, 0.06)',
      active: BrandColors.primary,
      inactive: 'rgba(0, 0, 0, 0.60)',
      activeBackground: 'rgba(103, 126, 234, 0.08)',
      activeBorder: 'rgba(103, 126, 234, 0.12)',
    },
    dark: {
      background: '#1e293b',
      border: 'rgba(255, 255, 255, 0.12)',
      active: '#8b5cf6',
      inactive: 'rgba(255, 255, 255, 0.60)',
      activeBackground: 'rgba(255, 255, 255, 0.10)',
      activeBorder: 'rgba(255, 255, 255, 0.15)',
    },
  },
  
  // Card colors
  card: {
    light: {
      background: '#ffffff',
      gradient: ['#ffffff', '#f8f9ff'],
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      background: '#1e293b',
      gradient: ['#1e293b', '#334155'],
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  
  // Header colors
  header: {
    gradient: BrandColors.gradientFull,
    text: '#ffffff',
    textShadow: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Status colors for work calendar
  calendar: {
    workDay: SemanticColors.success,
    absence: SemanticColors.error,
    today: BrandColors.primary,
    selected: BrandColors.accent,
  },
  
  // Financial colors
  financial: {
    earnings: SemanticColors.success,
    expenses: SemanticColors.error,
    advances: '#f59e0b',
    netEarnings: BrandColors.secondary,
  },
} as const;

// Utility Functions
export const getThemeColors = (isDark: boolean) => {
  return isDark ? DarkTheme : LightTheme;
};

export const getComponentColors = (isDark: boolean) => {
  return {
    tabBar: isDark ? ComponentColors.tabBar.dark : ComponentColors.tabBar.light,
    card: isDark ? ComponentColors.card.dark : ComponentColors.card.light,
    header: ComponentColors.header,
    calendar: ComponentColors.calendar,
    financial: ComponentColors.financial,
  };
};

// Color opacity helpers
export const withOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Gradient helpers
export const createGradient = (colors: string[], direction: 'horizontal' | 'vertical' | 'diagonal' = 'horizontal') => {
  const directions = {
    horizontal: { x: 0, y: 0 },
    vertical: { x: 0, y: 1 },
    diagonal: { x: 1, y: 1 },
  };
  
  return {
    colors,
    start: { x: 0, y: 0 },
    end: directions[direction],
  };
};

// Export all colors as a single object
export const AppColors = {
  brand: BrandColors,
  semantic: SemanticColors,
  light: LightTheme,
  dark: DarkTheme,
  components: ComponentColors,
} as const;

// Type definitions
export type BrandColorKeys = keyof typeof BrandColors;
export type SemanticColorKeys = keyof typeof SemanticColors;
export type LightThemeKeys = keyof typeof LightTheme;
export type DarkThemeKeys = keyof typeof DarkTheme;
export type ComponentColorKeys = keyof typeof ComponentColors;
