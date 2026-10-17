# NEXFIX — DECISIONS.md
Format: [ID] [Date] [Decision] [Status] [Reason]

## Confirmed Decisions
| ID | Date | Decision | Status |
|---|---|---|---|
| D-01 | 2026-10-17 | Stack: Next.js + TypeScript + PostgreSQL + Prisma + Auth.js | CONFIRMED |
| D-02 | 2026-10-17 | Real-time: Self-hosted Socket.IO | CONFIRMED |
| D-03 | 2026-10-17 | Private Excel: Local-only (IndexedDB) | CONFIRMED |
| D-04 | 2026-10-17 | Admin at /admin with RBAC + Rate Limit + Audit | CONFIRMED |
| D-05 | 2026-10-17 | Moderator: Hide/Mute/Timeout only; Ban = Admin+ | CONFIRMED |
| D-06 | 2026-10-17 | Retention: Search 90d / Activity 180d | CONFIRMED |
| D-07 | 2026-10-17 | Backup: Daily + Restore test quarterly | CONFIRMED |
| D-08 | 2026-10-17 | Budget: USD 0 initially | CONFIRMED |
| D-09 | 2026-10-17 | Provider: verify before selecting | CONFIRMED |
| D-10 | 2026-10-17 | APK: defer to Phase 11 | CONFIRMED |

## Provider Decisions (APPROVED)
| ID | Decision | Status |
|---|---|---|
| P-01 | Render Free Web Service (Next.js + Socket.IO) | APPROVED |
| P-02 | Neon Free Plan (PostgreSQL) | APPROVED |
| P-03 | Cloudflare R2 Free (media) | APPROVED |
| P-04 | UptimeRobot Free (anti-sleep ping) | APPROVED |

## Rejected
| ID | Proposal | Reason |
|---|---|---|
| X-01 | Render Free PostgreSQL | 30-day expiry |
| X-02 | Vercel for WebSocket | Not supported |
| X-03 | Fly.io | Requires credit card; free trial limited |

## NEW LOCKED DECISIONS (2026-10-17)
| ID | Decision | Status |
|---|---|---|
| D-11 | Local-first data access (Search + Knowledge) | LOCKED |
| D-12 | Server ONLY for Sync, Auth, Chat, Admin | LOCKED |
| D-13 | Hybrid Online/Offline system | LOCKED |
| D-14 | Chat = Server PostgreSQL + Local cache (offline read) | LOCKED |
| D-15 | Chat send = Online only, "Sent" after server confirm | LOCKED |
| D-16 | Idempotency key for chat retries | LOCKED |
| D-17 | Tombstone mechanism for deleted data | LOCKED |
| D-18 | Background sync NOT guaranteed (browser limits) | LOCKED |

## NEW LOCKED DECISIONS (2026-10-17)
| ID | Decision |
|---|---|
| D-11 | Local-first data access |
| D-12 | Server ONLY for Sync, Auth, Chat, Admin |
| D-13 | Hybrid Online/Offline |
| D-14 | Chat Server PG + Local cache |
| D-15 | Chat send online only |
| D-16 | Idempotency for chat |
| D-17 | Tombstone mechanism |
| D-18 | Background sync not guaranteed |

## PHASE 1 LOCKED DECISIONS (2026-10-17)

| ID | Decision | Status | Reason |
|---|---|---|---|
| D-51 | Roles: User, Staff, Senior Admin, Super Admin | LOCKED | Owner-approved |
| D-52 | Forgot Password: Admin-assisted reset | LOCKED | Owner-approved, no paid services |
| D-53 | Home Search Sections A + B (separate) | LOCKED | Owner-approved |
| D-54 | No separate primary /search route | LOCKED | Search lives on Home |
| D-55 | Online indicator: green dot + count, no text label | LOCKED | Owner-approved |
| D-56 | Presence: 30s heartbeat, 90s expiry, dedup by userId/sessionId | LOCKED | Reasonable default |
| D-57 | Roles replaced: moderator/admin -> Staff/Senior Admin | LOCKED | Owner-approved |
| D-58 | Admin reset must audit action, never reveal password | LOCKED | Security |
| D-59 | Recovery mechanism documented before implementation | LOCKED | Owner-approved |
| D-60 | All server-side authorization for privileged ops | LOCKED | Existing D-47 |
| D-61 | No auto-grant of elevated roles | LOCKED | Owner-approved |
| D-62 | Sync uses real last-sync, no fake percentages | LOCKED | Existing D-43 |
| D-63 | Recent Diagnostics: compact list, max 5 | LOCKED | Owner-approved |
| D-64 | Home header: brand + local time + refresh + notif + online count | LOCKED | Owner-approved |
| D-65 | Documentation updated for Phase 1 | LOCKED | This step |

## SUPERSEDED DECISIONS
- D-05 (Moderator role) - SUPERSEDED by D-51
- D-38 (previous roles) - SUPERSEDED by D-51

| D-66 | Admin reset = Option D (one-time token, 15-min, hashed). Secure delivery channel = TBD; feature PENDING until approved | NEEDS APPROVAL (feature pending) | Owner-selected D |
| D-67 | Reset token NEVER stored plaintext; NEVER expose existing password; NO SMS/Email provider | LOCKED | Owner-confirmed |
