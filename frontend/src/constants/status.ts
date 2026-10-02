export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ApplicationType = 'JOB' | 'INTERNSHIP';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotColor: string;
  chipVariant: 'solid' | 'bordered' | 'flat' | 'faded';
  chipColor: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

// Rich, vibrant, modern status color styling
export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  SAVED: {
    label: 'Saved',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-medium',
    dotColor: 'bg-cyan-400',
    chipVariant: 'bordered',
    chipColor: 'primary',
  },
  APPLIED: {
    label: 'Applied',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-medium',
    dotColor: 'bg-blue-400',
    chipVariant: 'flat',
    chipColor: 'primary',
  },
  SCREENING: {
    label: 'Screening',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-medium',
    dotColor: 'bg-purple-400',
    chipVariant: 'bordered',
    chipColor: 'secondary',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm shadow-amber-500/10',
    dotColor: 'bg-amber-400',
    chipVariant: 'solid',
    chipColor: 'warning',
  },
  OFFER: {
    label: 'Offer',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm shadow-emerald-500/10',
    dotColor: 'bg-emerald-400',
    chipVariant: 'solid',
    chipColor: 'success',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-medium',
    dotColor: 'bg-rose-400',
    chipVariant: 'bordered',
    chipColor: 'danger',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    badgeClass: 'bg-zinc-800/80 text-zinc-400 border-zinc-700 font-medium',
    dotColor: 'bg-zinc-500',
    chipVariant: 'bordered',
    chipColor: 'default',
  },
};

export const ALL_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export const CURRENCIES = ['IDR', 'USD', 'SGD', 'EUR', 'GBP', 'JPY', 'OTHER'];
