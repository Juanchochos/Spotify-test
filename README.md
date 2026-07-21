# Spotify-test

A full-stack web app for creating music posts backed by Spotify track data. Users register, log in, connect Spotify, search for tracks, and publish posts with up to 5 songs each.

**Stack:** Angular 21 frontend (CSR) · NestJS 10 backend · Postgres via TypeORM

**Live demo:** [https://wishare-kqxq.onrender.com](https://wishare-kqxq.onrender.com)

## Features

- User registration and login (JWT)
- Spotify OAuth via [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- Spotify track search via the Nest API (tokens stored server-side)
- Create posts with an optional description and up to 5 songs
- View and delete your own posts on a profile page

## Project Structure

```
Spotify-test/
├── frontend/          Angular 21 SPA (standalone components)
├── backend/           NestJS app with TypeORM + Postgres
└── docker-compose.yml Local Postgres for development
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended for local Postgres) **or** any Postgres 14+ instance
- A [Spotify Developer](https://developer.spotify.com/dashboard) account and registered app

---

## Setup

### 1. Start local Postgres

From the repo root (with Docker Desktop running):

```bash
docker compose up -d
```

This starts Postgres on `127.0.0.1:5432` with database `spotify_test`, user/password `spotify`/`spotify`.

### 2. Install dependencies and configure env

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
| `DATABASE_URL` | (required) | Postgres connection URL |
| `SPOTIFY_CLIENT_ID` | (required) | Same Client ID as the frontend Spotify app |
| `SPOTIFY_REDIRECT_URI` | (required) | Must match frontend redirect (dev: `http://127.0.0.1:5173/spotify-user`) |

Example local URL (matches `docker-compose.yml`):

```
DATABASE_URL=postgresql://spotify:spotify@127.0.0.1:5432/spotify_test
```

**Frontend** — edit [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts):

| Field | Description |
|-------|-------------|
| `apiBaseUrl` | Backend API root (e.g. `http://127.0.0.1:3000/api`) |
| `spotifyClientId` | Your Spotify app Client ID |
| `spotifyRedirectUri` | Must match a Redirect URI in your Spotify dashboard |

Production builds use [frontend/src/environments/environment.prod.ts](frontend/src/environments/environment.prod.ts) automatically.

### Database migrations

Schema is managed with TypeORM migrations (`synchronize` is off). Pending migrations run automatically when the Nest app starts (`migrationsRun: true`).

You can also run them manually from `backend/`:

```bash
npm run migration:run    # apply pending migrations
npm run migration:show   # list migration status
npm run migration:revert # roll back the last migration
```

---

## Running the Servers

Both servers must run at the same time. Open two terminal windows. Postgres must be running first.

### Terminal 1 — Backend (NestJS)

```bash
cd backend
npm run start:dev
```

The backend runs at **http://127.0.0.1:3000** (or whatever you set in `.env`).

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

### Spotify (JWT required)

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/spotify/callback` | Exchange OAuth code + PKCE verifier; store tokens and profile |
| GET | `/api/spotify/status` | `{ connected, profile }` |
| GET | `/api/spotify/search?q=` | Search tracks (Nest refreshes tokens when needed) |
| DELETE | `/api/spotify/disconnect` | Clear Spotify tokens and profile |

Legacy `/api/auth/spotify-profile` routes remain for backward compatibility but the UI uses `/api/spotify/*`.

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
| `DATABASE_URL` | From your Render Postgres instance (see below) |
| `SPOTIFY_CLIENT_ID` | Same Client ID as frontend |
| `SPOTIFY_REDIRECT_URI` | `https://wishare-kqxq.onrender.com/spotify-user` |

Do **not** set `PORT` — Render injects it automatically. Remove any old `DATABASE_PATH` variable.

### Postgres on Render

1. In the Render dashboard, create a **PostgreSQL** database (free tier is fine for learning).
2. Open the database → **Connections** → copy the **Internal Database URL** (preferred when the web service is on Render) or the **External Database URL**.
3. On your **Web Service** → Environment, set `DATABASE_URL` to that URL (or use Render’s “Link database” so it injects `DATABASE_URL` for you).
4. Redeploy the web service. On startup, Nest runs pending TypeORM migrations automatically.

Existing SQLite data is **not** migrated automatically — treat this as a fresh production database (re-register users after cutover).

After deploying the Spotify-on-Nest update, users must **reconnect Spotify** once (old browser-stored tokens are no longer used).

### Production frontend config

Production builds use [frontend/src/environments/environment.prod.ts](frontend/src/environments/environment.prod.ts):

| Field | Production value |
|-------|------------------|
| `apiBaseUrl` | `/api` (same origin as the SPA) |
| `spotifyRedirectUri` | `https://wishare-kqxq.onrender.com/spotify-user` |

After changing prod environment values, push and redeploy so the Angular build picks them up.

### Build and run locally (production mode)

```bash
# From repo root (Postgres must be running and DATABASE_URL set in backend/.env)
npm run build   # frontend build → backend/frontend-dist → nest build
npm run start   # node backend/dist/main.js
```

