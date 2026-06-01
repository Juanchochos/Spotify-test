# Test App

A full-stack web application with an Angular frontend and a NestJS backend backed by SQLite via TypeORM. Includes Spotify OAuth (PKCE flow) for user authentication.

## Project Structure

```
Test App/
├── frontend/   Angular 21 app (SSR-enabled)
└── backend/    NestJS app with TypeORM + SQLite
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Setup

Install dependencies for both projects before running anything.

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

Both servers must be running at the same time. Open two terminal windows.

### Terminal 1 — Backend (NestJS)

```bash
cd backend
npm run start:dev
```

The backend runs at **http://127.0.0.1:3000**

Available endpoints:
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/hello | Health check |
| GET | /api/items | List all items |
| GET | /api/items/:id | Get one item |
| POST | /api/items | Create an item |
| PUT | /api/items/:id | Update an item |
| DELETE | /api/items/:id | Delete an item |

The SQLite database file (`db.sqlite`) is created automatically in the `backend/` folder on first run.

### Terminal 2 — Frontend (Angular)

> **Important:** The Spotify redirect URI is hardcoded to `http://127.0.0.1:5173`. You must serve the frontend on that exact host and port.

```bash
cd frontend
ng serve --host 127.0.0.1 --port 5173
```

Then open your browser and navigate to **http://127.0.0.1:5173**

---

## Spotify Authentication

The app uses the [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow) flow.

Requirements:
1. You must have a Spotify Developer account and a registered app at [developer.spotify.com](https://developer.spotify.com/dashboard).
2. In your Spotify app settings, add `http://127.0.0.1:5173/spotify-user` as a **Redirect URI**.
3. The Client ID is already set in [frontend/src/app/spotify-auth.service.ts](frontend/src/app/spotify-auth.service.ts). Replace it with your own if needed.

---

## Building for Production

```bash
# Backend
cd backend
npm run build
# Output: backend/dist/

# Frontend
cd frontend
ng build
# Output: frontend/dist/
```

---

## Running Tests

```bash
# Frontend unit tests (Vitest)
cd frontend
ng test
```
