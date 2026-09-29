# TrackWork

## 1. Product Overview

**TrackWork** adalah aplikasi desktop local-first untuk membantu pengguna mencatat, mengelola, dan memantau proses lamaran kerja dan magang.

TrackWork dirancang sebagai aplikasi desktop yang:

* Ringan dan cepat.
* Offline-first.
* Tidak membutuhkan akun.
* Tidak membutuhkan server/backend eksternal.
* Menyimpan seluruh data secara lokal.
* Berjalan di Windows, Linux, dan macOS.
* Memiliki UI modern tetapi sederhana.
* Mudah di-backup dan dipindahkan karena database berupa file lokal.

### Target platform

* Windows 10+
* Linux modern dengan desktop environment umum
* macOS 12+

### Technology stack

**Desktop**

* Wails v2/v3 sesuai versi stabil yang digunakan saat development
* Go

**Frontend**

* React
* TypeScript
* Vite

**Database**

* SQLite

**Styling**

* Tailwind CSS atau CSS modern yang ringan

**Icons**

* Lucide Icons

Tidak menggunakan Electron.

---

# 2. Product Goals

## Primary goals

1. Pengguna dapat mencatat lamaran kerja/magang dengan cepat.
2. Pengguna dapat melihat seluruh lamaran dalam satu tempat.
3. Pengguna dapat mengetahui status setiap lamaran.
4. Pengguna dapat melihat riwayat perubahan status.
5. Pengguna dapat mencari, memfilter, dan mengurutkan lamaran.
6. Pengguna dapat melihat ringkasan statistik lamaran.
7. Aplikasi tetap berguna sepenuhnya tanpa internet.
8. Aplikasi terasa native, ringan, dan responsif.

## Secondary goals

* Backup dan restore database dengan mudah.
* Import/export data.
* Keyboard-friendly workflow.
* Dark/light theme.
* Portable database.

---

# 3. Non-Goals

MVP TIDAK mencakup:

* User account.
* Cloud synchronization.
* Social login.
* Online database.
* Job scraping.
* Automatic application submission.
* Email sending.
* Email synchronization.
* Browser extension.
* AI assistant.
* Calendar synchronization.
* Mobile application.
* Collaboration / multi-user.
* Subscription system.
* Analytics server.

Semua fitur tersebut dapat dipertimbangkan untuk versi mendatang.

---

# 4. Core User Flow

## First launch

Saat pertama kali aplikasi dibuka:

1. TrackWork membuat database SQLite lokal.
2. User melihat empty state.
3. User dapat langsung membuat application pertama.
4. Tidak ada login atau onboarding panjang.

Flow:

```text
Launch
  ↓
Initialize SQLite
  ↓
Dashboard
  ↓
Empty State
  ↓
Add Application
```

---

# 5. Application Entity

Setiap application merepresentasikan satu lamaran.

## Required fields

### Company

Nama perusahaan.

Example:

```text
Google
Microsoft
Tokopedia
Startup XYZ
```

### Position

Posisi yang dilamar.

Example:

```text
Software Engineer Intern
Backend Engineer
Frontend Developer
```

### Type

Enum:

```text
JOB
INTERNSHIP
```

### Status

Initial status:

```text
SAVED
APPLIED
SCREENING
INTERVIEW
OFFER
REJECTED
WITHDRAWN
```

### Applied Date

Tanggal ketika lamaran dikirim.

---

# 6. Optional Application Fields

Application dapat memiliki:

### Location

Example:

```text
Jakarta
Bandung
Remote
Hybrid
```

### Employment type

Enum:

```text
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
FREELANCE
```

### Salary Min

Optional numeric value.

### Salary Max

Optional numeric value.

### Currency

Default:

```text
IDR
```

Allow:

```text
IDR
USD
SGD
EUR
GBP
JPY
OTHER
```

### Job URL

URL lowongan.

### Company URL

URL perusahaan.

### Contact Name

Optional.

### Contact Email

Optional.

### Notes

Free-form text.

---

# 7. Application Timeline

Setiap application mempunyai status history.

Contoh:

```text
Google
Software Engineer Intern

12 Sep
Applied

15 Sep
Screening

20 Sep
Technical Interview

25 Sep
Waiting
```

Setiap perubahan status menghasilkan timeline event.

## Timeline event

Fields:

```text
id
application_id
status
created_at
note
```

Example:

```text
status: INTERVIEW
created_at: 2026-09-20
note: Technical interview with backend team
```

User dapat menambahkan note ketika mengubah status.

---

# 8. Status Behavior

## SAVED

Lowongan disimpan tetapi belum dilamar.

## APPLIED

Lamaran sudah dikirim.

## SCREENING

Sedang melalui HR/recruiter screening.

## INTERVIEW

User sedang berada dalam proses interview.

## OFFER

User menerima offer.

## REJECTED

Lamaran ditolak.

## WITHDRAWN

User membatalkan proses lamaran.

---

# 9. Status Transitions

Tidak perlu memaksakan state machine yang terlalu ketat.

User boleh mengubah status secara manual.

Contoh:

```text
SAVED → APPLIED
APPLIED → SCREENING
APPLIED → INTERVIEW
SCREENING → INTERVIEW
INTERVIEW → OFFER
INTERVIEW → REJECTED
APPLIED → REJECTED
INTERVIEW → WITHDRAWN
```

Namun aplikasi tetap mengizinkan perubahan status arbitrary untuk menangani kondisi dunia nyata.

Setiap perubahan status tetap dicatat di timeline.

---

# 10. Dashboard

Dashboard adalah halaman utama.

## KPI cards

Tampilkan:

```text
Total Applications
Active Applications
Interviews
Offers
Rejected
```

### Total Applications

Semua application yang tersimpan.

### Active Applications

Semua application dengan status:

```text
SAVED
APPLIED
SCREENING
INTERVIEW
```

### Interviews

Jumlah application dengan status:

```text
INTERVIEW
```

### Offers

Jumlah application:

```text
OFFER
```

### Rejected

Jumlah application:

```text
REJECTED
```

---

# 11. Dashboard Recent Applications

Tampilkan application terbaru.

Columns:

```text
Company
Position
Type
Status
Applied Date
Last Updated
```

Default:

10 application terbaru.

Klik row membuka Application Detail.

---

# 12. Dashboard Status Distribution

Tampilkan visualisasi sederhana:

```text
Applied       ██████████
Screening     ████
Interview     ███
Offer         █
Rejected      █████
```

Gunakan chart ringan.

Jangan menggunakan library chart besar jika tidak diperlukan.

CSS/SVG sederhana lebih disukai.

---

# 13. Applications Page

Halaman utama untuk seluruh application.

## Layout

```text
Applications

[ Search applications... ]

[ All ] [ Job ] [ Internship ]

[ All Status ▼ ] [ Sort ▼ ] [+ Add Application]

------------------------------------------------
Company | Position | Type | Status | Applied
------------------------------------------------
Google  | SWE Intern | Internship | Interview
...
```

---

# 14. Search

Search harus mencari minimal berdasarkan:

* Company
* Position
* Location
* Notes
* Contact Name

Search harus case-insensitive.

Contoh:

```text
search: google
```

akan menemukan:

```text
Google
Google Indonesia
Google Cloud
```

---

# 15. Filters

Filter berdasarkan:

### Type

```text
All
Job
Internship
```

### Status

```text
All
Saved
Applied
Screening
Interview
Offer
Rejected
Withdrawn
```

### Location

Optional.

---

# 16. Sorting

Support:

```text
Newest Applied
Oldest Applied
Recently Updated
Oldest Updated
Company A-Z
Company Z-A
```

Default:

```text
Recently Updated
```

---

# 17. Add Application

User klik:

```text
+ Add Application
```

Munculkan modal/page.

Fields:

```text
Company *
Position *
Type *
Status
Applied Date

Location
Employment Type

Salary Min
Salary Max
Currency

Job URL
Company URL

Contact Name
Contact Email

Notes
```

Required:

```text
Company
Position
Type
```

Status default:

```text
SAVED
```

Jika status langsung dipilih `APPLIED`, `Applied Date` wajib diisi.

---

# 18. Edit Application

Semua field dapat diedit.

Jika status berubah:

1. Update application status.
2. Buat timeline event.
3. Update `updated_at`.

Jangan membuat timeline event jika status tidak berubah.

---

# 19. Application Detail

Layout:

```text
← Back

Google
Software Engineer Intern

[ INTERVIEW ]

Applied Sep 12, 2026

--------------------------------

Application Info

Location
Jakarta

Employment
Internship

Salary
Rp 5M - Rp 7M

Job URL
Open Job Posting

--------------------------------

Timeline

● Interview
  Sep 20, 2026
  Technical interview

● Screening
  Sep 15, 2026

● Applied
  Sep 12, 2026

--------------------------------

Notes

...

[ Edit ] [ Change Status ] [ Delete ]
```

---

# 20. Change Status

Change status menggunakan modal kecil.

```text
Current status:
INTERVIEW

New status:
[ OFFER ▼ ]

Note:
[________________________]

[ Cancel ] [ Update Status ]
```

Jika update berhasil:

```text
Application status updated.
```

Timeline otomatis dibuat.

---

# 21. Delete Application

Delete harus menggunakan confirmation dialog.

```text
Delete application?

This will permanently delete this application
and its timeline history.

[ Cancel ] [ Delete ]
```

Deletion harus menghapus:

```text
application
application_events
```

Gunakan SQLite foreign key cascade.

---

# 22. Empty States

Applications kosong:

```text
No applications yet.

Start tracking your job and internship applications.

[ + Add Application ]
```

Search kosong:

```text
No applications found.

Try changing your search or filters.
```

---

# 23. Settings

Settings sederhana.

## Appearance

```text
Theme

○ System
○ Light
○ Dark
```

## Data

```text
Database Location
[ Open Folder ]

Export Data
Import Data

Backup Database
Restore Database
```

## About

```text
TrackWork
Version x.x.x

Built with Go + Wails
```

---

# 24. Local Database

Database menggunakan SQLite.

Default database location harus mengikuti OS conventions.

Recommended:

### Windows

```text
%LOCALAPPDATA%/TrackWork/trackwork.db
```

### Linux

```text
~/.local/share/trackwork/trackwork.db
```

### macOS

```text
~/Library/Application Support/TrackWork/trackwork.db
```

Jangan hardcode absolute paths.

Gunakan Go OS/environment APIs untuk menentukan application data directory.

---

# 25. Database Schema

## applications

```sql
CREATE TABLE applications (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SAVED',

    applied_date TEXT,

    location TEXT,
    employment_type TEXT,

    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'IDR',

    job_url TEXT,
    company_url TEXT,

    contact_name TEXT,
    contact_email TEXT,

    notes TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## application_events

```sql
CREATE TABLE application_events (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY(application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE
);
```

Indexes:

```sql
CREATE INDEX idx_applications_status
ON applications(status);

CREATE INDEX idx_applications_type
ON applications(type);

CREATE INDEX idx_applications_updated_at
ON applications(updated_at);

CREATE INDEX idx_application_events_application_id
ON application_events(application_id);
```

---

# 26. ID Strategy

Gunakan UUID.

Contoh:

```text
550e8400-e29b-41d4-a716-446655440000
```

Jangan menggunakan auto-increment integer sebagai public entity ID.

---

# 27. Date and Time

Simpan timestamp dalam UTC.

Format:

```text
RFC3339
```

Contoh:

```text
2026-09-29T13:30:00Z
```

Display mengikuti timezone OS/user.

Tanggal application menggunakan local date.

---

# 28. Backend Architecture

Gunakan struktur Go yang sederhana.

Recommended:

```text
backend/
├── app.go
├── models/
│   ├── application.go
│   └── event.go
│
├── repository/
│   ├── application_repository.go
│   └── event_repository.go
│
├── service/
│   └── application_service.go
│
├── database/
│   ├── database.go
│   └── migrations.go
│
└── utils/
```

Jangan membuat architecture terlalu enterprise.

Tidak perlu:

```text
microservices
repository factory
dependency injection framework
CQRS
event sourcing
```

TrackWork adalah local desktop application.

---

# 29. Wails API

Expose typed methods dari Go ke frontend.

Minimal API:

```go
CreateApplication(input CreateApplicationInput)
GetApplications(filter ApplicationFilter)
GetApplication(id string)
UpdateApplication(id string, input UpdateApplicationInput)
DeleteApplication(id string)

ChangeApplicationStatus(
    id string,
    status string,
    note string,
)

GetApplicationTimeline(id string)

GetDashboardStats()

ExportApplications(path string)
ImportApplications(path string)

CreateBackup(path string)
RestoreBackup(path string)
```

Frontend harus tidak mengakses SQLite secara langsung.

Semua database access melalui Go.

---

# 30. Frontend Architecture

Recommended:

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Applications.tsx
│   │   ├── ApplicationDetail.tsx
│   │   └── Settings.tsx
│   │
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── stores/
│   └── App.tsx
```

Gunakan TypeScript strict mode.

Avoid `any`.

---

# 31. UI Design

Design principles:

* Minimal.
* Clean.
* Fast.
* Information-dense.
* Desktop-first.
* Tidak terlihat seperti enterprise software.
* Tidak menggunakan animasi berlebihan.

### Color system

Status colors:

```text
SAVED       neutral
APPLIED     blue
SCREENING   purple
INTERVIEW   orange
OFFER       green
REJECTED    red
WITHDRAWN   gray
```

Warna harus tetap accessible.

---

# 32. Responsive Layout

Desktop-first tetapi tetap responsive.

Minimum target:

```text
1280 × 720
```

Jangan membuat layout rusak pada:

```text
1024 × 768
```

---

# 33. Keyboard Shortcuts

Implementasikan minimal:

```text
Ctrl/Cmd + N
```

New Application

```text
Ctrl/Cmd + K
```

Focus search

```text
Ctrl/Cmd + F
```

Search applications

```text
Esc
```

Close modal

```text
Delete
```

Delete selected application ketika aman dan confirmation tetap muncul.

Shortcut harus menggunakan:

```text
Ctrl
```

di Windows/Linux dan:

```text
Cmd
```

di macOS.

---

# 34. Import / Export

MVP mendukung JSON.

## Export

Example:

```json
{
  "version": 1,
  "exported_at": "2026-09-29T13:00:00Z",
  "applications": [],
  "events": []
}
```

Export harus menyertakan:

* Applications
* Timeline events
* Metadata version

## Import

Import harus:

1. Validate schema.
2. Validate required fields.
3. Validate enum values.
4. Detect duplicate IDs.
5. Show summary.
6. Ask confirmation.
7. Insert data inside SQLite transaction.

Import gagal → rollback seluruh transaction.

---

# 35. Backup

Backup sederhana dilakukan dengan menyalin database SQLite secara aman.

Jangan copy database ketika sedang dalam transaction aktif.

Gunakan SQLite backup mechanism atau safe database backup strategy.

Backup extension:

```text
.trackwork.db
```

atau:

```text
.db
```

---

# 36. Data Safety

Karena aplikasi local-first:

* Jangan mengirim data ke server.
* Jangan mengirim telemetry default.
* Jangan mengirim application information ke analytics service.
* Jangan menyimpan API keys karena MVP tidak membutuhkan API.
* Jangan menggunakan remote database.

Jika analytics ditambahkan di masa depan, harus opt-in.

---

# 37. Performance Requirements

Target:

### Startup

Cold startup:

```text
< 1 second
```

Target, bukan hard guarantee.

### UI interaction

Normal interactions harus terasa instant.

Target:

```text
< 100ms
```

untuk operasi lokal sederhana.

### Database

Aplikasi harus tetap usable dengan:

```text
10,000 applications
```

tanpa pagination server.

Untuk jumlah data normal user, seluruh operasi harus sangat ringan.

---

# 38. Offline Requirement

Seluruh fitur utama harus berjalan tanpa internet:

```text
Dashboard
CRUD
Search
Filter
Sort
Timeline
Import
Export
Backup
Settings
```

Tidak boleh ada dependency terhadap internet untuk startup.

---

# 39. Error Handling

Backend tidak boleh mengirim raw database errors langsung ke UI.

Contoh buruk:

```text
UNIQUE constraint failed: applications.id
```

Gunakan error yang user-friendly:

```text
Unable to import the application data.
The selected file contains duplicate application IDs.
```

Log teknis tetap tersedia untuk debugging.

---

# 40. Logging

Development:

* Structured logging.
* Database errors.
* Unexpected errors.
* Wails lifecycle errors.

Production:

* Jangan log sensitive user data.
* Jangan log notes/application content secara default.

---

# 41. Packaging

Build native binary untuk:

```text
Windows
Linux
macOS
```

Artifacts:

### Windows

```text
TrackWork.exe
```

Optional installer:

```text
TrackWork-Setup.exe
```

### Linux

Support at minimum:

```text
AppImage
```

Optional:

```text
.deb
```

### macOS

```text
TrackWork.app
```

Optional:

```text
.dmg
```

---

# 42. Architecture Requirements

Jangan bergantung pada OS-specific filesystem assumptions.

Gunakan Go:

```go
os.UserConfigDir()
os.UserDataDir()
os.UserCacheDir()
```

sesuai kebutuhan.

Semua path harus dibangun menggunakan:

```go
filepath.Join()
```

Jangan hardcode:

```text
C:\
/home/
/Users/
```

---

# 43. Security

Walaupun local-only:

* Validate semua input.
* Sanitize URL display.
* Jangan execute user-provided URLs.
* Jangan execute shell commands berdasarkan data database.
* Jangan menggunakan `eval`.
* Jangan menggunakan dangerouslySetInnerHTML kecuali benar-benar diperlukan.
* Gunakan parameterized SQL queries.
* Jangan concatenate user input ke SQL.

---

# 44. Testing

## Backend

Test:

```text
Create application
Get application
Update application
Delete application
Change status
Timeline creation
Dashboard stats
Search
Filter
Import
Export
```

## Database

Test:

```text
foreign key cascade
transaction rollback
migration
backup/restore
```

## Frontend

Minimal test:

```text
Application form validation
Status change
Search
Filter
Empty state
Delete confirmation
```

---

# 45. Database Migration

Database harus memiliki migration mechanism.

Initial:

```text
001_initial_schema
```

Future:

```text
002_add_tags
003_add_reminders
```

Application startup:

```text
Open database
↓
Check migration version
↓
Run pending migrations
↓
Start application
```

Migration harus transactional jika memungkinkan.

---

# 46. MVP Definition of Done

TrackWork MVP dianggap selesai ketika:

* [ ] App berjalan di Windows.
* [ ] App berjalan di Linux.
* [ ] App berjalan di macOS.
* [ ] SQLite database dibuat otomatis.
* [ ] User dapat membuat application.
* [ ] User dapat edit application.
* [ ] User dapat delete application.
* [ ] User dapat mengubah status.
* [ ] Status history tersimpan.
* [ ] Dashboard menampilkan statistics.
* [ ] Search bekerja.
* [ ] Filter bekerja.
* [ ] Sorting bekerja.
* [ ] Import JSON bekerja.
* [ ] Export JSON bekerja.
* [ ] Backup bekerja.
* [ ] Restore bekerja.
* [ ] Dark mode bekerja.
* [ ] Light mode bekerja.
* [ ] Keyboard shortcuts bekerja.
* [ ] Tidak membutuhkan internet.
* [ ] Tidak membutuhkan account.
* [ ] Tidak ada remote API dependency.
* [ ] No critical errors.
* [ ] Production build berhasil untuk ketiga platform.

---

# 47. Development Phases

## Phase 1 — Foundation

Implement:

```text
Wails
Go
React
TypeScript
SQLite
Migration
Basic architecture
```

Deliverable:

```text
App opens
Database initializes
```

---

## Phase 2 — Core CRUD

Implement:

```text
Create
Read
Update
Delete
```

Deliverable:

```text
Applications page
Add application
Edit application
Delete application
```

---

## Phase 3 — Status & Timeline

Implement:

```text
Status system
Status change
Timeline
Status badges
```

Deliverable:

```text
Application detail
```

---

## Phase 4 — Dashboard

Implement:

```text
Statistics
Recent applications
Status distribution
```

---

## Phase 5 — Search & Filters

Implement:

```text
Search
Status filter
Type filter
Sorting
```

---

## Phase 6 — Data Management

Implement:

```text
JSON export
JSON import
Backup
Restore
```

---

## Phase 7 — UX Polish

Implement:

```text
Dark mode
Light mode
Empty states
Loading states
Error states
Keyboard shortcuts
Animations
Accessibility
```

---

## Phase 8 — Cross Platform

Build and test:

```text
Windows
Linux
macOS
```

Verify:

```text
database path
file dialogs
external links
keyboard shortcuts
window behavior
```

---

# 48. Future Features

Potential post-MVP features:

### Tags

```text
Remote
FAANG
Startup
Priority
Referral
```

### Reminders

```text
Follow up with recruiter
Interview reminder
Application deadline
```

### Calendar

Integrate with OS calendar.

### Browser extension

Save job posting directly into TrackWork.

### Email integration

Automatically detect application status emails.

### Cloud sync

Optional encrypted sync.

### AI

Optional local/remote AI assistant for:

* Resume matching.
* Job description analysis.
* Cover letter drafting.
* Application insights.

These must not become dependencies of the core application.

---

# 49. Engineering Principles

The project should prioritize:

```text
Simplicity
Performance
Reliability
Local-first
Cross-platform compatibility
Maintainability
```

Avoid premature abstraction.

Prefer straightforward Go code over complicated architecture.

Prefer SQLite queries over in-memory application state for persistent data.

Frontend state should represent UI state, not become a second database.

---

# 50. AI Coding Agent Instructions

When implementing TrackWork:

1. Read the existing project before modifying it.
2. Do not rewrite working code unnecessarily.
3. Keep changes incremental.
4. Run tests after meaningful backend changes.
5. Run TypeScript checks after frontend changes.
6. Build the application periodically.
7. Fix compilation errors immediately.
8. Do not silently change product requirements.
9. Do not introduce external services unless explicitly requested.
10. Do not add unnecessary dependencies.
11. Prefer standard Go libraries when practical.
12. Keep SQLite local.
13. Do not add authentication.
14. Do not add telemetry.
15. Do not add cloud sync.
16. Do not expose SQLite directly to frontend.
17. Use typed Wails bindings.
18. Keep TypeScript strict.
19. Handle errors explicitly.
20. Preserve cross-platform compatibility.

## Dependency rule

Before adding a dependency, ask:

> Is this dependency necessary?

If the feature can reasonably be implemented with the existing stack or standard library, prefer that approach.

---

# 51. Recommended Project Structure

```text
trackwork/
│
├── build/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── database/
│   ├── models/
│   ├── repository/
│   ├── service/
│   └── utils/
│
├── app.go
├── main.go
├── go.mod
├── wails.json
│
├── migrations/
│
├── README.md
└── LICENSE
```

Adjust structure if the chosen Wails project template has a different convention. Do not force this structure if it conflicts with the framework.

---

# 52. Final Product Vision

TrackWork should feel like:

> "A lightweight local job application tracker that opens instantly, stores everything locally, and lets me understand exactly where every application stands."

It should NOT feel like:

> "A complicated enterprise applicant tracking system."

The core loop should take seconds:

```text
Open TrackWork
      ↓
See what's happening
      ↓
Update application
      ↓
Continue working
```

No login.

No loading screen.

No cloud dependency.

No unnecessary configuration.

Just the user's applications and their current status.
