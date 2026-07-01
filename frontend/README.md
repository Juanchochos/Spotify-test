# Frontend

Angular 21 standalone SPA with Spotify OAuth (PKCE) integration.

For full setup and run instructions, see the [root README](../README.md).

## Quick Start

```bash
npm install
npx ng serve
```

Dev server runs at **http://127.0.0.1:5173** by default.

## Configuration

Edit [src/environments/environment.ts](src/environments/environment.ts) for local dev:

- `apiBaseUrl` — backend API URL
- `spotifyClientId` — Spotify app Client ID
- `spotifyRedirectUri` — must match your Spotify dashboard Redirect URI

## Scripts

| Command | Description |
|---------|-------------|
| `npx ng serve` | Start dev server on port 5173 |
| `npx ng build` | Production build |
| `npx ng test` | Run unit tests (Vitest) |
