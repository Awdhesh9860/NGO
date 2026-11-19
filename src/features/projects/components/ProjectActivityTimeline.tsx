'use client';

import React from 'react';
import { ActivityTimeline, ActivityTimelineItem } from '@/features/admin';

export interface ProjectActivityTimelineProps {
  items: ActivityTimelineItem[];
}

export function ProjectActivityTimeline({ items }: ProjectActivityTimelineProps) {
  return (
    <ActivityTimeline
      items={items}
      emptyTitle="No project activity recorded yet"
      emptyDescription="Lifecycle changes, team assignments, approvals, budget updates, and risk entries will stream here."
    />
  );
}
