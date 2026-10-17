# NEXFIX — DEPLOYMENT_PLAN.md
Version: 1.0

## 1. Environments
- Dev: Termux on Android phone (localhost)
- Production: Cloud (Render + Neon + R2) - NOT the phone

## 2. Provider Selection (APPROVED)
| Layer | Provider | Status |
|---|---|---|
| Next.js + Socket.IO | Render Free Web Service | Approved |
| PostgreSQL | Neon Free Plan | Approved |
| Object Storage | Cloudflare R2 Free | Approved |
| Ping (anti-sleep) | UptimeRobot Free | Approved |

## 3. Domain
- Owner to register (e.g., nexfix.app)
- HTTPS: Render-managed TLS (free)

## 4. Deployment Workflow
1. Push to GitHub main
2. Render auto-deploy
3. Run prisma migrate deploy in build step
4. Env vars set in Render Dashboard
5. Rollback: revert commit + redeploy

## 5. Backups
- Neon: provider-managed daily
- App-level: admin export endpoint (weekly, JSON, excluding private Excel)
- Restore drill: quarterly

## 6. Cost Policy
- Start USD 0
- Verify each free tier live before depending
- Any paid upgrade requires owner approval

## 7. Monitoring
- UptimeRobot ping every 5 minutes (keeps Render awake)
- Error tracking: Sentry free (optional, later)
- No PII in logs

## 8. First Deployment Sequence
1. Create GitHub repo
2. Create Neon account -> database
3. Create Cloudflare account -> R2 bucket
4. Create Render account -> Web Service
5. Set env vars (DATABASE_URL, AUTH_SECRET, S3_*)
6. Connect GitHub repo
7. Deploy
8. Smoke test: homepage, register, login
9. Verify HTTPS
10. Record in PROJECT_STATE.md

## 9. SYNC INFRASTRUCTURE
- Version Check Endpoint: GET /api/sync/version
- Full Sync: GET /api/sync/full
- Incremental Sync: GET /api/sync/changes?since=version
- Tombstones: GET /api/sync/tombstones?since=version
- Atomic apply on client (IndexedDB transaction)

## 10. BACKGROUND SYNC LIMITATIONS
- Browser close = no sync
- App reopen = sync triggers
- Internet reconnect = sync triggers
- Manual sync button = always available
- Push notification (future APK only)

## 11. CHAT INFRASTRUCTURE (EXTENDED)
- PostgreSQL chat_messages table
- R2 for attachments
- Socket.IO for real-time
- Local chat cache (IndexedDB)

## 9. SYNC INFRASTRUCTURE
- GET /api/sync/version, /api/sync/full, /api/sync/changes, /api/sync/tombstones

## 10. BACKGROUND SYNC LIMITATIONS
- No sync when browser closed; on reopen, reconnect, manual.

## 11. CHAT INFRASTRUCTURE
- PostgreSQL + R2 + Socket.IO + Local cache.
