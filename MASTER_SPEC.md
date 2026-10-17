# NEXFIX — MASTER_SPEC.md
Version: 1.0 (Approved Stage 0)
Status: APPROVED
Date: 2026-10-17

## 1. Product Identity
- Name: NEXFIX
- Tagline: Diagnose. Repair. Connect.
- Purpose: Mobile-first arcade machine diagnostics & technician intelligence platform.

## 2. Brand
- Midnight Navy: #0B1020
- Electric Blue: #176BFF
- Cyber Cyan: #20E3FF
- Cool White: #F4F7FF
- Success Green: #22C55E
- Warning Amber: #F59E0B
- Error Red: #EF4444

## 3. Locale & Accessibility
- Languages: my (Burmese), en (English)
- Timezone: Asia/Yangon
- Themes: Dark, Light
- Settings: Font size, Reduce Motion
- Mobile-first: 360px baseline

## 4. Confirmed Requirements
- R-01: Server-side authorization on every protected endpoint
- R-02: Private Excel data isolated from Admin/public
- R-03: No production server on owner's phone
- R-04: Disconnected != logged-out; show "Connection Lost" / "Last Seen"
- R-05: Never log passwords, tokens, private notes, private Excel content
- R-06: No fabrication of test/deploy results
- R-07: Admin at /admin with RBAC + Rate Limit + Audit
- R-08: Moderator: Hide/Mute/Timeout only; Ban = Admin+
- R-09: Retention: Search 90d / Activity 180d
- R-10: Backup daily + Restore test quarterly
- R-11: Budget: USD 0 initially; paid requires approval

## 5. Feature Scope (MVP)
### A. Accounts
- Register/Login/Logout, unique public_id, RBAC server-side

### B. Error Search
- Separate Machine Name + Error Code fields
- Live search (no button), exact code first
- Detail: cause, troubleshooting, solution, safety, notes, media

### C. Knowledge Library
- Admin-published articles, draft/publish/archive/rollback
- Offline cache with stale badge

### D. Private Excel
- Local-only (IndexedDB), Admin zero visibility
- Import/Validate/Replace/Delete/Export
- Atomic replacement (fail preserves previous)

### E. Notes & Reminders
- Recurrence: once/daily/weekly/monthly/yearly
- Done/Not Done, snooze, pause, resume
- Repeat every 5 min while incomplete (browser limits disclosed)

### F. Notifications
- Bell + unread count, sound on/off
- No self-notify, no notify while reading

### G. Public Chat
- Read: guest; Post: auth
- Text/emoji/media, persist, reconnect, idempotency
- Reports, moderation, audit, presence honesty

### H. Admin Web (/admin)
- Machines/Errors/Knowledge/Media CRUD + workflows
- Users/Roles, Presence, Sessions, Activity, Search History, Audit
- Backup/Restore, Monitoring

## 6. Out of Scope (v1)
- Native Android APK (deferred to Phase 11)
- Push notifications (native)
- Languages beyond my/en
- Cloud sync for private Excel

## 7. Success Criteria
- SC-01: Usable at 360px viewport
- SC-02: Exact error code ranks first
- SC-03: Failed Excel replace preserves previous
- SC-04: Admin cannot see private Excel
- SC-05: Chat read works logged-out
- SC-06: Disconnected labeled correctly
- SC-07: Fresh chat can continue from continuity files
