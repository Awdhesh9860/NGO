/**
 * Consistent Enterprise Navigation Design System Tokens
 * Single source of truth for header dimensions, logo aspect ratio, typography,
 * spacing, icons, and transition timings across Public & Dashboard surfaces.
 */

export const NAV_TOKENS = {
  /** Fixed single-row header height across all viewports (64px) to prevent layout shift. */
  headerHeightClass: 'h-16',
  headerHeightPx: 64,
  /** Fixed container width & horizontal padding */
  containerClass: 'mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6',
  /** Fixed square logo mark preventing distortion at any breakpoint */
  logoMarkClass:
    'flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-xl bg-gradient-to-tr from-[#087F5B] via-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-950/20 border border-emerald-400/30',
  logoTitleClass: 'text-[15px] sm:text-base font-black tracking-tight leading-none whitespace-nowrap',
  logoSubtitleClass: 'text-[10px] font-medium leading-none mt-0.5 whitespace-nowrap',
  /** Primary navigation link typography & spacing */
  primaryItemClass:
    'inline-flex h-9 items-center gap-1 rounded-xl px-2.5 xl:px-3 text-[13px] font-semibold tracking-tight whitespace-nowrap transition-colors duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-emerald-400',
  /** Action button fixed dimensions */
  iconButtonClass:
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-emerald-400',
  /** Standard icon dimension across navigation */
  iconSizeClass: 'h-4 w-4 shrink-0',
  /** Smooth GPU-composited hide/show transform respecting prefers-reduced-motion */
  autoHideTransitionClass:
    'transform-gpu transition-transform duration-200 ease-out motion-reduce:transition-none will-change-transform',
} as const;

export const RESPONSIVE_BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
  smallLaptopMax: 1279,
  desktopMin: 1280,
} as const;
