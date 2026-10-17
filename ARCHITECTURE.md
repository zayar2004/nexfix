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

## 9. PRESENCE ARCHITECTURE (LOCKED 2026-10-17)
- Client heartbeat: every 30s (fetch POST /api/presence/heartbeat)
- Server stores: {userId or sessionId, lastHeartbeat}
- Expiry: 90s since last heartbeat
- Dedup: by userId (logged-in) or sessionId (guest)
- Online count: SELECT COUNT(DISTINCT userId) WHERE lastHeartbeat > NOW() - 90s
- Stale cleanup: cron every 60s
- API: GET /api/presence/count (public, count only)
- Privacy: no user details exposed

## 10. SYNC ARCHITECTURE (LOCKED)
- Local DB: IndexedDB (nexfix-shared, nexfix-private-<userId>, nexfix-chat-cache)
- Sync triggers: app open, reconnect, manual, admin push
- Version check: GET /api/sync/version -> compare local
- If newer: GET /api/sync/changes -> validate -> atomic apply
- Failure: preserve previous data
- Last-sync: stored in IndexedDB, displayed in UI
- No fake percentages (D-43)
- Background sync: NOT guaranteed (browser limits)

## 11. CHAT ARCHITECTURE (LOCKED)
- Server: PostgreSQL (source of truth)
- Client: IndexedDB cache (offline read only)
- Send: POST /api/chat/messages (idempotency key)
- "Sent" state: ONLY after server DB insert confirms (D-41)
- Offline: send disabled, no auto-queue (D-42)
- Real-time: Socket.IO broadcast
- Media: R2 (S3-compatible) + DB reference

## 12. ROLES ARCHITECTURE (LOCKED)
- Enum: 'user' | 'staff' | 'senior_admin' | 'super_admin'
- Middleware: /api/admin/* requires role in (staff, senior_admin, super_admin)
- Ban permission: senior_admin, super_admin only
- Role assignment: super_admin only (audited)
- Self-promotion: blocked
- Client checks: UX only

## 13. AUTH RECOVERY ARCHITECTURE (LOCKED)
- Admin-assisted only (D-52)
- No email/SMS provider
- Workflow: out-of-band verification -> admin triggers token -> user sets password
- Token: one-time, expires in 15 minutes, stored hashed
- Audit: every reset action logged
- If secure reset not feasible with current JWT: document + request approval

## 14. PASSWORD RESET (PENDING 2026-10-17)
- Mechanism: Option D (admin-assisted, one-time token)
- Token: 15-min expiry, hashed
- Delivery: NOT DECIDED -> feature PENDING
- Implementation: Phase 2+ (after channel approved)
- Fallback: "Contact admin for recovery"
