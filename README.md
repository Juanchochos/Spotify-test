# Spotify-test

A full-stack web app for creating music posts backed by Spotify track data. Users register, log in, connect Spotify, search for tracks, and publish posts with up to 5 songs each.

**Stack:** Angular 21 frontend (CSR) · NestJS 10 backend · SQLite via TypeORM

**Live demo:** [https://wishare-kqxq.onrender.com](https://wishare-kqxq.onrender.com)

## Features

- User registration and login (JWT)
- Spotify OAuth via [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- Spotify track search from the browser
- Create posts with an optional description and up to 5 songs
- View and delete your own posts on a profile page

## Project Structure

```
Spotify-test/
├── frontend/   Angular 21 SPA (standalone components)
└── backend/    NestJS app with TypeORM + SQLite
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- A [Spotify Developer](https://developer.spotify.com/dashboard) account and registered app

---

## Setup

Install dependencies for both projects:

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
```

### Configuration

**Backend** — copy [backend/.env.example](backend/.env.example) to `backend/.env` and adjust if needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `HOST` | `127.0.0.1` | Bind address |
| `JWT_SECRET` | (required in prod) | Secret for signing JWTs |
| `DATABASE_PATH` | `db.sqlite` | SQLite file path |

**Frontend** — edit [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts):

| Field | Description |
|-------|-------------|
| `apiBaseUrl` | Backend API root (e.g. `http://127.0.0.1:3000/api`) |
| `spotifyClientId` | Your Spotify app Client ID |
| `spotifyRedirectUri` | Must match a Redirect URI in your Spotify dashboard |

Production builds use [frontend/src/environments/environment.prod.ts](frontend/src/environments/environment.prod.ts) automatically.

---

## Running the Servers

Both servers must run at the same time. Open two terminal windows.

### Terminal 1 — Backend (NestJS)

```bash
cd backend
npm run start:dev
```

The backend runs at **http://127.0.0.1:3000** (or whatever you set in `.env`).

The SQLite database file is created automatically in the `backend/` folder on first run.

### Terminal 2 — Frontend (Angular)

The dev server defaults to **http://127.0.0.1:5173** (matches the Spotify redirect URI).

```bash
cd frontend
npx ng serve
```

Then open **http://127.0.0.1:5173**

> Angular CLI is installed locally in the project. Use `npx ng` rather than a global `ng` command.

---

## Spotify Setup

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add these **Redirect URIs** in your app settings:

   | Environment | Redirect URI |
   |-------------|--------------|
   | Local dev | `http://127.0.0.1:5173/spotify-user` |
   | Production (Render) | `https://wishare-kqxq.onrender.com/spotify-user` |

3. Copy your Client ID into `spotifyClientId` in the environment file for each environment:
   - Dev: [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts)
   - Prod: [frontend/src/environments/environment.prod.ts](frontend/src/environments/environment.prod.ts)

From the dashboard, connect Spotify, then use **Create Post** to search tracks and build a post.

---

## Frontend Routes

| Route | Description | Auth required |
|-------|-------------|---------------|
| `/` | Home | No |
| `/login` | Log in | No |
| `/register` | Create account | No |
| `/dashboard` | Hub — Spotify connect, navigation | Yes |
| `/spotify-user` | Spotify OAuth callback and profile | No |
| `/create-post` | Search Spotify and create a post | Yes |
| `/profile` | View and delete your posts | Yes |

---

## API Endpoints

All backend routes are prefixed with `/api`.

### Health

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/hello` | Health check |

### Auth

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | No | Register (`email`, `username`, `password`) |
| POST | `/api/auth/login` | No | Log in (`email`, `password`) |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/auth/spotify-profile` | JWT | Get stored Spotify profile |
| POST | `/api/auth/spotify-profile` | JWT | Save Spotify profile |
| DELETE | `/api/auth/spotify-profile` | JWT | Clear Spotify profile |

### Posts

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/posts` | JWT | Create a post (up to 5 songs) |
| GET | `/api/posts/mine` | JWT | List your posts |
| DELETE | `/api/posts/:id` | JWT | Delete one of your posts |

---

## Building for Production

```bash
# From repo root (builds both apps + copies frontend into backend)
npm run build
npm run start

# Or individually:
cd backend && npm run build && npm run start:prod
cd frontend && npx ng build
```

---

## Running Tests

```bash
# Backend (Jest)
cd backend
npm test

# Frontend (Vitest via ng test)
cd frontend
npx ng test
```

Both test suites use mocked dependencies — no running servers or database required.

---

## Deployment (Render)

The app is deployed as a single **Render Web Service** — NestJS serves the Angular SPA and the `/api` routes from one URL.

| | |
|---|---|
| **Live app** | [https://wishare-kqxq.onrender.com](https://wishare-kqxq.onrender.com) |
| **Health check** | [https://wishare-kqxq.onrender.com/api/hello](https://wishare-kqxq.onrender.com/api/hello) |
| **Git branch** | `lifepath` |
| **Architecture** | Option A — one service (Nest serves `backend/frontend-dist/` + API) |

### Render dashboard settings

| Field | Value |
|-------|--------|
| **Root Directory** | *(blank — repo root)* |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |

### Environment variables (Render)

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `JWT_SECRET` | Long random secret (required) |
| `DATABASE_PATH` | `./data/db.sqlite` |

Do **not** set `PORT` — Render injects it automatically.

### Production frontend config

Production builds use [frontend/src/environments/environment.prod.ts](frontend/src/environments/environment.prod.ts):

| Field | Production value |
|-------|------------------|
| `apiBaseUrl` | `/api` (same origin as the SPA) |
| `spotifyRedirectUri` | `https://wishare-kqxq.onrender.com/spotify-user` |

After changing prod environment values, push and redeploy so the Angular build picks them up.

### Build and run locally (production mode)

```bash
# From repo root
npm run build   # frontend build → backend/frontend-dist → nest build
npm run start   # node backend/dist/main.js
```

### Known limitation: SQLite on Render

The free tier uses an **ephemeral filesystem** — database data may reset on redeploy or restart. Acceptable for Phase 2; [Phase 3](resources/lifepath.md) moves to Postgres.

