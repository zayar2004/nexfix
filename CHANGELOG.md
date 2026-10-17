# NEXFIX — CHANGELOG.md
Format: Keep a Changelog.

## [Unreleased]
### Added
- 2026-10-17: Stage 0 complete - 12 planning documents
- 2026-10-17: Provider selection approved (Render + Neon + R2 + UptimeRobot)
- 2026-10-17: Termux Node.js verified (v24.18.0)
### Changed
### Fixed
### Removed
### Security

## Format Rules
- Every entry dated YYYY-MM-DD
- Every entry references a phase
- No fabricated entries
## Phase 1.7 — Prisma blocked on Android (2026-10-17)
- Prisma install fails: libsql does not support Android OS
- Decision: Defer Prisma to Phase 2; use proot Ubuntu or Drizzle alternative
## Phase 1.8 — Deployed to Render (2026-10-17)
- Deploy successful: https://nexfix-s7rm.onrender.com
- Phase 1 (Skeleton) is now COMPLETE.

## [2026-10-17] Phase 0 Update — Hybrid System Requirements
### Added (LOCKED)
- Local-first data access policy (D-11)
- Hybrid online/offline system (D-13)
- Chat system server storage + local cache (D-14)
- Version-based sync with atomic apply
- Tombstone mechanism
- Idempotency for chat messages
### Changed
- Search: Server API → Local Database only
- Chat: Online-only for sending
### Note
- No code changes yet (Stage 0 planning)

## [2026-10-17] Hybrid System Requirements (LOCKED)
- D-11 to D-18 added
- Local-first search, hybrid sync, chat server storage
- No code changes (Stage 0)

## [Stage 2.1] Drizzle ORM Dependencies Added (2026-10-17)
### Added
- `drizzle-orm@^0.45.4` (runtime)
- `postgres@^3.4.9` (runtime, PostgreSQL driver)
- `drizzle-kit@^0.31.11` (dev)
### Verified
- `node -e "require('drizzle-orm/postgres-js')"` → "Drizzle loaded OK"
- `node_modules` contains: drizzle-orm, drizzle-kit, postgres, @drizzle-team
### Termux Notes
- `esbuild` was installed via `pkg install esbuild` (0.28.2) to avoid `ETXTBSY` during `drizzle-kit` postinstall.
- `--fetch-timeout=600000` was used for `npm install` due to intermittent network timeouts.
### Not Yet Verified
- Database connection (no Neon account yet)
- Schema migration (`drizzle-kit push` / `generate`)
- Runtime use inside Next.js app code

## [Stage 2.3] Database Schema Added (2026-10-17)
### Added
- `src/db/schema.ts` (users, sessions tables)
- `drizzle.config.ts` (Drizzle Kit config)
- `dotenv` dependency
### Verified
- `npx drizzle-kit push` -> "[+] Changes applied"
- Neon Dashboard: users, sessions tables exist
### Not Yet Verified
- Auth.js integration
- Register/Login UI
- Runtime queries from Next.js app

## [Phase 1] Documentation Update (2026-10-17)
### Added
- DECISIONS.md: D-51 to D-65 (Phase 1 lock)
- SECURITY_PLAN.md: Role matrix, recovery, presence
- UI_UX_PLAN.md: Design tokens, home, header
- DATABASE_PLAN.md: 14 proposed tables
- ARCHITECTURE.md: Presence, sync, chat, roles, recovery
- MASTER_SPEC.md: Phase 1 summary
- PHASE_PLAN.md: Phase 1 complete, Phase 2 next
- PROJECT_STATE.md: Phase 1 status
- HANDOFF.md: Phase 1 handoff
### Changed
- None (docs only)
### Not Changed
- Application code
- Database schema
- Dependencies
- Deployment

### Verification
- All docs consistent
- No code changes
- No git commit
