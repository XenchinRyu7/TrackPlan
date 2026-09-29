import React from 'react';
import { Chip } from '@heroui/react';
import { ApplicationStatus, STATUS_CONFIG } from '../../constants/status';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status as ApplicationStatus] || STATUS_CONFIG.SAVED;
  const isInterviewOrOffer = status === 'INTERVIEW' || status === 'OFFER';

  return (
    <Chip
      size={size}
      className={`border font-medium text-[11px] h-6 px-2.5 rounded-md inline-flex items-center gap-1.5 ${
        isInterviewOrOffer
          ? 'bg-white text-zinc-950 border-white font-semibold'
          : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80'
      } ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isInterviewOrOffer ? 'bg-zinc-950' : 'bg-zinc-400'
          }`}
        />
      )}
      <span>{config.label}</span>
    </Chip>
  );
};

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className = '' }) => {
  const isJob = type === 'JOB';
  return (
    <Chip
      size="sm"
      className={`border font-mono text-[10px] uppercase tracking-wider h-5 px-1.5 rounded bg-zinc-950 text-zinc-300 border-zinc-700/70 inline-flex items-center ${className}`}
    >
      <span>{isJob ? 'Job' : 'Intern'}</span>
    </Chip>
  );
};
