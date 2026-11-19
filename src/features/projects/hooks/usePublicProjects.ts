'use client';

import { useEffect, useState } from 'react';

export interface PublicProjectRecord {
  id: string;
  name: string;
  code: string;
  slug: string;
  category: string;
  program?: { id: string; title: string; slug: string } | null;
  shortDescription: string;
  detailedDescription?: string;
  location?: string;
  state?: string;
  district?: string;
  status: string;
  progressPercentage: number;
  expectedOutcomes: string[];
  keyDeliverables: string[];
  beneficiaryReach: {
    targetCount: number;
    actualCount: number;
    categories: string[];
    geographicCoverage: string[];
    outcomeSummary: string;
  };
  images: string[];
  publicPhotos?: Array<{ title: string; fileUrl: string }>;
  milestones?: Array<{ title: string; targetDate: string; status: string; completionPercentage: number }>;
}

export function usePublicProjects(programId?: string) {
  const [publishedProjects, setPublishedProjects] = useState<PublicProjectRecord[]>([]);
  const [loadedFromApi, setLoadedFromApi] = useState(false);

  useEffect(() => {
    let active = true;
    const url = programId
      ? `/api/v1/public/projects?programId=${encodeURIComponent(programId)}`
      : '/api/v1/public/projects';
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active) return;
        if (payload?.success && Array.isArray(payload.data) && payload.data.length > 0) {
          setPublishedProjects(payload.data);
          setLoadedFromApi(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [programId]);

  return { publishedProjects, loadedFromApi };
}
