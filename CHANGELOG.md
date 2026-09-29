# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-29

### Added
- **Local-first Architecture**: Offline-first storage powered by pure-Go SQLite with WAL (Write-Ahead Logging) mode.
- **HeroUI React Monochrome Design**: Modern dark mode aesthetic built with HeroUI React 3.2 and Tailwind CSS v4.
- **Dashboard Overview**:
  - 5 interactive KPI metrics: Total Applications, Active Pipeline, Interviews, Offers, and Rejected.
  - Minimalist Status Distribution breakdown progress bar.
  - Recent Applications table with direct inspection.
- **Interactive Schedule & Calendar**:
  - Google Calendar / Notion Calendar-style monthly grid.
  - Month & Year picker with quick "Today" navigation.
  - Displays scheduled interview dates, application submission dates, and timeline logs.
  - Daily agenda panel with quick "+ Schedule Interview" action.
  - Upcoming interviews countdown list.
- **Pipeline Management**:
  - Full case-insensitive search across company, position, location, notes, and contacts.
  - Dual view modes: Data Table and Kanban Board.
  - Filtering by application type (Job, Internship) and status.
  - Sorting options (recently updated, applied dates, company alphabetical).
- **Application Detail & Timeline**:
  - Complete application metadata inspection.
  - Chronological timeline events for each status transition with notes.
  - External links opened securely in default browser.
- **Data & Backup Management**:
  - One-click native database backup (`.db`) and restore.
  - Spreadsheet export (`.csv`) and structured backup export (`.json`).
  - Data import from JSON files.
- **Keyboard Shortcuts**:
  - `Ctrl + N` / `Cmd + N`: Instant new application creation.
  - `/`: Instant search focus.
  - `Esc`: Close any open dialog or drawer.
  - `Ctrl + Enter`: Save application forms.
