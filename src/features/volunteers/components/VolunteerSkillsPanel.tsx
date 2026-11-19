'use client';

import React from 'react';
import { VolunteerItem } from '../services/volunteer-api.service';

export function VolunteerSkillsPanel({ volunteer }: { volunteer: VolunteerItem }) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4 text-xs">
      <h3 className="text-sm font-black text-slate-900 dark:text-white">
        Skills, Interests &amp; Availability
      </h3>

      <div>
        <div className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {volunteer.skills.length > 0 ? (
            volunteer.skills.map((s) => (
              <span
                key={s}
                className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 font-semibold text-emerald-800 dark:text-emerald-300"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-slate-400">No skills listed</span>
          )}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">Areas of Interest</div>
        <div className="flex flex-wrap gap-1.5">
          {volunteer.areasOfInterest.length > 0 ? (
            volunteer.areasOfInterest.map((i) => (
              <span
                key={i}
                className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 font-semibold text-sky-800 dark:text-sky-300"
              >
                {i}
              </span>
            ))
          ) : (
            <span className="text-slate-400">General community support</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#1d332b]">
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Availability</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{volunteer.availability}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Languages</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {volunteer.languagesKnown.join(', ') || 'Not specified'}
          </span>
        </div>
      </div>
    </div>
  );
}
