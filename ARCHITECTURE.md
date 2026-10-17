# NEXFIX — ARCHITECTURE.md
Version: 1.0

## 1. High-Level Diagram
[Browser: User / Admin]
       |
       v HTTPS
[Render Web Service: Next.js + Socket.IO]
       |                    |
       v                    v
[Neon PostgreSQL]    [Cloudflare R2]
       |
       v
[Prisma ORM]

## 2. Components
### 2.1 Web App (Next.js)
- App Router, SSR + API routes
- User routes: /, /search, /errors/[id], /library, /chat, /notes, /settings, /profile
- Admin routes: /admin/*
- API: /api/* (REST)

### 2.2 Real-time (Socket.IO)
- Node process embedded in Next.js custom server
- Channels: chat, presence, notifications
- Hosting: Render (WebSocket supported)

### 2.3 Database (Neon PostgreSQL)
- Managed serverless Postgres
- Prisma migrations
- Connection pooling via Neon built-in pooler

### 2.4 Object Storage (Cloudflare R2)
- S3-compatible API
- Signed URLs for upload/download
- Server-side MIME validation

### 2.5 Offline Layer
- Service Worker + IndexedDB
- DB nexfix-shared: errors, articles, machines
- DB nexfix-private-<userId>: Excel dataset, notes cache
- Separate databases = hard privacy boundary

## 3. Data Flow
### Search
Client -> GET /api/search -> Postgres -> ranking (exact code first) -> JSON -> cache in IndexedDB

### Private Excel
Client -> POST /api/private-excel/validate -> server validates structure -> preview -> user confirms -> local-only: store in IndexedDB (no server upload)

### Chat
Client -> WS send (idempotency_key) -> Postgres -> WS broadcast -> all clients

### Presence
Client heartbeat (30s) -> WS -> server last_seen -> broadcast -> UI "Online" / "Last seen X"

## 4. Deployment Topology
- Production Web: Render Free Web Service
- Production DB: Neon Free Plan
- Production Storage: Cloudflare R2 Free Tier
- Dev: Termux localhost
- Domain: TBD
- HTTPS: Render-managed TLS

## 5. Non-Functional Targets
- Mobile-first 360px
- WS reconnect: exponential backoff (1s->2s->4s->max 30s)
- API response: { ok, data|error }
- No PII in logs

## 6. LOCAL-FIRST ARCHITECTURE (LOCKED 2026-10-17)
- Client is PRIMARY for Search/Knowledge.
- Server is SOURCE for Sync.
- Flow:
  User opens app → Check version (online) → Sync if needed → Search reads from Local DB
  Offline → Search reads from Local DB (no server call)
- Data layers:
  - nexfix-shared (IndexedDB): machines, errors, articles
  - nexfix-private-<userId> (IndexedDB): Excel dataset, notes cache
  - nexfix-chat-cache (IndexedDB): recent chat messages

## 7. SYNC ARCHITECTURE
- Versioned: Every published data has revision number.
- Full Sync (first time) → Incremental Sync (after).
- Atomic transaction on local DB.
- Failure → Keep previous data.
- Tombstone: Deleted items marked, not immediately removed.

## 8. CHAT ARCHITECTURE
- Server = Source of Truth (PostgreSQL).
- Client = Cache (IndexedDB, read-only offline).
- Real-time: Socket.IO → new message → update cache.
- Send: Idempotency key → server → persist → broadcast.
- Media: R2 (S3-compatible) + DB reference.

## 6. LOCAL-FIRST ARCHITECTURE (LOCKED 2026-10-17)
- Client is PRIMARY for Search/Knowledge.
- Server is SOURCE for Sync.
- Flow: App opens → version check → sync → search reads Local DB. Offline → search reads Local DB.
- Data layers: nexfix-shared, nexfix-private-<userId>, nexfix-chat-cache

## 7. SYNC ARCHITECTURE
- Versioned, Full + Incremental, Atomic, Tombstone.

## 8. CHAT ARCHITECTURE
- Server = Source of Truth, Client = Cache. Idempotency, Socket.IO, R2 media.
