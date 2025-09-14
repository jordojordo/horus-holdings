# Horus Holdings

[![CI & Build checks](https://github.com/jordojordo/horus-holdings/actions/workflows/tests.yaml/badge.svg)](https://github.com/jordojordo/horus-holdings/actions/workflows/tests.yaml)
[![Publish to GHCR](https://github.com/jordojordo/horus-holdings/actions/workflows/release-container.yaml/badge.svg)](https://github.com/jordojordo/horus-holdings/actions/workflows/release-container.yaml)

Cash‑flow management for tracking incomes, expenses, and trends—built as a UI + API pair with secure auth.

> Demo: https://horus.yokanga.xyz

---

## What’s in this repo

- **UI** – SPA served by a container built from `Dockerfile.ui`.
- **Server** – Node/Express + MySQL + Redis, built from `Dockerfile.server`.
- **Dev Compose** – `compose.dev.yaml` runs MySQL + Redis locally for development.
- **Prod Compose** – `compose.prod.yaml` runs UI, Server, MySQL, and Redis together.
- **CI/CD** – PR CI builds both Dockerfiles; `master`/tags publish to GHCR.

---

## Quick start (development)

1) Bring up infra (MySQL + Redis) via Docker:

```bash
docker compose -f compose.dev.yaml up -d
```

2) Install deps and start the app (local Node + Vite):

```bash
pnpm install
pnpm dev
```

---

## Environment configuration

Create a `.env` file for the **server** (these can be supplied via Compose as well):

```env
# Server
NODE_ENV=development
NODE_PORT=5000
CORS_ORIGIN=http://localhost:5173

# Auth/crypto
SESSION_SECRET=change-me
JWT_SECRET=change-me
ENCRYPTION_KEY=change-me

# Database
DATABASE_NAME=horusdevdb
DATABASE_USER=root
DATABASE_PASSWORD=admin
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_LOGGING=false

# UI → API / WebSocket hints used by the client
CLIENT_API_SCHEME=http
CLIENT_PROXY_SCHEME=ws
CLIENT_PROXY_HOST=localhost
CLIENT_PROXY_PORT=5000
CLIENT_PROXY_PATH=/ws
```

---

## Containers

### Build locally

```bash
# Frontend
docker build -f Dockerfile.ui -t horus-ui:local .

# Backend
docker build -f Dockerfile.server -t horus-server:local .
```

### Images published to GHCR

CI publishes two images:

- `ghcr.io/jordojordo/horus-ui:<tag>`
- `ghcr.io/jordojordo/horus-server:<tag>`

Tags include `master`, semver (`1.4.0`, `1.4`), and the commit SHA.

---

## Run with Docker Compose

### Development services only (DB/Cache)

```bash
docker compose -f compose.dev.yaml up -d
```

### Production stack (UI + Server + DB + Redis)

```bash
# Pull the exact versions you want to deploy
docker compose -f compose.prod.yaml pull

# Launch everything
docker compose -f compose.prod.yaml up -d
```
