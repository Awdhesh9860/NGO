'use client';

import React from 'react';
import { ProgramItem } from '../services/program-api.service';
import { ProgramStatusBadge } from './ProgramStatusBadge';
import { Users, MapPin, ArrowUpRight, Globe, Building2 } from 'lucide-react';

export interface ProgramCardProps {
  program: ProgramItem;
  onOpen: (id: string) => void;
}

export function ProgramCard({ program, onOpen }: ProgramCardProps) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400">{program.code}</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{program.title}</h3>
          </div>
          <ProgramStatusBadge status={program.status} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            {program.category}
          </span>
          {program.isPublicVisible && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
              <Globe className="h-2.5 w-2.5" /> Public
            </span>
          )}
        </div>

        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[32px]">
          {program.shortDescription}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#162920] p-3 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Program Budget</p>
            <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
              ₹{(program.budget || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Target Reach</p>
            <p className="mt-0.5 font-bold text-slate-900 dark:text-white inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              {(program.targetBeneficiaries || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          {program.department?.name && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3 text-slate-400" />
              {program.department.name}
            </span>
          )}
          {program.geographicCoverage && program.geographicCoverage.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              {program.geographicCoverage.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1d332b] flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 truncate">
          Lead: <strong className="text-slate-700 dark:text-slate-200">{program.programManager?.name || 'Unassigned'}</strong>
        </span>
        <button
          type="button"
          onClick={() => onOpen(program.id)}
          className="inline-flex items-center gap-1 font-bold text-[#087F5B] dark:text-emerald-400 hover:underline shrink-0"
        >
          <span>Open</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
