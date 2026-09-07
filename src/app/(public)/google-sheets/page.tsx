'use client';

import dynamic from 'next/dynamic';
import { useViewNavigation } from '../../../hooks/useViewNavigation';

// The Google Sheets hub initializes the Firebase Auth SDK at module scope,
// which assumes a browser environment — load it client-only to keep this
// one admin-utility page from crashing SSR for the rest of the site.
const GoogleSheetsView = dynamic(
  () => import('../../../components/public/GoogleSheetsView').then((m) => m.GoogleSheetsView),
  { ssr: false }
);

export default function GoogleSheetsPage() {
  const onNavigate = useViewNavigation();

  return <GoogleSheetsView onNavigate={onNavigate} />;
}
