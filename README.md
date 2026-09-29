<div align="center">

# 🎯 TrackPlan

**A fast, private, and local-first desktop application to organize, track, and manage your job and internship applications.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.25+-000000.svg?style=for-the-badge&logo=go&logoColor=white)](https://golang.org)
[![React](https://img.shields.io/badge/React-19-000000.svg?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Wails](https://img.shields.io/badge/Wails-v2-000000.svg?style=for-the-badge&logo=wails&logoColor=white)](https://wails.io)
[![HeroUI](https://img.shields.io/badge/HeroUI-v3-000000.svg?style=for-the-badge)](https://heroui.com)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-000000.svg?style=for-the-badge)](#)

[Features](#-key-features) • [Installation](#-installation--getting-started) • [Shortcuts](#-keyboard-shortcuts) • [Architecture](#-architecture) • [Sponsor](#-support--sponsor)

</div>

---

## ⚡ Overview

**TrackPlan** is engineered with a strict **local-first** ethos. There are no mandatory sign-ups, no external analytics servers, and no cloud synchronization lock-ins. All your application data, compensation notes, interview timelines, and recruiter contacts stay 100% private on your own machine.

Built with **Go**, **SQLite**, and **React 19** powered by **HeroUI** and styled in an ultra-clean **Monochrome Dark Mode**.

---

## ✨ Key Features

- **🔒 100% Offline & Local-First**: Zero tracking, zero cloud dependencies. Your entire pipeline resides in a single, portable local SQLite database.
- **📊 Real-time Dashboard**:
  - Instant KPI cards: *Total Applications*, *Active Pipeline*, *Interviews*, *Offers*, and *Rejected*.
  - Minimalist status distribution breakdown.
  - Recent applications table with quick inspection.
- **📅 Interactive Schedule & Calendar (Google Calendar Style)**:
  - Monthly calendar grid with custom month and year pickers.
  - View scheduled interview times, application dates, and timeline logs.
  - Day agenda panel with instant "+ Schedule Interview" action.
  - Upcoming interviews countdown list.
- **📁 Comprehensive Pipeline Organization**:
  - Dual viewing modes: **Table View** and **Kanban Board** with quick-advance controls.
  - Real-time case-insensitive search across company, position, location, contact, and notes.
  - Filters by application type (*Job*, *Internship*) and status (*Saved*, *Applied*, *Screening*, *Interview*, *Offer*, *Rejected*, *Withdrawn*).
  - Sorting by update date, submission date, or company name.
- **⏱️ Detailed Application Timeline**:
  - Chronological activity log tracking every status transition.
  - Add custom notes directly to your application timeline.
- **💾 Backup & Portability**:
  - One-click native database backup (`.db`) and restore.
  - Export data to **CSV** (for Excel/Google Sheets) or raw **JSON**.
  - Import external records from JSON.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + N` / `Cmd + N` | **New Application** | Opens the application creation modal from anywhere |
| `/` | **Focus Search** | Instantly jumps focus to the global search input |
| `Esc` | **Close Dialog** | Closes any open modal, drawer, or confirmation box |
| `Ctrl + Enter` | **Save Form** | Quickly submits and saves application forms |

---

## 🚀 Download & Installation

### 📦 Pre-built Binaries (Ready to Use)

Kamu bisa langsung mendownload file executable resmi TrackPlan dari [GitHub Releases v1.0.0](https://github.com/XenchinRyu7/TrackPlan/releases/tag/v1.0.0):

| Platform | Download Link | Notes |
| :--- | :--- | :--- |
| **Windows (.exe)** | [**📥 Download trackplan-windows-amd64.exe**](https://github.com/XenchinRyu7/TrackPlan/releases/download/v1.0.0/trackplan-windows-amd64.exe) | Langsung double-click tanpa install |
| **Windows (.zip)** | [**📦 Download trackplan-v1.0.0-windows-amd64.zip**](https://github.com/XenchinRyu7/TrackPlan/releases/download/v1.0.0/trackplan-v1.0.0-windows-amd64.zip) | Arsip zip binary Windows |
| **macOS** | [**🍏 Download trackplan-v1.0.0-macos-universal.zip**](https://github.com/XenchinRyu7/TrackPlan/releases/download/v1.0.0/trackplan-v1.0.0-macos-universal.zip) | Apple Silicon (M1/M2/M3) & Intel |
| **Linux** | [**🐧 Download trackplan-v1.0.0-linux-amd64.tar.gz**](https://github.com/XenchinRyu7/TrackPlan/releases/download/v1.0.0/trackplan-v1.0.0-linux-amd64.tar.gz) | Ubuntu, Debian, Arch, Fedora |

---

### Prerequisites (For Developers)

Ensure you have the following installed:
- [Go 1.22+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Wails CLI v2](https://wails.io/docs/gettingstarted/installation):
  ```bash
  go install github.com/wailsapp/wails/v2/cmd/wails@latest
  ```

### Live Development (Hot Reload)

```bash
# Clone the repository
git clone https://github.com/XenchinRyu7/TrackPlan.git
cd trackplan

# Start live development
wails dev
```

### Production Build

```bash
# Build standalone desktop executable
wails build
```

The output executable will be generated at `build/bin/trackplan.exe`.

### Running Tests

```bash
go test -v ./backend
```

---

## 🏗️ Architecture

```text
TrackPlan
├── backend/                  # Go core & SQLite manager
│   ├── database.go           # SQLite connection, migrations & queries
│   ├── database_test.go      # Integration and unit tests
│   └── models.go             # Data structures and schemas
├── frontend/                 # React 19 + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── applications/ # Table, board, and filter components
│   │   │   ├── calendar/     # Google Calendar-style schedule view
│   │   │   ├── dashboard/    # KPI metrics and status distribution
│   │   │   ├── layout/       # Sidebar and Navbar
│   │   │   ├── modals/       # Form, detail timeline, and delete modals
│   │   │   └── settings/     # Backup, restore, and export/import
│   │   ├── constants/        # Status and employment configurations
│   │   └── style.css         # HeroUI v3 & Tailwind CSS v4 styling
│   └── wailsjs/              # Auto-generated Go-to-TypeScript bindings
├── app.go                    # Wails application backend bindings
├── main.go                   # Desktop runtime entry point
└── wails.json                # Project configuration
```

---

## 💖 Support & Sponsor

If **TrackPlan** helps you land your next dream job or internship, consider supporting its open-source development:

- ⭐ **Star this repository** on GitHub
- ☕ **Buy Me a Coffee**: [buymeacoffee.com/trackplan](https://www.buymeacoffee.com/trackplan)
- 💖 **GitHub Sponsors**: [github.com/sponsors/XenchinRyu7](https://github.com/sponsors/XenchinRyu7)
- 🇮🇩 **Saweria**: [saweria.co/trackplan](https://saweria.co/trackplan)

---

## 🤝 Contributing

Contributions of all kinds are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and review our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
