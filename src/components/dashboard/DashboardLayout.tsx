import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { VolunteerPortal } from './VolunteerPortal';
import { DonorPortal } from './DonorPortal';
import { MemberPortal } from './MemberPortal';
import { StaffPortal } from './StaffPortal';
import {
  Globe,
  Shield,
  Heart,
  Users,
  Award,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DashboardLayoutProps {
  onBackToPublic: () => void;
  onOpenDonate: (campaignId?: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  onBackToPublic,
  onOpenDonate
}) => {
  const { currentUser, logout } = useAuth();

  const role = currentUser?.role || 'GUEST';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sub-header for authenticated workspace */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span>Public Portal</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900">
              {role === 'VOLUNTEER'
                ? 'Volunteer Service Hub'
                : role === 'DONOR'
                ? 'Donor Impact Portfolio'
                : role === 'MEMBER'
                ? 'Assembly Member Portal'
                : role === 'PROJECT_MANAGER' || role === 'COMMUNICATIONS'
                ? 'Field Staff Control Center'
                : 'Enterprise Administration Suite'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-700">{currentUser?.name}</span>
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                {role.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => onOpenDonate()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Heart className="h-3.5 w-3.5 fill-white" />
              <span>Donate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container rendering appropriate portal based on role */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {role === 'VOLUNTEER' && <VolunteerPortal />}
        {role === 'DONOR' && <DonorPortal onOpenDonate={onOpenDonate} />}
        {role === 'MEMBER' && <MemberPortal />}
        {(role === 'PROJECT_MANAGER' || role === 'COMMUNICATIONS') && <StaffPortal />}
        {(role === 'SUPER_ADMIN' ||
          role === 'ADMIN' ||
          role === 'EXECUTIVE_DIRECTOR' ||
          role === 'ACCOUNTANT' ||
          role === 'GUEST') && <AdminDashboard onOpenDonate={onOpenDonate} />}
      </main>
    </div>
  );
};
