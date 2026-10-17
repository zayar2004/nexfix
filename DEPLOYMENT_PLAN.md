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
