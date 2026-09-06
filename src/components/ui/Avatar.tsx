import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const statusClasses = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-bold bg-slate-100 text-slate-700 border border-slate-200 select-none',
          sizeClasses[size],
          className
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(fallback)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
};
