# Spotify-test

A full-stack web app for creating music posts backed by Spotify track data. Users register, log in, connect Spotify, search for tracks, and publish posts with up to 5 songs each.

**Stack:** Angular 21 frontend (CSR) · NestJS 10 backend · SQLite via TypeORM

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
2. Add `http://127.0.0.1:5173/spotify-user` as a **Redirect URI** in your app settings.
3. Copy your Client ID into `spotifyClientId` in [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts).

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
# Backend
cd backend
npm run build
# Output: backend/dist/

# Frontend
cd frontend
npx ng build
# Output: frontend/dist/
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
