import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1.5 text-xs sm:text-sm gap-1.5'
  };

  const itemSizeStyles = {
    sm: 'px-3 py-1.5 rounded-xl',
    md: 'px-4 py-2 rounded-xl'
  };

  return (
    <div
      className={`inline-flex flex-wrap rounded-2xl bg-slate-100/90 border border-slate-200/80 ${sizeStyles[size]} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 font-bold transition-all select-none ${itemSizeStyles[size]} ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
