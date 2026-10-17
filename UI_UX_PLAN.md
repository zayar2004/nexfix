# NEXFIX — UI_UX_PLAN.md
Version: 1.0

## 1. Design Tokens
- Colors: see brand
- Type: 12/14/16/18/20/24/32, line-height 1.4-1.6
- Spacing: 4/8/12/16/24/32
- Radius: 8/12/16
- Motion: 120-240ms; disabled on prefers-reduced-motion

## 2. Navigation
### Mobile (bottom nav)
Home | Library | Chat | Notes | Profile
### Admin (sidebar)
Dashboard, Machines, Errors, Knowledge, Media, Users, Chat, Presence, Sessions, Activity, Search History, Audit, Ops

## 3. Screen Inventory (User)
| Route | States |
|---|---|
| / | empty/loading/offline |
| /search | empty/loading/offline/error/no-match |
| /errors/[id] | loading/offline/error |
| /library | loading/offline/stale |
| /library/[slug] | loading/offline/stale |
| /chat | loading/offline/reconnecting |
| /notes | empty/loading |
| /notes/[id] | save states |
| /settings | - |
| /settings/excel | validation errors |
| /notifications | empty/loading |
| /profile | - |
| /login, /register | error |

## 4. Screen Inventory (Admin)
/admin/login, /admin, /admin/machines, /admin/errors, /admin/knowledge, /admin/media, /admin/users, /admin/chat, /admin/presence, /admin/sessions, /admin/activity, /admin/search-history, /admin/audit, /admin/ops

## 5. Component States (mandatory)
Every data screen: loading (skeleton), empty (icon+text+CTA), error (message+retry), offline (cached banner), permission-denied

## 6. Bilingual
- i18n dictionary: /locales/my.json, /locales/en.json
- All strings from dictionary (no hardcoded)
- Date/time localized, TZ Asia/Yangon
- Error codes stay Latin

## 7. Accessibility
- WCAG AA contrast
- Tap target >= 44x44
- Focus outlines
- Alt text

## 8. Mobile Rules
- Test at 360px
- No horizontal scroll
- Input font >= 16px (prevent zoom)
- Sticky nav safe-area aware

## 9. OFFLINE/ONLINE UI STATES (LOCKED 2026-10-17)
Status indicators:
- "Online" (green dot)
- "Offline — Using Saved Data" (amber banner)
- "Syncing..." (blue spinner)
- "Update Available" (blue badge)
- "Sync Failed — Retry" (red button)
- "Last Synced: [Date/Time]" (gray text)
- "Some Data May Be Outdated" (amber warning)

Feature availability:
- Search/Knowledge: Always available (local)
- Chat Send: Online only (disable offline, show reason)
- Chat Read: Cached history only offline
- Profile/Settings: Local + synced on reconnect

## 10. CHAT UI
- "Offline — Connect to send messages" banner
- Message status: Sending / Sent / Failed
- Retry button on failed messages
- Attachment previews (local, before send)

## 9. OFFLINE/ONLINE UI STATES
- Online / Offline / Syncing / Update Available / Sync Failed / Last Synced / Outdated
- Search always available. Chat send online only.

## 10. CHAT UI
- "Offline — Connect to send" banner
- Sending / Sent / Failed states
- Retry button

## 11. BRAND DESIGN TOKENS (LOCKED 2026-10-17)
### Dark Theme (Default)
- --color-bg-base: #0B1020 (Midnight Navy)
- --color-bg-surface: #141A2E
- --color-bg-elevated: #1C2438
- --color-primary: #176BFF (Electric Blue)
- --color-accent: #20E3FF (Cyber Cyan)
- --color-text-primary: #F4F7FF (Cool White)
- --color-text-secondary: #A8B2C9
- --color-border: #232B42
- --color-success: #22C55E
- --color-warning: #F59E0B
- --color-error: #EF4444

### Light Theme
- --color-bg-base: #F4F7FF
- --color-bg-surface: #FFFFFF
- --color-bg-elevated: #F9FAFC
- --color-text-primary: #0B1020
- --color-text-secondary: #4A5263
- --color-border: #D9E0EC
- --color-accent: #0891B2 (darker cyan for contrast)

### Typography
- Sans: Inter, Noto Sans Myanmar, Pyidaungsu, system-ui
- Mono: JetBrains Mono, SF Mono, monospace
- Scale: 12/14/16/18/20/24/30/36px
- Myanmar line-height: 1.7 (Burmese needs more space)
- English line-height: 1.5

### Spacing / Sizing
- Space: 4/8/12/16/24/32px
- Radius: 6/10/14px
- Touch target: >=44x44px
- Input height: >=48px
- Icon: 16/20/24/32px
- Body font: >=16px (prevent iOS zoom)
- Breakpoints: 360/768/1024/1280px
- Content max: 640px (mobile), 1200px (admin)

### Motion
- Duration: 120ms (fast), 200ms (normal)
- prefers-reduced-motion: fully respected

## 12. HOME HEADER (LOCKED)
[ NEXFIX logo ] [ 14:32 local ] [ refresh ] [ bell ] [ green-dot + count ]
- No "Online"/"Offline" text label
- Green dot icon + real online count
- Local time: Asia/Yangon, updates every minute
- Refresh: manual sync trigger
- Bell: unread badge

## 13. HOME SEARCH SECTIONS (LOCKED)
### Section A: Machine & Error Search
- Machine Name input + Error Code input (same row >=360px)
- Stack vertically <360px (no clipping)
- "Search Errors" button (full-width mobile)
- Triggers: machine only / code only / both
- Exact error code prioritized
- States: validation/loading/empty/error/offline

### Section B: Machine Code Search (visually distinct)
- Accent border (Cyber Cyan #20E3FF)
- Dedicated Machine Code input
- "Find Machine" button
- Identifies machine, not error code

### Below Search
- Recent Diagnostics (compact list, max 5)
- Sync status (real last-sync time)
- No fabricated progress %
- Stale warning if >24h

## 14. NAVIGATION (LOCKED)
- Bottom Nav (mobile): Home | Library | Chat | Notes | Profile
- Admin: separate sidebar menu
- No /search primary route (D-54)

## 15. GLOBAL UI STATES (LOCKED)
- Initial Loading (skeleton)
- Empty Result (icon + CTA)
- Validation Error (red text + border)
- Network Error (red banner + retry)
- Offline - Using Saved Data (amber banner)
- Syncing (cyan spinner)
- Update Available (blue badge)
- Sync Failed (red + retry)
- Last Synced (gray text)
- Data May Be Outdated (amber text, >24h)
- Permission Denied (lock icon)
- Session Expired (dialog)
- Chat Not Sent (red icon)
- Chat Sent (checkmark, ONLY after server DB confirms)

## 16. AUTH PAGES (LOCKED)
- /login: phone OR userID + password
- /register: phone OR userID + password + confirm
- /forgot-password: "Contact admin" info (no email/SMS)
