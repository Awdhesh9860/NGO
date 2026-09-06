/**
 * Enterprise NGO Design System Tokens
 * Defines standardized semantic tokens for colors, typography, spacing, elevations, and responsive breakpoints.
 */

export const DESIGN_TOKENS = {
  colors: {
    // Brand Semantic Palette (Emerald & Amber humanitarian trust)
    primary: {
      DEFAULT: '#059669', // emerald-600
      hover: '#047857',   // emerald-700
      light: '#ecfdf5',   // emerald-50
      dark: '#064e3b',    // emerald-900
      foreground: '#ffffff',
    },
    secondary: {
      DEFAULT: '#0284c7', // sky-600
      hover: '#0369a1',   // sky-700
      light: '#f0f9ff',   // sky-50
      dark: '#0c4a6e',    // sky-900
      foreground: '#ffffff',
    },
    accent: {
      DEFAULT: '#d97706', // amber-600 (warm humanitarian warmth)
      hover: '#b45309',   // amber-700
      light: '#fffbeb',   // amber-50
      foreground: '#ffffff',
    },
    neutral: {
      canvas: '#f8fafc',  // slate-50
      card: '#ffffff',
      surface: '#f1f5f9', // slate-100
      border: '#e2e8f0',  // slate-200
      subtle: '#cbd5e1',  // slate-300
      muted: '#64748b',   // slate-500
      body: '#334155',    // slate-700
      heading: '#0f172a', // slate-900
    },
    feedback: {
      success: {
        DEFAULT: '#10b981', // emerald-500
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#065f46',
      },
      warning: {
        DEFAULT: '#f59e0b', // amber-500
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#92400e',
      },
      destructive: {
        DEFAULT: '#ef4444', // red-500
        bg: '#fef2f2',
        border: '#fecaca',
        text: '#991b1b',
      },
      info: {
        DEFAULT: '#3b82f6', // blue-500
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1e40af',
      },
    },
  },

  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'Outfit, Inter, system-ui, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },

  radius: {
    none: '0px',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  elevation: {
    none: 'none',
    subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    elevated: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
