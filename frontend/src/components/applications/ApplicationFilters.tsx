import React from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { ALL_STATUSES, STATUS_CONFIG } from '../../constants/status';

export interface FilterState {
  search: string;
  type: string;
  status: string;
  location: string;
  sortBy: string;
}

interface ApplicationFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  viewMode: 'table' | 'board';
  onViewModeChange: (mode: 'table' | 'board') => void;
  totalCount: number;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.type !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.sortBy !== 'recently_updated';

  const resetFilters = () => {
    onFilterChange({
      search: '',
      type: 'ALL',
      status: 'ALL',
      location: '',
      sortBy: 'recently_updated',
    });
  };

  return (
    <div className="space-y-3">
      {/* Search & View Mode */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by company, position, location, contact, notes..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-medium"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl self-end md:self-auto">
          <button
            onClick={() => onViewModeChange('table')}
            title="Table View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => onViewModeChange('board')}
            title="Kanban Board View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'board'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
        </div>
      </div>

      {/* Type buttons, Status dropdown, Sort dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'JOB', label: 'Job' },
            { id: 'INTERNSHIP', label: 'Internship' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onFilterChange({ ...filters, type: item.id })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filters.type === item.id
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-900 text-zinc-200">
                All Statuses
              </option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-zinc-900 text-zinc-200">
                  {STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="recently_updated" className="bg-zinc-900 text-zinc-200">
                Recently Updated
              </option>
              <option value="oldest_updated" className="bg-zinc-900 text-zinc-200">
                Oldest Updated
              </option>
              <option value="newest_applied" className="bg-zinc-900 text-zinc-200">
                Newest Applied
              </option>
              <option value="oldest_applied" className="bg-zinc-900 text-zinc-200">
                Oldest Applied
              </option>
              <option value="company_asc" className="bg-zinc-900 text-zinc-200">
                Company A-Z
              </option>
              <option value="company_desc" className="bg-zinc-900 text-zinc-200">
                Company Z-A
              </option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-xs font-mono text-zinc-500 pl-1">
            {totalCount} {totalCount === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>
    </div>
  );
};
