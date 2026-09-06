import React from 'react';
import { cn } from '../../lib/utils';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 focus:outline-hidden animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.id} className="my-1 border-t border-slate-100" />;
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors',
                  item.destructive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  item.disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
