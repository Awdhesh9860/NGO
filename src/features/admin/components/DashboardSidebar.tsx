'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  CheckSquare,
  Flag,
  BarChart3,
  Users,
  ShieldCheck,
  Building2,
  Mail,
  Building,
  Settings,
  History,
  Bell,
  Megaphone,
  HeartHandshake,
  HandCoins,
  CreditCard,
  Repeat,
  FileText,
  RotateCcw,
  LineChart,
  UserCheck,
  ClipboardList,
  Award,
  BadgeCheck,
  UsersRound,
  ShieldAlert,
  PieChart,
  Landmark,
  BookOpen,
  FolderTree,
  Receipt,
  Scale,
  Wallet,
  Briefcase,
  FileSpreadsheet,
  FileCheck2,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '@/types';
import {
  AdminNavGroupKey,
  AdminNavIconKey,
  getGroupedAdminNav,
} from '../config/navigation';
import { OrganizationSwitcher } from './OrganizationSwitcher';

const ICON_MAP: Record<AdminNavIconKey, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  programs: Layers,
  projects: FolderKanban,
  tasks: CheckSquare,
  milestones: Flag,
  'project-reports': BarChart3,
  campaigns: Megaphone,
  donors: HeartHandshake,
  donations: HandCoins,
  payments: CreditCard,
  recurring: Repeat,
  receipts: FileText,
  refunds: RotateCcw,
  fundraising: LineChart,
  volunteers: UserCheck,
  'volunteer-apps': ClipboardList,
  members: Award,
  'member-plans': BadgeCheck,
  beneficiaries: UsersRound,
  safeguarding: ShieldAlert,
  stakeholders: PieChart,
  'finance-dashboard': Wallet,
  'chart-of-accounts': FolderTree,
  journals: BookOpen,
  ledger: Scale,
  expenses: Receipt,
  vendors: Briefcase,
  banking: Landmark,
  budgets: BarChart3,
  grants: Award,
  'financial-reports': FileSpreadsheet,
  compliance: FileCheck2,
  users: Users,
  roles: ShieldCheck,
  departments: Building2,
  invitations: Mail,
  organization: Building,
  settings: Settings,
  audit: History,
  notifications: Bell,
};

export interface DashboardSidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  orgName?: string;
  orgStatus?: string;
  orgVerificationStatus?: string;
}

export function DashboardSidebar({
  role,
  isOpen,
  onClose,
  orgName,
  orgStatus,
  orgVerificationStatus,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const groupedSections = getGroupedAdminNav(role);

  const isItemActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Track explicitly toggled groups; `Core` and the currently active route's group auto-open
  const [expandedGroups, setExpandedGroups] = useState<Partial<Record<AdminNavGroupKey, boolean>>>({
    Core: true,
  });

  // Prevent background scrolling & close cleanly on Escape when mobile sidebar drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const toggleGroup = (group: AdminNavGroupKey, currentlyExpanded: boolean) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !currentlyExpanded,
    }));
  };

  return (
    <>
      <aside
        aria-label="Admin sidebar navigation"
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 transform border-r border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#10201a] pt-16 lg:pt-0 transition-transform duration-200 ease-in-out motion-reduce:transition-none lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 block' : '-translate-x-full hidden lg:block'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-3.5 overflow-y-auto">
          <div className="space-y-2.5">
            {groupedSections.map(({ group, items }) => {
              const hasActiveItem = items.some((item) => isItemActive(item.href, item.exact));
              const isExpanded =
                expandedGroups[group] !== undefined
                  ? Boolean(expandedGroups[group])
                  : group === 'Core' || hasActiveItem;

              return (
                <div
                  key={group}
                  className="rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-[#1d332b]/80"
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleGroup(group, isExpanded)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#152721] hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{group}</span>
                      <span className="rounded-full bg-slate-100 dark:bg-[#182d25] px-1.5 py-0.2 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                        {items.length}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-150 motion-reduce:transition-none ${
                        isExpanded ? 'rotate-180 text-[#087F5B] dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <nav className="mt-1 space-y-0.5 pl-0.5" aria-label={`${group} navigation`}>
                      {items.map((item) => {
                        const active = isItemActive(item.href, item.exact);
                        const Icon = ICON_MAP[item.icon];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-current={active ? 'page' : undefined}
                            onClick={() => {
                              router.push(item.href);
                              onClose();
                            }}
                            className={`flex w-full min-h-[38px] items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                              active
                                ? 'bg-emerald-50 text-[#087F5B] dark:bg-emerald-950/70 dark:text-emerald-300 font-bold shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172b22] hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                active ? 'text-[#087F5B] dark:text-emerald-400' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                    </nav>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1d332b]">
            <OrganizationSwitcher
              currentOrgName={orgName}
              currentOrgStatus={orgStatus}
              verificationStatus={orgVerificationStatus}
            />
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
