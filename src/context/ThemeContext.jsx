import React, { createContext, useContext, useState, useEffect } from 'react'
import { theme as themeConfig } from '../theme'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('qaraa_theme')
        if (savedTheme) {
            setIsDark(savedTheme === 'dark')
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDark(prefersDark)
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        localStorage.setItem('qaraa_theme', newTheme ? 'dark' : 'light')
    }

    const theme = isDark ? themeConfig.dark : themeConfig.light
    const sharedTheme = {
        spacing: themeConfig.spacing,
        borderRadius: themeConfig.borderRadius,
        typography: themeConfig.typography,
        transitions: themeConfig.transitions
    }

    const value = {
        theme: { ...theme, ...sharedTheme },
        isDark,
        toggleTheme
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
