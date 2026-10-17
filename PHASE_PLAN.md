# NEXFIX — PHASE_PLAN.md
Version: 1.0

## Phase 0: Planning (COMPLETE)
- Deliverables: 12 documents
- Exit: Owner approved D-01..D-10

## Phase 1: Repo + Dev Env + Skeleton
- Goal: GitHub repo, Next.js skeleton, Prisma init, CI lint
- Deliverables: .gitignore, package.json, next.config, tsconfig, prisma/schema.prisma (empty), .env.example
- Acceptance: dev server runs in Termux, Git push works, CI green
- Depends: Phase 0
- No features, no DB tables

## Phase 2: Auth + Roles + Profile
- Goal: Register, Login, Logout, User ID, RBAC, Profile
- Acceptance: 403 for non-admin on /admin; session persists; logout revokes
- Depends: Phase 1

## Phase 3: Shared Search + Detail
- Goal: /search live filter, /errors/[id], i18n, all states
- Acceptance: exact code ranks first; all states demonstrated
- Depends: Phase 2

## Phase 4: Knowledge Library
- Goal: Articles list/detail, offline cache, version sync, stale badge
- Depends: Phase 3

## Phase 5: Private Excel
- Goal: Import/Validate/Commit/Replace/Delete/Export, local-only
- Acceptance: failed replace preserves previous; admin API zero private rows; privacy test passes
- Depends: Phase 3

## Phase 6: Notes & Reminders + Notification Bell
- Goal: Notes CRUD, recurrence, mark done, snooze, notification bell
- Acceptance: recurrence math correct for Asia/Yangon; no self-notify
- Depends: Phase 2

## Phase 7: Public Chat
- Goal: Read (guest), post (auth), text/emoji/media, reports, moderation, audit, presence
- Acceptance: duplicate prevented via idempotency; ban admin-only; presence honesty
- Depends: Phase 2

## Phase 8: Admin Web (Content)
- Goal: Machines/Errors/Knowledge/Media CRUD + workflows
- Depends: Phase 3, 4

## Phase 9: Admin Web (Users/Ops)
- Goal: Users/Roles, Presence, Sessions, Activity, Search History, Audit, Backup/Restore
- Depends: Phase 8

## Phase 10: Security Hardening + Performance
- Goal: Threat-model checklist, CSP, rate limits, accessibility audit
- Depends: Phase 9

## Phase 11: APK Strategy (planning only)
- Depends: Phase 10

## Dependencies
P1 -> P2 -> P3 -> {P4, P5}
P2 -> P6, P7
{P3, P4} -> P8 -> P9 -> P10 -> P11

## Phase 1.9: Local-First Refactor (NEW — after Phase 1)
- Goal: Implement IndexedDB schema, Sync Service skeleton
- Depends: Phase 1
- Acceptance: Local DB initializes, version check endpoint, manual sync button

## Phase 2: Auth (unchanged)
## Phase 3: Shared Search (REFACTORED — Local-first)
- Search reads ONLY from IndexedDB
- Acceptance: Server Search API never called on search
## Phase 4: Knowledge (REFACTORED — Local-first)
## Phase 5: Private Excel (UNCHANGED — Local-only)
## Phase 6: Notes (Local + optional sync later)
## Phase 7: Public Chat (REFACTORED — Server + Local cache)
- Chat send: Online only
- Chat read: Local cache offline
## Phase 8-11: Admin / Ops / APK (unchanged)

## Phase 1.9: Local-First Refactor (NEW)
- IndexedDB schema, Sync Service skeleton
## Phase 3: Search (REFACTORED — Local-first)
## Phase 4: Knowledge (REFACTORED — Local-first)
## Phase 7: Chat (REFACTORED — Server + Local cache)
