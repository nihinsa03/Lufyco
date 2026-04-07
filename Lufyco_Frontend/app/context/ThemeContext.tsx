import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    colors: typeof lightColors;
};

const lightColors = {
    background: '#fff',
    card: '#fff',
    text: '#111',
    textSecondary: '#666',
    textMuted: '#9CA3AF',
    border: '#F3F4F6',
    inputBg: '#F5F5F5',
    iconBg: '#F9FAFB',
    tabBar: '#fff',
    tabActive: '#4A90D9',
    tabInactive: '#999',
    sectionBg: '#fff',
    cardShadow: '#000',
    badgeBg: '#EF4444',
    searchBg: '#F5F5F5',
};

const darkColors = {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    textSecondary: '#A0A0A0',
    textMuted: '#6B7280',
    border: '#2A2A2A',
    inputBg: '#2A2A2A',
    iconBg: '#2A2A2A',
    tabBar: '#1A1A1A',
    tabActive: '#5BA3EC',
    tabInactive: '#666',
    sectionBg: '#1E1E1E',
    cardShadow: '#000',
    badgeBg: '#EF4444',
    searchBg: '#2A2A2A',
};

const THEME_STORAGE_KEY = 'app_theme_dark';

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
    colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Initialize with system preference
    const colorScheme = Appearance.getColorScheme();
    const [isDark, setIsDark] = useState(colorScheme === 'dark');

    // Load persisted theme on startup
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
            if (saved === 'true') {
                setIsDark(true);
            } else if (saved === 'false') {
                setIsDark(false);
            }
        });
    }, []);

    // Listen to system changes if user hasn't hard-set a preference
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
                if (!saved) {
                    setIsDark(colorScheme === 'dark');
                }
            });
        });

        return () => subscription.remove();
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            AsyncStorage.setItem(THEME_STORAGE_KEY, String(next));
            return next;
        });
    };

    const value = {
        isDark,
        toggleTheme,
        colors: isDark ? darkColors : lightColors,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
