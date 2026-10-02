# ==========================================
# TrackPlan - Multi-Stage Container Setup
# Supports:
# 1. Containerized Linux Desktop builds
# 2. Containerized Frontend & Backend Dev
# ==========================================

# Base build environment with Go, Node.js, and GTK/WebKit toolchain
FROM golang:1.24-bookworm AS base

# Install system dependencies for Wails & WebKit
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    gcc \
    g++ \
    make \
    pkg-config \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Wails v2 CLI
RUN go install github.com/wailsapp/wails/v2/cmd/wails@latest

WORKDIR /app

# ------------------------------------------
# Development Target (Live reload & testing)
# ------------------------------------------
FROM base AS dev

EXPOSE 5173 34115
ENV WAILS_BINDINGS_DEV=true

CMD ["bash"]

# ------------------------------------------
# Production Build Target (Compiles binary)
# ------------------------------------------
FROM base AS builder

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Cache Frontend npm packages
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy full source tree
COPY . .

# Build Linux desktop binary with embedded frontend
RUN wails build -platform linux/amd64 -s -clean

# Output artifact stage
FROM scratch AS artifacts
COPY --from=builder /app/build/bin/trackplan /trackplan-linux-amd64
