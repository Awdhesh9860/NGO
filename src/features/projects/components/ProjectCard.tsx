'use client';

import React from 'react';
import { ProjectListItem } from '../services/project-api.service';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectProgress } from './ProjectProgress';
import { MapPin, Users, Calendar, ArrowUpRight, AlertTriangle, Globe } from 'lucide-react';

export interface ProjectCardProps {
  project: ProjectListItem;
  onOpen: (id: string) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400">{project.code}</span>
              {project.isPublicVisible && (
                <span className="inline-flex items-center gap-0.5 rounded bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-300">
                  <Globe className="h-2.5 w-2.5" /> Public
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{project.name}</h3>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
            {project.category}
          </span>
          {project.program?.title && (
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
              {project.program.title}
            </span>
          )}
          {(project.riskLevel === 'HIGH' || project.riskLevel === 'CRITICAL') && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 font-bold text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-2.5 w-2.5" /> {project.riskLevel} Risk
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[32px]">
          {project.shortDescription}
        </p>

        <ProjectProgress percentage={project.progressPercentage} />

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#162920] p-2.5 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Beneficiaries</p>
            <p className="mt-0.5 font-bold text-slate-900 dark:text-white inline-flex items-center gap-1">
              <Users className="h-3 w-3 text-emerald-600" />
              {project.actualBeneficiaries}/{project.targetBeneficiaries}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">
              {project.approvedBudget !== undefined ? 'Budget' : 'Priority'}
            </p>
            <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
              {project.approvedBudget !== undefined
                ? `₹${project.approvedBudget.toLocaleString('en-IN')}`
                : project.priority}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          {project.location && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              {project.location}
            </span>
          )}
          {project.endDate && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3 text-slate-400" />
              Due {new Date(project.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1d332b] flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 truncate">
          PM: <strong className="text-slate-700 dark:text-slate-200">{project.projectManager?.name || 'Unassigned'}</strong>
        </span>
        <button
          type="button"
          onClick={() => onOpen(project.id)}
          className="inline-flex items-center gap-1 font-bold text-[#087F5B] dark:text-emerald-400 hover:underline shrink-0"
        >
          <span>Workspace</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
