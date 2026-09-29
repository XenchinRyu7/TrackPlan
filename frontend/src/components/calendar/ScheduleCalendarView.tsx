import React, { useState, useMemo } from 'react';
import { backend } from '../../../wailsjs/go/models';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Filter,
  X,
  CalendarDays,
  FileText
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ScheduleCalendarViewProps {
  events: backend.ScheduleEvent[];
  applications: backend.Application[];
  onSelectApplication: (id: number) => void;
  onSetInterviewDate: (appId: number, date: string, note: string) => Promise<void>;
  onNewApplication: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  events,
  applications,
  onSelectApplication,
  onSetInterviewDate,
  onNewApplication,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number>(
    applications[0]?.id || 0
  );
  const [scheduleTime, setScheduleTime] = useState<string>('10:00');
  const [scheduleNote, setScheduleNote] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'INTERVIEW' | 'APPLIED'>('ALL');

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday as 0, Sunday as 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d);
      days.push({
        dateString: prevDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const todayStr = today.toISOString().split('T')[0];

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(currentYear, currentMonth, d);
      const dateString = curDate.toISOString().split('T')[0];
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Next month padding to fill complete weeks (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      days.push({
        dateString: nextDate.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterType === 'ALL') return true;
      return e.event_type === filterType;
    });
  }, [events, filterType]);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map = new Map<string, backend.ScheduleEvent[]>();
    for (const ev of filteredEvents) {
      if (!ev.date) continue;
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [filteredEvents]);

  // Selected date events
  const selectedDateEvents = eventsByDate.get(selectedDate) || [];

  // Upcoming interviews (all from today onwards)
  const upcomingInterviews = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    return events
      .filter((e) => e.event_type === 'INTERVIEW' && e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const handleSaveInterviewSchedule = async () => {
    if (!selectedAppId || !selectedDate) return;
    const fullDate = scheduleTime ? `${selectedDate}T${scheduleTime}` : selectedDate;
    await onSetInterviewDate(selectedAppId, fullDate, scheduleNote);
    setIsScheduleModalOpen(false);
    setScheduleNote('');
  };

  // Year options for picker (current - 2 to current + 4)
  const yearOptions = useMemo(() => {
    const y = today.getFullYear();
    return [y - 2, y - 1, y, y + 1, y + 2, y + 3];
  }, []);

  return (
    <div className="space-y-5">
      {/* Calendar Header with Month/Year Pickers */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
        {/* Left: Month/Year navigation and Dropdown picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Selector */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-zinc-500 cursor-pointer font-mono"
          >
            {yearOptions.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <span className="text-sm font-bold text-white tracking-tight ml-2">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        </div>

        {/* Right: Filters & Schedule Button */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('INTERVIEW')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'INTERVIEW'
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Interviews
            </button>
            <button
              onClick={() => setFilterType('APPLIED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'APPLIED'
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Applied
            </button>
          </div>

          <button
            onClick={() => {
              if (applications.length > 0) {
                setSelectedAppId(applications[0].id);
                setIsScheduleModalOpen(true);
              } else {
                onNewApplication();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 7-col calendar and Right agenda panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="xl:col-span-8 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/60 text-center text-[11px] font-semibold text-zinc-400 py-2.5 uppercase tracking-wider">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-zinc-800/80 bg-zinc-950">
            {calendarDays.map((day, idx) => {
              const dayEvents = eventsByDate.get(day.dateString) || [];
              const isSelected = selectedDate === day.dateString;
              const hasInterview = dayEvents.some((e) => e.event_type === 'INTERVIEW');

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`min-h-[96px] p-2 flex flex-col justify-between transition-colors cursor-pointer relative group ${
                    day.isCurrentMonth
                      ? 'bg-zinc-950 hover:bg-zinc-900/70'
                      : 'bg-zinc-900/30 text-zinc-600 hover:bg-zinc-900/50'
                  } ${isSelected ? 'ring-2 ring-white z-10' : ''}`}
                >
                  {/* Top row: day number and status badge */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        day.isToday
                          ? 'bg-white text-zinc-950 font-bold shadow-sm'
                          : day.isCurrentMonth
                          ? 'text-zinc-200'
                          : 'text-zinc-600'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Preview (up to 2 visible) */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, evIdx) => {
                      const isInterview = ev.event_type === 'INTERVIEW';
                      return (
                        <div
                          key={ev.id || evIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(ev.application_id);
                          }}
                          title={`${ev.title} - ${ev.description}`}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium border cursor-pointer transition-all ${
                            isInterview
                              ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700/60 hover:border-zinc-500'
                          }`}
                        >
                          {ev.time && <span className="font-mono mr-1">{ev.time}</span>}
                          <span>{ev.company}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-zinc-500 font-mono pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Agenda & Upcoming Schedule (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          {/* Selected Date Agenda Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Agenda: {formatDate(selectedDate)}
                </h4>
              </div>
              <button
                onClick={() => {
                  if (applications.length > 0) {
                    setSelectedAppId(applications[0].id);
                    setIsScheduleModalOpen(true);
                  }
                }}
                className="text-[11px] font-semibold text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Event</span>
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No events or interviews scheduled for this date.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedDateEvents.map((ev, idx) => {
                  const isInterview = ev.event_type === 'INTERVIEW';
                  return (
                    <div
                      key={ev.id || idx}
                      onClick={() => onSelectApplication(ev.application_id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isInterview
                          ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                            isInterview
                              ? 'bg-white text-zinc-950 border-white'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {ev.event_type}
                        </span>
                        {ev.time && (
                          <span className="text-[11px] font-mono text-zinc-400">
                            {ev.time}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-white mt-1.5">{ev.company}</h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                        {ev.description || ev.position}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Interviews Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <CalendarCheck className="w-4 h-4 text-white" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Upcoming Interviews
              </h4>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No upcoming interviews currently scheduled.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {upcomingInterviews.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectApplication(ev.application_id)}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{ev.company}</span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {formatDate(ev.date)} {ev.time && `• ${ev.time}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">{ev.position}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <CalendarCheck className="w-4 h-4 text-white" />
                <span>Schedule Interview / Test</span>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Select Application
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(parseInt(e.target.value, 10))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 cursor-pointer"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} — {app.position} ({app.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 cursor-pointer font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Interview Stage / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical Coding Round with Engineering Lead"
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInterviewSchedule}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
