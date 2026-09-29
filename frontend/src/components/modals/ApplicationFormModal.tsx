import React, { useState, useEffect } from 'react';
import { backend } from '../../../wailsjs/go/models';
import {
  ALL_STATUSES,
  STATUS_CONFIG,
  ApplicationStatus,
  ApplicationType,
  EmploymentType,
  EMPLOYMENT_TYPE_LABELS,
  CURRENCIES,
} from '../../constants/status';
import { X, Building2, Briefcase, MapPin, Globe, Mail, User, Check, CalendarCheck, AlertCircle } from 'lucide-react';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEdit: boolean) => Promise<void>;
  editItem?: backend.Application | null;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
}) => {
  const isEdit = !!editItem;

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [type, setType] = useState<ApplicationType>('JOB');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewDate, setInterviewDate] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [currency, setCurrency] = useState('IDR');
  const [jobUrl, setJobUrl] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ company?: string; position?: string; salary?: string }>({});

  const isSalaryInvalid = Boolean(
    salaryMin &&
    salaryMax &&
    parseFloat(salaryMin) > 0 &&
    parseFloat(salaryMax) > 0 &&
    parseFloat(salaryMax) < parseFloat(salaryMin)
  );

  useEffect(() => {
    if (editItem) {
      setCompany(editItem.company || '');
      setPosition(editItem.position || '');
      setType((editItem.type as ApplicationType) || 'JOB');
      setStatus((editItem.status as ApplicationStatus) || 'APPLIED');
      setAppliedDate(editItem.applied_date || new Date().toISOString().split('T')[0]);
      setInterviewDate(editItem.interview_date || '');
      setLocation(editItem.location || '');
      setEmploymentType((editItem.employment_type as EmploymentType) || '');
      setSalaryMin(editItem.salary_min > 0 ? editItem.salary_min.toString() : '');
      setSalaryMax(editItem.salary_max > 0 ? editItem.salary_max.toString() : '');
      setCurrency(editItem.currency || 'IDR');
      setJobUrl(editItem.job_url || '');
      setCompanyUrl(editItem.company_url || '');
      setContactName(editItem.contact_name || '');
      setContactEmail(editItem.contact_email || '');
      setNotes(editItem.notes || '');
      setStatusNote('');
    } else {
      setCompany('');
      setPosition('');
      setType('JOB');
      setStatus('APPLIED');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setInterviewDate('');
      setLocation('');
      setEmploymentType('FULL_TIME');
      setSalaryMin('');
      setSalaryMax('');
      setCurrency('IDR');
      setJobUrl('');
      setCompanyUrl('');
      setContactName('');
      setContactEmail('');
      setNotes('');
      setStatusNote('');
    }
    setErrors({});
  }, [editItem, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, company, position, type, status, appliedDate, interviewDate, salaryMin, salaryMax]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const errs: { company?: string; position?: string; salary?: string } = {};
    if (!company.trim()) errs.company = 'Company name is required';
    if (!position.trim()) errs.position = 'Position title is required';

    const minVal = salaryMin ? parseFloat(salaryMin) : 0;
    const maxVal = salaryMax ? parseFloat(salaryMax) : 0;

    if (minVal < 0) {
      errs.salary = 'Minimum salary cannot be negative';
    } else if (maxVal < 0) {
      errs.salary = 'Maximum salary cannot be negative';
    } else if (salaryMin && salaryMax && maxVal > 0 && minVal > 0 && maxVal < minVal) {
      errs.salary = 'Salary Max cannot be smaller than Salary Min';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        company: company.trim(),
        position: position.trim(),
        type,
        status,
        applied_date: appliedDate,
        interview_date: interviewDate.trim(),
        location: location.trim(),
        employment_type: employmentType,
        salary_min: salaryMin ? parseFloat(salaryMin) : 0,
        salary_max: salaryMax ? parseFloat(salaryMax) : 0,
        currency,
        job_url: jobUrl.trim(),
        company_url: companyUrl.trim(),
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        notes: notes.trim(),
      };

      if (isEdit) {
        payload.id = editItem!.id;
        payload.status_note = statusNote.trim();
      } else {
        payload.initial_note = statusNote.trim();
      }

      await onSubmit(payload, isEdit);
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isEdit ? 'Edit Application' : 'New Application'}
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isEdit
                ? 'Update application status, details, and interview schedules'
                : 'Fill in application and company details to log your progress'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Company & Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Company Name <span className="text-white font-bold">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Google, Tokopedia, Stripe"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company) setErrors({ ...errors, company: undefined });
                  }}
                  className={`w-full bg-zinc-950 border rounded-xl pl-8 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none transition-all ${
                    errors.company
                      ? 'border-white focus:ring-1 focus:ring-white'
                      : 'border-zinc-700 focus:border-white'
                  }`}
                  autoFocus
                />
              </div>
              {errors.company && (
                <p className="text-[10px] text-zinc-400 mt-1">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Position / Role <span className="text-white font-bold">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Backend Intern"
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value);
                    if (errors.position) setErrors({ ...errors, position: undefined });
                  }}
                  className={`w-full bg-zinc-950 border rounded-xl pl-8 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none transition-all ${
                    errors.position
                      ? 'border-white focus:ring-1 focus:ring-white'
                      : 'border-zinc-700 focus:border-white'
                  }`}
                />
              </div>
              {errors.position && (
                <p className="text-[10px] text-zinc-400 mt-1">{errors.position}</p>
              )}
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Application Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ApplicationType)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="JOB">Job</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates: Applied Date & Scheduled Interview Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Applied Date</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white cursor-pointer font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-white" />
                <span>Scheduled Interview / Test (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white cursor-pointer font-mono"
              />
            </div>
          </div>

          {/* Location & Employment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Jakarta, Remote, Hybrid"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="">(None)</option>
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compensation */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Salary Min</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000000"
                  value={salaryMin}
                  onChange={(e) => {
                    setSalaryMin(e.target.value);
                    if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
                  }}
                  className={`w-full bg-zinc-950 border rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none font-mono ${
                    isSalaryInvalid || errors.salary
                      ? 'border-red-500/80 focus:border-red-400'
                      : 'border-zinc-700 focus:border-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Salary Max</label>
                <input
                  type="number"
                  min={salaryMin ? Math.max(0, parseFloat(salaryMin) || 0) : '0'}
                  placeholder="e.g. 10000000"
                  value={salaryMax}
                  onChange={(e) => {
                    setSalaryMax(e.target.value);
                    if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
                  }}
                  className={`w-full bg-zinc-950 border rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none font-mono ${
                    isSalaryInvalid || errors.salary
                      ? 'border-red-500/80 focus:border-red-400'
                      : 'border-zinc-700 focus:border-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white cursor-pointer"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(isSalaryInvalid || errors.salary) && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.salary || 'Salary Max tidak boleh lebih kecil dari Salary Min'}</span>
              </div>
            )}
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Job Post URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Company Website</label>
              <input
                type="url"
                placeholder="https://..."
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Contact Name</label>
              <input
                type="text"
                placeholder="HR / Recruiter Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Notes & Information
            </label>
            <textarea
              rows={3}
              placeholder="Important notes, interview prep, requirements, feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-white resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/60">
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700">Ctrl+Enter</kbd> to save
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
