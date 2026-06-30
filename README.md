# Spotify-test

A full-stack web app for creating music posts backed by Spotify track data. Users register, log in, connect Spotify, search for tracks, and publish posts with up to 5 songs each.

**Stack:** Angular 21 frontend · NestJS 10 backend · SQLite via TypeORM

## Features

- User registration and login (JWT)
- Spotify OAuth via [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- Spotify track search from the browser
- Create posts with an optional description and up to 5 songs
- View and delete your own posts on a profile page

## Project Structure

```
Spotify-test/
├── frontend/   Angular 21 app (SSR-enabled, standalone components)
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

# Frontend
cd ../frontend
npm install
```

---

## Running the Servers

Both servers must run at the same time. Open two terminal windows.

### Terminal 1 — Backend (NestJS)

```bash
cd backend
npm run start:dev
```

The backend runs at **http://127.0.0.1:3000**

The SQLite database file (`db.sqlite`) is created automatically in the `backend/` folder on first run.

### Terminal 2 — Frontend (Angular)

> **Important:** The Spotify redirect URI is hardcoded to `http://127.0.0.1:5173`. You must serve the frontend on that exact host and port.

```bash
cd frontend
npx ng serve --host 127.0.0.1 --port 5173
```

Then open **http://127.0.0.1:5173**

> Angular CLI is installed locally in the project. Use `npx ng` rather than a global `ng` command.

---

## Spotify Setup

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add `http://127.0.0.1:5173/spotify-user` as a **Redirect URI** in your app settings.
3. Copy your Client ID into [frontend/src/app/spotify-auth.service.ts](frontend/src/app/spotify-auth.service.ts) (a placeholder is already set).

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

### Items (scaffold)

Generic CRUD endpoints left over from the project template. Not used by the frontend UI.

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get one item |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

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
cd frontend
npx ng test
```

Frontend unit tests use Vitest.
