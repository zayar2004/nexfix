# NEXFIX — SECURITY_PLAN.md
Version: 1.0

## 1. Authentication
- Password: Argon2id (fallback bcrypt cost >=12)
- Sessions: Auth.js HttpOnly + Secure + SameSite=Lax cookies
- Session rotation on login
- Rate limit: login 5/min per IP+email

## 2. Authorization
- Server-side middleware on every protected route
- Client role checks = UX only, never trusted
- /api/admin/* namespace separate
- RBAC matrix enforced in middleware

## 3. Input Validation
- Zod schema on all inputs (server-side)
- Prisma parameterized queries (no raw SQL)
- File names sanitized

## 4. Upload Safety
- Whitelist: image/jpeg, image/png, image/webp, video/mp4, application/pdf
- Magic-byte verification (not just MIME header)
- Max: image 5MB, video 50MB, file 20MB
- Random storage key (uuid)
- No execution from storage; signed URLs only

## 5. Chat Moderation
- Report -> moderator queue
- Actions: hide, mute (1h/24h/7d), timeout (same), ban (admin+)
- Anti-spam: 10 msg/min/user, duplicate detection (same body within 10s)

## 6. Privacy
- Activity logging: page visits, searches, result views, article views
- NEVER log: passwords, tokens, private notes bodies, private Excel rows
- Disclosure at /settings/privacy
- Private Excel: zero admin visibility (API + DB query layer)
- Presence labels: "Online" (<90s) / "Last seen X" / "Connection lost"

## 7. Threat Model
- Credential stuffing -> Rate limit + Argon2id + session rotation
- XSS in chat -> Server sanitization + CSP + output encoding
- SQL injection -> Prisma parameterized
- CSRF -> SameSite + CSRF token
- Malicious upload -> Magic byte + size + MIME
- Private data leak -> Table isolation + tests
- Admin escalation -> Server role checks
- DoS -> Rate limits

## 8. Recovery
- Daily Neon backup (provider) + weekly app-level export (admin)
- Restore drill quarterly
- Audit log immutable

## 9. Secrets
- Env vars only (Render Dashboard)
- Never committed
- Rotated on leak

## 10. LOCAL-FIRST SECURITY (LOCKED 2026-10-17)
- Search queries stay local (no network leak).
- Sync payload: Validated server-side before applying.
- Local data: Integrity hash check on sync.
- Chat attachments: File type/size/signature validated.
- Idempotency: Prevent duplicate messages on retry.
- Tombstone: Proper removal from cache.
- Data corruption: Atomic transaction + rollback.

## 11. CHAT SECURITY
- Server persists ALL messages (source of truth).
- Base64 in DB prohibited (use R2 storage).
- Message retention policy: Defined per moderation.
- Audit log: All moderation actions recorded.
- Password/token never in chat log.

## 10. LOCAL-FIRST SECURITY
- Search stays local (no network leak).
- Sync validated server-side, integrity hash, atomic.
- Chat: Idempotency, R2 for media (not Base64).
- Audit log all moderation.

## 11. CHAT SECURITY
- Server source of truth. Base64 in DB prohibited. Retention policy.
