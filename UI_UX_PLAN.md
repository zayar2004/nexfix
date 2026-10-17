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
