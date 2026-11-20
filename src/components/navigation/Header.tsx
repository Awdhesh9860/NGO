'use client';

import React from 'react';
import { MainNavigation, MainNavigationProps } from '@/features/navigation';

export type HeaderProps = MainNavigationProps;

/**
 * Backward-compatible Header export delegating to the unified
 * Enterprise Responsive Smart Navigation & Auto-Hide Header (`MainNavigation`).
 */
export const Header: React.FC<HeaderProps> = (props) => {
  return <MainNavigation {...props} />;
};
