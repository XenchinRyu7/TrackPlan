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

// Pure monochromatic black & white dark mode styling
export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  SAVED: {
    label: 'Saved',
    badgeClass: 'bg-zinc-900/90 text-zinc-300 border-zinc-800',
    dotColor: 'bg-zinc-500',
    chipVariant: 'bordered',
    chipColor: 'default',
  },
  APPLIED: {
    label: 'Applied',
    badgeClass: 'bg-zinc-900 text-zinc-100 border-zinc-700',
    dotColor: 'bg-zinc-200',
    chipVariant: 'flat',
    chipColor: 'default',
  },
  SCREENING: {
    label: 'Screening',
    badgeClass: 'bg-zinc-800/90 text-zinc-100 border-zinc-600',
    dotColor: 'bg-zinc-300',
    chipVariant: 'bordered',
    chipColor: 'default',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClass: 'bg-white text-zinc-950 font-bold border-white shadow-sm shadow-white/10',
    dotColor: 'bg-zinc-950',
    chipVariant: 'solid',
    chipColor: 'default',
  },
  OFFER: {
    label: 'Offer',
    badgeClass: 'bg-zinc-100 text-zinc-950 font-bold border-zinc-200 shadow-sm shadow-white/20',
    dotColor: 'bg-zinc-950',
    chipVariant: 'solid',
    chipColor: 'default',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-zinc-900/60 text-zinc-400 border-zinc-800 line-through decoration-zinc-500',
    dotColor: 'bg-zinc-600',
    chipVariant: 'bordered',
    chipColor: 'default',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    badgeClass: 'bg-zinc-950 text-zinc-500 border-zinc-800',
    dotColor: 'bg-zinc-700',
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
