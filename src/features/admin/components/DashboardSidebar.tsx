'use client';

import React from 'react';
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
} from 'lucide-react';
import { UserRole } from '@/types';
import { AdminNavIconKey, getAuthorizedAdminNav } from '../config/navigation';
import { OrganizationSwitcher } from './OrganizationSwitcher';

const ICON_MAP: Record<AdminNavIconKey, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  programs: Layers,
  projects: FolderKanban,
  tasks: CheckSquare,
  milestones: Flag,
  'project-reports': BarChart3,
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

  const items = getAuthorizedAdminNav(role);
  const groups: Array<'Core' | 'Operations' | 'Organization' | 'Security'> = [
    'Core',
    'Operations',
    'Organization',
    'Security',
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <aside
        aria-label="Admin sidebar navigation"
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 transform border-r border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] pt-16 lg:pt-0 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 block' : '-translate-x-full hidden lg:block'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-5">
            {groups.map((group) => {
              const groupItems = items.filter((item) => item.group === group);
              if (groupItems.length === 0) return null;

              return (
                <div key={group}>
                  <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group}
                  </div>
                  <nav className="space-y-1">
                    {groupItems.map((item) => {
                      const active = isActive(item.href, item.exact);
                      const Icon = ICON_MAP[item.icon];
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            router.push(item.href);
                            onClose();
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            active
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172b22] hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </nav>
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
