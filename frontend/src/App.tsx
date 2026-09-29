import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../wailsjs/go/models';
import {
  GetStats,
  GetApplications,
  GetRecentApplications,
  GetApplicationDetail,
  GetScheduleEvents,
  SetInterviewDate,
  CreateApplication,
  UpdateApplication,
  UpdateStatus,
  AddTimelineNote,
  DeleteApplication,
  GetDatabasePath,
} from '../wailsjs/go/main/App';

import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { KpiCards } from './components/dashboard/KpiCards';
import { StatusDistributionChart } from './components/dashboard/StatusDistributionChart';
import { RecentApplicationsTable } from './components/dashboard/RecentApplicationsTable';
import { ApplicationFilters, FilterState } from './components/applications/ApplicationFilters';
import { ApplicationTable } from './components/applications/ApplicationTable';
import { ApplicationBoard } from './components/applications/ApplicationBoard';
import { ScheduleCalendarView } from './components/calendar/ScheduleCalendarView';
import { ApplicationFormModal } from './components/modals/ApplicationFormModal';
import { ApplicationDetailModal } from './components/modals/ApplicationDetailModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { SettingsPage } from './components/settings/SettingsPage';
import { ToastContainer, ToastMessage } from './components/common/Toast';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [dbPath, setDbPath] = useState<string>('');

  // Data states
  const [stats, setStats] = useState<backend.Stats | null>(null);
  const [applications, setApplications] = useState<backend.Application[]>([]);
  const [recentApplications, setRecentApplications] = useState<backend.Application[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<backend.ScheduleEvent[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<backend.ApplicationDetail | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    status: 'ALL',
    location: '',
    sortBy: 'recently_updated',
  });
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editAppItem, setEditAppItem] = useState<backend.Application | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; company: string } | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load database info & data
  const loadData = async () => {
    try {
      const [statsData, appsData, recentData, eventsData, path] = await Promise.all([
        GetStats(),
        GetApplications(
          new backend.FilterOptions({
            search: filters.search,
            type: filters.type,
            status: filters.status,
            location: filters.location,
            sort_by: filters.sortBy,
          })
        ),
        GetRecentApplications(10),
        GetScheduleEvents(),
        GetDatabasePath(),
      ]);

      setStats(statsData);
      setApplications(appsData || []);
      setRecentApplications(recentData || []);
      setScheduleEvents(eventsData || []);
      setDbPath(path || '');
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Keyboard shortcut listener for Ctrl+N and '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditAppItem(null);
        setIsFormModalOpen(true);
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle open detail modal
  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await GetApplicationDetail(id);
      setSelectedDetail(detail);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showToast('error', 'Failed to load details', err?.message || String(err));
    }
  };

  // Handle form submit (Create or Update)
  const handleFormSubmit = async (formData: any, isEdit: boolean) => {
    try {
      if (isEdit) {
        await UpdateApplication(new backend.UpdateApplicationRequest(formData));
        showToast('success', 'Application Updated', `${formData.company} - ${formData.position}`);
      } else {
        await CreateApplication(new backend.CreateApplicationRequest(formData));
        showToast('success', 'Application Created', `${formData.company} - ${formData.position}`);
      }
      await loadData();
      if (selectedDetail && selectedDetail.id === formData.id) {
        await handleOpenDetail(formData.id);
      }
    } catch (err: any) {
      showToast('error', isEdit ? 'Update Failed' : 'Creation Failed', err?.message || String(err));
      throw err;
    }
  };

  // Quick Status change from Table, Board, or Detail
  const handleQuickStatusChange = async (id: number, newStatus: string, note?: string) => {
    try {
      await UpdateStatus(id, newStatus, note || '');
      await loadData();
      if (selectedDetail && selectedDetail.id === id) {
        await handleOpenDetail(id);
      }
      showToast('success', 'Status Updated', `Changed to ${newStatus}`);
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err?.message || String(err));
    }
  };

  // Schedule or update interview date
  const handleSetInterviewDate = async (appId: number, date: string, note: string) => {
    try {
      await SetInterviewDate(appId, date, note);
      await loadData();
      if (selectedDetail && selectedDetail.id === appId) {
        await handleOpenDetail(appId);
      }
      showToast('success', 'Interview Scheduled', date);
    } catch (err: any) {
      showToast('error', 'Scheduling Failed', err?.message || String(err));
    }
  };

  // Add timeline note from detail modal
  const handleAddTimelineNote = async (id: number, note: string) => {
    try {
      await AddTimelineNote(id, '', note);
      await handleOpenDetail(id);
      await loadData();
      showToast('success', 'Timeline Note Added');
    } catch (err: any) {
      showToast('error', 'Failed to add note', err?.message || String(err));
    }
  };

  // Delete application
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await DeleteApplication(deleteTarget.id);
      showToast('info', 'Application Deleted', deleteTarget.company);
      setDeleteTarget(null);
      if (selectedDetail && selectedDetail.id === deleteTarget.id) {
        setIsDetailModalOpen(false);
        setSelectedDetail(null);
      }
      await loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err?.message || String(err));
    }
  };

  // KPI card click handler
  const handleKpiCardClick = (statusFilter: string) => {
    if (statusFilter === 'ALL' || statusFilter === 'ACTIVE') {
      setFilters({ ...filters, status: 'ALL' });
    } else {
      setFilters({ ...filters, status: statusFilter });
    }
    setCurrentTab('applications');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-zinc-100 font-sans selection:bg-white selection:text-black">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onNewApplication={() => {
          setEditAppItem(null);
          setIsFormModalOpen(true);
        }}
        totalApplications={stats?.total_applications || 0}
        dbPath={dbPath}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-zinc-950">
        {/* Navbar */}
        <Navbar
          currentTab={currentTab}
          onNewApplication={() => {
            setEditAppItem(null);
            setIsFormModalOpen(true);
          }}
          searchQuery={filters.search}
          onSearchChange={(q) => {
            setFilters({ ...filters, search: q });
            if (currentTab !== 'applications' && q.trim()) {
              setCurrentTab('applications');
            }
          }}
          searchInputRef={searchInputRef}
        />

        {/* Tab Views Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {currentTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <KpiCards stats={stats} onCardClick={handleKpiCardClick} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5">
                  <StatusDistributionChart
                    stats={stats}
                    onSelectStatus={(st) => {
                      setFilters({ ...filters, status: st });
                      setCurrentTab('applications');
                    }}
                  />
                </div>
                <div className="lg:col-span-7">
                  <RecentApplicationsTable
                    applications={recentApplications}
                    onSelectApplication={handleOpenDetail}
                    onViewAll={() => setCurrentTab('applications')}
                    onNewApplication={() => {
                      setEditAppItem(null);
                      setIsFormModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'applications' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <ApplicationFilters
                filters={filters}
                onFilterChange={setFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalCount={applications.length}
              />

              {viewMode === 'table' ? (
                <ApplicationTable
                  applications={applications}
                  onSelectApplication={handleOpenDetail}
                  onEditApplication={(app) => {
                    setEditAppItem(app);
                    setIsFormModalOpen(true);
                  }}
                  onDeleteApplication={(id, company) => setDeleteTarget({ id, company })}
                  onQuickStatusChange={(id, newStatus) => handleQuickStatusChange(id, newStatus)}
                  onNewApplication={() => {
                    setEditAppItem(null);
                    setIsFormModalOpen(true);
                  }}
                />
              ) : (
                <ApplicationBoard
                  applications={applications}
                  onSelectApplication={handleOpenDetail}
                  onQuickStatusChange={(id, newStatus) => handleQuickStatusChange(id, newStatus)}
                  onNewApplication={() => {
                    setEditAppItem(null);
                    setIsFormModalOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {currentTab === 'schedule' && (
            <div className="max-w-7xl mx-auto">
              <ScheduleCalendarView
                events={scheduleEvents}
                applications={applications}
                onSelectApplication={handleOpenDetail}
                onSetInterviewDate={handleSetInterviewDate}
                onNewApplication={() => {
                  setEditAppItem(null);
                  setIsFormModalOpen(true);
                }}
              />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <SettingsPage
                dbPath={dbPath}
                totalApplications={stats?.total_applications || 0}
                onRefreshData={loadData}
                onShowToast={showToast}
              />
            </div>
          )}
        </main>
      </div>

      {/* Application Form Modal (Add / Edit) */}
      <ApplicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditAppItem(null);
        }}
        onSubmit={handleFormSubmit}
        editItem={editAppItem}
      />

      {/* Application Detail Modal (Timeline & Info) */}
      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetail(null);
        }}
        detail={selectedDetail}
        onEdit={(app) => {
          setIsDetailModalOpen(false);
          setEditAppItem(app);
          setIsFormModalOpen(true);
        }}
        onDelete={(id, company) => {
          setDeleteTarget({ id, company });
        }}
        onStatusChange={(id, status, note) => handleQuickStatusChange(id, status, note)}
        onAddNote={(id, note) => handleAddTimelineNote(id, note)}
        onSetInterviewDate={handleSetInterviewDate}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message={`Are you sure you want to permanently delete "${deleteTarget?.company}"? All related history and scheduled interviews will be removed.`}
      />
    </div>
  );
}

export default App;
