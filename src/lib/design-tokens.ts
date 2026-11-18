/**
 * Enterprise NGO Design System Tokens
 * Defines standardized semantic tokens for colors, typography, spacing, elevations, and responsive breakpoints.
 * Color Direction: Deep Emerald (#087F5B), Sky Blue (#2787C7), Humanitarian Amber (#E9A23B), and Nature Neutrals.
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary - Deep Emerald & Forest (Trust & Mission)
    primary: {
      DEFAULT: '#087F5B', // Deep Emerald
      dark: '#075B43',    // Dark Forest
      light: '#E8F5EF',   // Soft Emerald
      hover: '#075B43',
      foreground: '#FFFFFF',
    },
    // Secondary - Sky Blue (Humanitarian Hope & Clean Water)
    secondary: {
      DEFAULT: '#2787C7', // Sky Blue
      dark: '#1B689C',
      light: '#EAF4FC',   // Soft Sky
      hover: '#1B689C',
      foreground: '#FFFFFF',
    },
    // Accent - Humanitarian Amber (Urgency, Warmth & Energy)
    accent: {
      DEFAULT: '#E9A23B', // Humanitarian Amber
      dark: '#B8791E',
      light: '#FFF4DF',   // Soft Amber
      hover: '#B8791E',
      foreground: '#FFFFFF',
    },
    // Nature-Inspired Neutral Palette
    neutral: {
      primaryText: '#172B24',   // Deep Nature Forest Text
      secondaryText: '#64746D', // Muted Moss Slate
      mainBg: '#FFFFFF',        // Pure White
      softBg: '#F7FAF8',        // Soft Mineral Background
      border: '#E3EBE6',        // Subtle Sage Border
      darkSurface: '#13231D',   // Deep Charcoal Surface
      card: '#FFFFFF',
      muted: '#8A9A93',
    },
    // Standard Feedback Tokens
    feedback: {
      success: {
        DEFAULT: '#087F5B',
        bg: '#E8F5EF',
        border: '#B2E2D3',
        text: '#075B43',
      },
      warning: {
        DEFAULT: '#E9A23B',
        bg: '#FFF4DF',
        border: '#FCE0B3',
        text: '#B8791E',
      },
      destructive: {
        DEFAULT: '#D9383A',
        bg: '#FDE8E8',
        border: '#F8B4B4',
        text: '#9B1C1C',
      },
      info: {
        DEFAULT: '#2787C7',
        bg: '#EAF4FC',
        border: '#B8DCF5',
        text: '#1B689C',
      },
    },
  },

  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'Inter, system-ui, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    scale: {
      display: {
        fontSize: '3.5rem',    // 56px
        lineHeight: '1.15',
        fontWeight: '900',
        letterSpacing: '-0.025em',
      },
      h1: {
        fontSize: '2.5rem',     // 40px
        lineHeight: '1.2',
        fontWeight: '800',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',       // 32px
        lineHeight: '1.25',
        fontWeight: '700',
        letterSpacing: '-0.015em',
      },
      h3: {
        fontSize: '1.5rem',     // 24px
        lineHeight: '1.3',
        fontWeight: '700',
        letterSpacing: '-0.01em',
      },
      h4: {
        fontSize: '1.25rem',    // 20px
        lineHeight: '1.4',
        fontWeight: '600',
      },
      bodyLarge: {
        fontSize: '1.125rem',   // 18px
        lineHeight: '1.6',
        fontWeight: '400',
      },
      body: {
        fontSize: '1rem',        // 16px
        lineHeight: '1.6',
        fontWeight: '400',
      },
      bodySmall: {
        fontSize: '0.875rem',   // 14px
        lineHeight: '1.5',
        fontWeight: '400',
      },
      caption: {
        fontSize: '0.75rem',    // 12px
        lineHeight: '1.4',
        fontWeight: '500',
      },
      label: {
        fontSize: '0.75rem',    // 12px
        lineHeight: '1',
        fontWeight: '700',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
    },
  },

  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },

  radius: {
    none: '0px',
    xs: '0.25rem',   // 4px
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  elevation: {
    none: 'none',
    subtle: '0 1px 2px 0 rgba(23, 43, 36, 0.05)',
    card: '0 1px 3px 0 rgba(23, 43, 36, 0.08), 0 1px 2px -1px rgba(23, 43, 36, 0.05)',
    elevated: '0 4px 6px -1px rgba(23, 43, 36, 0.08), 0 2px 4px -2px rgba(23, 43, 36, 0.05)',
    modal: '0 20px 25px -5px rgba(23, 43, 36, 0.1), 0 8px 10px -6px rgba(23, 43, 36, 0.05)',
  },

  layout: {
    sidebarWidth: '280px',
    sidebarCollapsedWidth: '76px',
    headerHeight: '72px',
    containerMaxWidth: '1280px',
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
export default DESIGN_TOKENS;
