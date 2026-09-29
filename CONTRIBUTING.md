# Contributing to TrackPlan

Thank you for your interest in contributing to **TrackPlan**! TrackPlan is built with a local-first philosophy to provide a fast, private, and offline job/internship application tracker.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Convention](#commit-message-convention)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When filing a bug:
- Use a clear and descriptive title.
- Describe the exact steps which reproduce the problem.
- Provide information about your operating system and environment.
- Attach screenshots or error logs if applicable.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues:
- Explain why this enhancement would be useful to most TrackPlan users.
- Keep in mind TrackPlan's core principle: **local-first, lightweight, offline, no mandatory external accounts**.

### Submitting a Pull Request

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Test your changes locally:
   ```bash
   go test -v ./backend
   cd frontend && npm run build
   ```
3. Commit your changes following conventional commits.
4. Push to your fork and submit a Pull Request to `main`.

---

## 🛠️ Development Setup

### Prerequisites

- **Go**: 1.22+ installed
- **Node.js**: 20+ installed
- **Wails CLI**:
  ```bash
  go install github.com/wailsapp/wails/v2/cmd/wails@latest
  ```

### Running Locally (Live Dev)

```bash
# Clone the repository
git clone https://github.com/yourusername/trackplan.git
cd trackplan

# Start live hot-reloading development server
wails dev
```

### Running Tests

```bash
go test -v ./backend
```

### Production Build

```bash
wails build
```

The compiled binary will be placed inside `build/bin/`.

---

## 📐 Coding Guidelines

- **Go Backend**: Follow standard Go formatting (`gofmt`), handle errors gracefully, and maintain pure-Go compatibility without requiring external C compiler runtimes where possible.
- **Frontend**: Keep the monochromatic dark aesthetic clean and unified. Use HeroUI components and avoid unnecessary heavy chart or animation libraries.

---

## 💬 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
