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
