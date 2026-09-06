import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Users, Shield, Check, ChevronDown, Sparkles } from 'lucide-react';

export const PersonaSwitcher: React.FC = () => {
  const { currentUser, switchUser, allUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MANAGER':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'TEAM_MEMBER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'VOLUNTEER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DONOR':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEMBER':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CONTENT_EDITOR':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'ACCOUNTANT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline text-slate-500 font-medium">Active Persona:</span>
        <span className="font-bold text-slate-900">{currentUser?.name.split(' ')[0]}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
            currentUser ? getRoleBadgeColor(currentUser.role) : ''
          }`}
        >
          {currentUser?.role.replace('_', ' ')}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
            <div className="border-b border-slate-100 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Enterprise RBAC Persona Switcher</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Switch between real authenticated identities to test role-specific dashboards & security barriers.
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto py-1 space-y-1">
              {allUsers.map((user) => {
                const isSelected = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                      isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-semibold leading-tight text-slate-900">{user.name}</p>
                        <span
                          className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase border ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
