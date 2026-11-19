'use client';

import { useEffect, useState } from 'react';

export interface PublicProgramRecord {
  id: string;
  title: string;
  slug: string;
  code: string;
  category: string;
  focusArea?: string;
  shortDescription: string;
  detailedDescription?: string;
  objectives: string[];
  targetAudience?: string;
  geographicCoverage: string[];
  expectedOutcomes: string[];
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  coverImage?: string;
  gallery: string[];
  status: string;
}

export function usePublicPrograms() {
  const [publishedPrograms, setPublishedPrograms] = useState<PublicProgramRecord[]>([]);
  const [loadedFromApi, setLoadedFromApi] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/public/programs')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active) return;
        if (payload?.success && Array.isArray(payload.data) && payload.data.length > 0) {
          setPublishedPrograms(payload.data);
          setLoadedFromApi(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return { publishedPrograms, loadedFromApi };
}
