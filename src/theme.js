// Theme configuration with light and dark modes
export const theme = {
    light: {
        // Backgrounds - iOS inspired
        bg: {
            primary: '#F9F9F9',
            secondary: '#FFFFFF',
            tertiary: '#F2F2F7',
            card: '#FFFFFF',
            overlay: 'rgba(0, 0, 0, 0.4)'
        },
        // Text colors - refined contrast
        text: {
            primary: '#000000',
            secondary: '#8E8E93',
            tertiary: '#C7C7CC',
            inverse: '#FFFFFF'
        },
        // Brand colors - iOS blue as primary
        colors: {
            primary: '#007AFF',
            primaryLight: '#5AC8FA',
            primaryDark: '#0051D5',
            secondary: '#34C759',
            secondaryLight: '#30D158',
            accent: '#FF2D55',
            accentLight: '#FF375F',
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            info: '#5AC8FA'
        },
        // Shadows - subtle and layered
        shadow: {
            sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
            md: '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)',
            xl: '0 20px 25px rgba(0, 0, 0, 0.06), 0 10px 10px rgba(0, 0, 0, 0.04)'
        },
        // Borders - very subtle
        border: {
            light: 'rgba(0, 0, 0, 0.04)',
            medium: 'rgba(0, 0, 0, 0.08)',
            dark: 'rgba(0, 0, 0, 0.12)'
        }
    },
    dark: {
        // Backgrounds
        bg: {
            primary: '#1A1A2E',
            secondary: '#16213E',
            tertiary: '#0F1419',
            card: '#16213E',
            overlay: 'rgba(0, 0, 0, 0.7)'
        },
        // Text colors
        text: {
            primary: '#FFFFFF',
            secondary: '#B2BEC3',
            tertiary: '#636E72',
            inverse: '#2D3436'
        },
        // Brand colors
        colors: {
            primary: '#A29BFE',
            primaryLight: '#DFE6E9',
            primaryDark: '#6C5CE7',
            secondary: '#55EFC4',
            secondaryLight: '#81ECEC',
            accent: '#FF7675',
            accentLight: '#FD79A8',
            success: '#55EFC4',
            warning: '#FFEAA7',
            error: '#FF7675',
            info: '#74B9FF'
        },
        // Shadows (with glow for dark mode)
        shadow: {
            sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
            md: '0 4px 16px rgba(0, 0, 0, 0.5)',
            lg: '0 8px 32px rgba(0, 0, 0, 0.6)',
            xl: '0 12px 48px rgba(0, 0, 0, 0.7)'
        },
        // Borders
        border: {
            light: 'rgba(255, 255, 255, 0.08)',
            medium: 'rgba(255, 255, 255, 0.12)',
            dark: 'rgba(255, 255, 255, 0.18)'
        }
    },
    // Shared values
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px'
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        fontSize: {
            xs: '11px',
            sm: '13px',
            md: '15px',
            lg: '17px',
            xl: '20px',
            xxl: '28px',
            xxxl: '36px'
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            heavy: 800
        }
    },
    transitions: {
        fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }
}

// Gradient presets
export const gradients = {
    light: {
        primary: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
        secondary: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
        accent: 'linear-gradient(135deg, #FD79A8 0%, #FDCFE8 100%)',
        sunset: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        ocean: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    dark: {
        primary: 'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)',
        secondary: 'linear-gradient(135deg, #55EFC4 0%, #00B894 100%)',
        accent: 'linear-gradient(135deg, #FF7675 0%, #FD79A8 100%)',
        sunset: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        ocean: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
}
