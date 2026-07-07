# Spotify-test Lifepath

A phased roadmap for evolving this project from a local prototype into something realistic, deployable, and enjoyable to build — without rewriting the stack.

**Goals:** Learn production patterns (A), ship a portfolio-worthy app (B), deploy for real users (C). Emphasis on learning and deployment while keeping momentum and fun.

**Stack (keep it):** Angular 21 frontend · NestJS 10 backend · SQLite via TypeORM

A full framework rewrite is not the goal. Each phase teaches one real skill and leaves you with a working app.

---

## Phase 1 — Make Dev Feel Professional

**Estimated effort:** 1–2 sessions

**What you learn:** Configuration management, trimming accidental complexity.

### Tasks

- [x] Move API URL, Spotify client ID, and redirect URI to environment config (no hardcoded `127.0.0.1` in services)
- [x] Drop SSR (or ignore it and build CSR-only) — this app is a logged-in SPA; SSR adds complexity without SEO benefit
- [x] Remove the unused `items` scaffold from backend and README
- [x] Add a `.env.example` documenting required variables
- [x] Update README setup instructions to match the new config flow

### Done when

- Dev setup works with env vars instead of editing source files
- Frontend runs as a straightforward SPA without SSR confusion
- README reflects how a real repo documents configuration

---

## Phase 2 — Deploy Something Real

**Estimated effort:** 1–2 sessions (first deploy always has surprises)

**What you learn:** Build artifacts, env vars in hosting, CORS, OAuth redirect URIs in production.

This is the **C milestone** — a public URL you can share.

### Tasks

- [x] Choose a host with a free tier (Railway, Render, Fly.io, etc.)
- [x] Decide deploy shape:
  - **Option A:** Nest serves the built Angular static files (single service, simpler ops)
  - **Option B:** Two services — static frontend + API (closer to how larger apps split)
- [x] Configure production environment variables on the host
- [x] Fix CORS on the backend for the production frontend origin
- [x] Register production redirect URI in Spotify Developer Dashboard
- [x] Verify end-to-end: register → login → Spotify connect → create post → view profile

### Done when

- App is reachable at a public URL
- Full auth and Spotify flow works in production, not just on localhost
- README includes a "Deployment" section with the live URL

---

## Phase 3 — One Real Backend Upgrade

**Estimated effort:** 2–3 sessions

**What you learn:** Database migrations, server-side OAuth patterns — skills that translate directly to jobs and interviews.

Do this **after** deploy works. Don't block Phase 2 on database perfection.

### Tasks

- [ ] Replace SQLite + `synchronize: true` with Postgres and TypeORM migrations
- [ ] (Optional but valuable) Move Spotify token exchange and search to the Nest backend:
  - Tokens stored server-side, associated with the logged-in user
  - Frontend calls your API instead of Spotify directly
  - Add refresh token handling so users don't reconnect constantly
- [ ] Add basic error handling and logging on critical paths (auth, posts, Spotify)

### Done when

- Schema changes go through migrations, not auto-sync
- Database survives redeploys without data loss
- (If Spotify proxy is done) Tokens are managed server-side and sessions feel stable

---

## Phase 4 — Enjoy the Product

**Estimated effort:** Ongoing — this is the fun part

**What you learn:** Product thinking, shipping value users (and you) actually want.

Infrastructure is in place. Build something that makes *you* want to open the app.

### Ideas (pick what excites you)

- [ ] Public feed — browse other users' music posts
- [ ] Likes or reactions on posts
- [ ] Richer profile page (avatar, bio, post history)
- [ ] Playlist-style posts or themed collections
- [ ] UI polish — typography, layout, motion (use the frontend-design skill)

### Done when

- At least one feature exists that isn't just plumbing
- The app feels like a product, not a tutorial exercise
- You'd be comfortable putting the live URL on a resume or portfolio

---

## Portfolio Notes (Goal B)

These land naturally across the phases — no separate phase needed:

- Live URL in README
- Short "Architecture decisions" section: why Nest, why PKCE, why SQLite → Postgres
- Clean commit history showing phased progress
- Screenshot or GIF of the deployed app

---

## What Not to Do (Yet)

These fight learning, deployment, and enjoyment at this stage:

- Full framework rewrite (Next.js, Remix, etc.)
- Microservices
- Kubernetes or heavy DevOps
- Perfect test coverage before first deploy

Revisit any of these only if a concrete problem forces it — not preemptively.

---

## Phase Order Summary

```
Phase 1  →  Env config, drop SSR noise, clean scaffold
Phase 2  →  Deploy v1 with a public URL
Phase 3  →  Postgres + migrations, optional Spotify backend proxy
Phase 4  →  Fun features + UI polish
```

Each phase is independently valuable. If motivation dips, it's okay to spend extra time in Phase 4 — the earlier phases aren't wasted, they're the foundation.
