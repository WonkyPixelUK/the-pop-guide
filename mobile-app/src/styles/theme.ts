// PopGuide Mobile App Theme
export const theme = {
  colors: {
    // Brand colors matching website
    primary: '#e46c1b',
    primaryDark: '#c55a15',
    primaryLight: '#ff8533',
    
    // Background colors
    background: '#000000',
    backgroundSecondary: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceSecondary: '#333333',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#888888',
    textOnPrimary: '#ffffff',
    
    // Functional colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Border colors
    border: '#404040',
    borderLight: '#555555',
    
    // Card colors
    cardBackground: '#2a2a2a',
    cardBorder: '#444444',
    
    // Input colors
    inputBackground: '#333333',
    inputBorder: '#555555',
    inputPlaceholder: '#888888',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
}; 