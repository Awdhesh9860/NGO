import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Pagination } from './Pagination';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { Input } from './Input';

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  totalCount,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  searchable = false,
  searchPlaceholder = 'Search records...',
  onSearchChange,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items to display matching your criteria.',
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  const isAllSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(keyExtractor(item)));

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <div className="flex items-center justify-between gap-3">
          <div className="max-w-xs w-full">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              icon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                {selectable && (
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => onSelectAll?.(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={cn(
                      'px-4 py-3',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer select-none hover:bg-slate-100 transition'
                    )}
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'right' && 'flex-row-reverse'
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {sortColumn === col.id ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-emerald-600" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-12 text-center"
                  >
                    <Spinner size="md" label="Loading records..." />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-10 text-center"
                  >
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-none bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const key = keyExtractor(row);
                  const isSelected = selectedIds.includes(key);

                  return (
                    <tr
                      key={key}
                      className={cn(
                        'hover:bg-slate-50/80 transition-colors',
                        isSelected && 'bg-emerald-50/40'
                      )}
                    >
                      {selectable && (
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelectRow?.(key, e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const cellContent = col.cell
                          ? col.cell(row, idx)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? '')
                          : null;

                        return (
                          <td
                            key={col.id}
                            className={cn(
                              'px-4 py-3 text-slate-700',
                              col.align === 'center' && 'text-center',
                              col.align === 'right' && 'text-right'
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalCount !== undefined && onPageChange && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
