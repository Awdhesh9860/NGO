import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  className,
}) => {
  const [expandedIds, setExpandedIds] = React.useState<string[]>(defaultExpandedIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setExpandedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden', className)}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div key={item.id} className="transition-colors">
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isExpanded}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-3',
                  isExpanded && 'rotate-180 text-emerald-600'
                )}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed animate-in fade-in-50 duration-150">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
