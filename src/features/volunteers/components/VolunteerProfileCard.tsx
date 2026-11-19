'use client';

import React from 'react';
import { VolunteerItem } from '../services/volunteer-api.service';
import { VolunteerStatusBadge } from './VolunteerStatusBadge';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

export function VolunteerProfileCard({ volunteer }: { volunteer: VolunteerItem }) {
  return (
    <div className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {volunteer.fullName}
            </h3>
            <span className="font-mono text-[11px] font-bold text-slate-500">
              {volunteer.volunteerCode}
            </span>
            <VolunteerStatusBadge status={volunteer.status} />
            <VolunteerStatusBadge status={volunteer.verificationStatus} />
          </div>
          {volunteer.occupation && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {volunteer.occupation} {volunteer.education ? `• ${volunteer.education}` : ''}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 text-lg font-black text-emerald-700 dark:text-emerald-400">
            <Clock className="h-4 w-4" />
            <span>{volunteer.verifiedHoursTotal} hrs</span>
          </div>
          <p className="text-[11px] text-slate-500">
            verified • {volunteer.completedAssignmentsCount} completed assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{volunteer.email}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{volunteer.mobileNumber || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            {[volunteer.city, volunteer.district, volunteer.state].filter(Boolean).join(', ') ||
              volunteer.country ||
              'India'}
          </span>
        </div>
      </div>

      {volunteer.verificationChecks && (
        <div className="pt-3 border-t border-slate-100 dark:border-[#1d332b] flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verification Checks:
          </span>
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
            Email: {volunteer.verificationChecks.emailVerified ? 'Yes' : 'Pending'}
          </span>
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
            Mobile: {volunteer.verificationChecks.mobileVerified ? 'Yes' : 'Pending'}
          </span>
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
            Identity: {volunteer.verificationChecks.identityVerified ? 'Verified' : 'Not Verified'}
          </span>
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
            Reference: {volunteer.verificationChecks.referenceVerified ? 'Verified' : 'Not Verified'}
          </span>
        </div>
      )}
    </div>
  );
}
