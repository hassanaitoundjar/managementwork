import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

interface TabConfig {
  name: string;
  icon: string;
  label: string;
}

const tabConfigs: TabConfig[] = [
  { name: 'index', icon: 'home', label: 'Home' },
  { name: 'employees', icon: 'account-group', label: 'Employees' },
  { name: 'clients', icon: 'office-building', label: 'Clients' },
  { name: 'reports', icon: 'chart-line', label: 'Reports' },
  { name: 'settings', icon: 'cog', label: 'Settings' },
];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { paperTheme, isDark } = useTheme();
  const { t } = useLanguage();

  const getTabLabel = (routeName: string, originalLabel: string) => {
    switch (routeName) {
      case 'index':
        return t('home');
      case 'employees':
        return t('employees');
      case 'clients':
        return t('clients');
      case 'reports':
        return 'Reports'; // Add translation later
      case 'settings':
        return t('settings');
      default:
        return originalLabel;
    }
  };

  const styles = createStyles(paperTheme, isDark, isTablet, isLargeScreen);

  return (
    <Surface style={styles.container} elevation={0}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const tabConfig = tabConfigs.find(config => config.name === route.name);
          const iconName = tabConfig?.icon || 'help-circle';
          const label = getTabLabel(route.name, tabConfig?.label || route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive,
              ]}>
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={isTablet ? 28 : 24}
                  color={isFocused ? styles.iconActive.color : styles.iconInactive.color}
                />
              </View>
              
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Surface>
  );
}

const createStyles = (theme: any, isDark: boolean, isTablet: boolean, isLargeScreen: boolean) => {
  const tabHeight = isTablet ? 85 : 75;
  const iconSize = isTablet ? 26 : 22;
  const fontSize = isTablet ? 13 : 11;
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 0.5,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.25 : 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    tabBar: {
      flexDirection: 'row',
      height: tabHeight,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      paddingTop: 12,
      paddingHorizontal: isLargeScreen ? 60 : isTablet ? 24 : 16,
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: isLargeScreen ? 900 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: isTablet ? 8 : 6,
      paddingVertical: 8,
      borderRadius: isTablet ? 20 : 18,
      minHeight: isTablet ? 56 : 52,
      maxWidth: isTablet ? 140 : 90,
      marginHorizontal: 2,
    },
    tabItemActive: {
      backgroundColor: isDark 
        ? 'rgba(255, 255, 255, 0.10)' 
        : 'rgba(103, 126, 234, 0.08)',
      borderWidth: 1,
      borderColor: isDark 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(103, 126, 234, 0.12)',
    },
    iconContainer: {
      width: iconSize + 12,
      height: iconSize + 12,
      borderRadius: (iconSize + 12) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
      backgroundColor: 'transparent',
    },
    iconContainerActive: {
      backgroundColor: isDark 
        ? 'rgba(103, 126, 234, 0.15)' 
        : 'rgba(103, 126, 234, 0.10)',
    },
    iconActive: {
      color: theme.colors.primary,
    },
    iconInactive: {
      color: isDark ? 'rgba(255, 255, 255, 0.60)' : 'rgba(0, 0, 0, 0.60)',
    },
    label: {
      fontSize: fontSize,
      fontWeight: '500',
      textAlign: 'center',
      letterSpacing: 0.2,
      lineHeight: fontSize + 2,
    },
    labelActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    labelInactive: {
      color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
    },
  });
};
