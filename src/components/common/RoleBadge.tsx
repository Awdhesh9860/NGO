import React from 'react';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Briefcase,
  Users,
  Heart,
  Award,
  FileEdit,
  Calculator,
  User as UserIcon
} from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ROLE_DETAILS: Record<
  UserRole,
  {
    label: string;
    description: string;
    clearanceLevel: number;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    icon: React.ElementType;
  }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Unrestricted root governance, audit trails, user management, and financial oversight.',
    clearanceLevel: 5,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    icon: ShieldAlert
  },
  ADMIN: {
    label: 'Operations Admin',
    description: 'Full operational control, team assignment, project management, and reporting.',
    clearanceLevel: 4,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    icon: ShieldCheck
  },
  MANAGER: {
    label: 'Program Director',
    description: 'Field program administration, milestone sign-offs, and volunteer assignments.',
    clearanceLevel: 3,
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    icon: Briefcase
  },
  TEAM_MEMBER: {
    label: 'Field Lead',
    description: 'On-the-ground task execution, attendance tracking, and field project updates.',
    clearanceLevel: 2,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    icon: Users
  },
  VOLUNTEER: {
    label: 'Volunteer',
    description: 'Grassroots community support, logged service hours, and event assistance.',
    clearanceLevel: 1,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    icon: Users
  },
  DONOR: {
    label: 'Philanthropic Donor',
    description: 'Private giving portfolio, tax-exempt 80G certificates, and project tracking.',
    clearanceLevel: 1,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    icon: Heart
  },
  MEMBER: {
    label: 'Assembly Member',
    description: 'Voting rights, annual general meeting credentials, and digital membership card.',
    clearanceLevel: 2,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: Award
  },
  CONTENT_EDITOR: {
    label: 'Content Storyteller',
    description: 'CMS publishing, news dispatch, beneficiary case studies, and press releases.',
    clearanceLevel: 2,
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    icon: FileEdit
  },
  ACCOUNTANT: {
    label: 'Tax & Finance Lead',
    description: 'FCRA compliance, tax auditing, donation receipts, and financial ledger exports.',
    clearanceLevel: 3,
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    icon: Calculator
  },
  GUEST: {
    label: 'Guest Visitor',
    description: 'Public visitor exploring causes, verified impact stories, and community events.',
    clearanceLevel: 0,
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    icon: UserIcon
  },
  PROJECT_MANAGER: {
    label: 'Project Manager',
    description: 'Field execution, milestone tracking, resource deployment, and local coordination.',
    clearanceLevel: 3,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    icon: Briefcase
  },
  COMMUNICATIONS: {
    label: 'Communications Officer',
    description: 'Newsletter dispatches, press relations, stakeholder briefs, and media campaigns.',
    clearanceLevel: 2,
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    icon: FileEdit
  },
  EXECUTIVE_DIRECTOR: {
    label: 'Executive Director',
    description: 'Strategic governance, institutional stewardship, donor trust, and statutory oversight.',
    clearanceLevel: 5,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    icon: ShieldAlert
  }
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const details = ROLE_DETAILS[role] || {
    label: role,
    description: 'Standard access account',
    clearanceLevel: 1,
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    icon: UserIcon
  };

  const Icon = details.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size];

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }[size];

  return (
    <span
      title={`${details.label} (Clearance L${details.clearanceLevel}): ${details.description}`}
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-lg border ${details.badgeBg} ${details.badgeText} ${details.badgeBorder} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{details.label}</span>
    </span>
  );
};
