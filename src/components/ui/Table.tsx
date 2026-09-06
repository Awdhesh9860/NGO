import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className={`w-full text-left text-xs sm:text-sm text-slate-700 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={`border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>{children}</tbody>;
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr className={`transition hover:bg-slate-50/60 ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th className={`px-4 py-3.5 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-4 py-3.5 ${className}`} {...props}>
      {children}
    </td>
  );
};

export const TableEmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  colSpan?: number;
}> = ({
  title = 'No records found',
  description = 'There is currently no data to display matching your criteria.',
  icon,
  colSpan = 6
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center space-y-2">
          {icon && <div className="text-slate-300">{icon}</div>}
          <p className="font-bold text-slate-700 text-sm">{title}</p>
          <p className="text-xs text-slate-400 max-w-sm">{description}</p>
        </div>
      </td>
    </tr>
  );
};
