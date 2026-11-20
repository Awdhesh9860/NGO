'use client';

import { useEffect, useRef, useState } from 'react';

export interface ScrollDirectionOptions {
  /** Scroll distance from top within which header always remains visible (default: 24px). */
  topShowOffset?: number;
  /** Minimum scrollY before auto-hide can activate (default: 80px). */
  hideAfterY?: number;
  /** Minimum downward delta required to trigger hide — ignores jitter (default: 10px). */
  downThreshold?: number;
  /** Minimum upward delta required to immediately reveal header (default: 6px). */
  upThreshold?: number;
  /** When true (e.g., dropdown open, mobile drawer open, search active), header stays pinned visible. */
  lockedVisible?: boolean;
  /** Route key/pathname so header cleanly reappears after page navigation. */
  resetKey?: string | null;
}

export interface ScrollNavState {
  isHidden: boolean;
  isScrolled: boolean;
  direction: 'up' | 'down' | 'idle';
  scrollY: number;
}

/**
 * Pure deterministic scroll auto-hide state transition.
 * Exported directly so unit tests verify every threshold, jitter, top-of-page, and lock edge case.
 */
export function computeScrollNavState(params: {
  currentY: number;
  lastY: number;
  wasHidden: boolean;
  previousDirection: 'up' | 'down' | 'idle';
  lockedVisible?: boolean;
  topShowOffset?: number;
  hideAfterY?: number;
  downThreshold?: number;
  upThreshold?: number;
}): { nextState: ScrollNavState; nextLastY: number } {
  const {
    currentY,
    lastY,
    wasHidden,
    previousDirection,
    lockedVisible = false,
    topShowOffset = 24,
    hideAfterY = 80,
    downThreshold = 10,
    upThreshold = 6,
  } = params;

  const safeY = Math.max(0, currentY);
  const isScrolled = safeY > topShowOffset;

  // Always show near the top of the page or when an interactive menu/drawer is open
  if (lockedVisible || safeY <= topShowOffset) {
    return {
      nextState: {
        isHidden: false,
        isScrolled,
        direction: safeY <= topShowOffset ? 'idle' : previousDirection,
        scrollY: safeY,
      },
      nextLastY: safeY,
    };
  }

  const delta = safeY - lastY;

  // Scrolling downward past threshold and beyond hideAfterY -> hide smoothly
  if (delta >= downThreshold && safeY > hideAfterY) {
    return {
      nextState: {
        isHidden: true,
        isScrolled: true,
        direction: 'down',
        scrollY: safeY,
      },
      nextLastY: safeY,
    };
  }

  // Scrolling upward past threshold -> immediately restore navigation
  if (delta <= -upThreshold) {
    return {
      nextState: {
        isHidden: false,
        isScrolled: true,
        direction: 'up',
        scrollY: safeY,
      },
      nextLastY: safeY,
    };
  }

  // Ignore tiny scroll movements / micro-jitter to prevent flickering
  return {
    nextState: {
      isHidden: wasHidden,
      isScrolled,
      direction: previousDirection,
      scrollY: safeY,
    },
    nextLastY: lastY,
  };
}

/**
 * High-performance scroll-aware auto-hide controller:
 * - Passive scroll listener + requestAnimationFrame throttling
 * - Zero redundant React state updates when visibility/scrolled flags are unchanged
 * - Resets cleanly on route transitions and respects lockedVisible menus
 */
export function useScrollDirection(options: ScrollDirectionOptions = {}): ScrollNavState {
  const {
    topShowOffset = 24,
    hideAfterY = 80,
    downThreshold = 10,
    upThreshold = 6,
    lockedVisible = false,
    resetKey = null,
  } = options;

  const [state, setState] = useState<ScrollNavState>({
    isHidden: false,
    isScrolled: false,
    direction: 'idle',
    scrollY: 0,
  });

  const lastYRef = useRef(0);
  const stateRef = useRef<ScrollNavState>(state);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Reset visibility cleanly whenever route changes or menu locks header open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentY = Math.max(0, window.scrollY || 0);
    lastYRef.current = currentY;
    const nextScrolled = currentY > topShowOffset;
    const frame = window.requestAnimationFrame(() => {
      setState((prev) => {
        if (!prev.isHidden && prev.isScrolled === nextScrolled) return prev;
        return {
          isHidden: false,
          isScrolled: nextScrolled,
          direction: 'idle',
          scrollY: currentY,
        };
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [resetKey, lockedVisible, topShowOffset]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastYRef.current = Math.max(0, window.scrollY || 0);

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const currentY = Math.max(0, window.scrollY || 0);
        const prev = stateRef.current;

        const { nextState, nextLastY } = computeScrollNavState({
          currentY,
          lastY: lastYRef.current,
          wasHidden: prev.isHidden,
          previousDirection: prev.direction,
          lockedVisible,
          topShowOffset,
          hideAfterY,
          downThreshold,
          upThreshold,
        });

        lastYRef.current = nextLastY;

        if (
          nextState.isHidden !== prev.isHidden ||
          nextState.isScrolled !== prev.isScrolled ||
          nextState.direction !== prev.direction
        ) {
          stateRef.current = nextState;
          setState(nextState);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [lockedVisible, topShowOffset, hideAfterY, downThreshold, upThreshold]);

  return {
    ...state,
    isHidden: lockedVisible ? false : state.isHidden,
  };
}
