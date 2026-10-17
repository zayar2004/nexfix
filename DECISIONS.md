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
