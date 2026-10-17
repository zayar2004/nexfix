# NEXFIX — AGENTS.md
Permanent instructions for any AI continuing this project.

## Start-of-Task Ritual (mandatory)
1. Read in order: MASTER_SPEC.md -> ARCHITECTURE.md -> DATABASE_PLAN.md -> SECURITY_PLAN.md -> UI_UX_PLAN.md -> PHASE_PLAN.md -> PROJECT_STATE.md -> DECISIONS.md -> CHANGELOG.md -> HANDOFF.md -> AGENTS.md
2. State current phase and next task in one paragraph.
3. Do not rely on prior chat memory.

## Conflict Resolution Order
1. Verified code + passing tests
2. MASTER_SPEC.md (if CONFIRMED)
3. DECISIONS.md (latest non-superseded)
4. PHASE_PLAN.md
5. PROJECT_STATE.md
6. HANDOFF.md
7. Chat history

## Rules
- Planning-only until owner approves.
- Never install packages without owner approval.
- Never spend money or trigger paid services.
- Never fabricate test/deployment results.
- Never expose private Excel data to admin views/logs.
- Never log passwords/tokens/private content.
- All explanations in simple Burmese; identifiers in English.
- Give exact copy-paste commands only when implementation is approved.
- Update PROJECT_STATE.md + CHANGELOG.md + HANDOFF.md at end of each task.

## End-of-Task Handoff Format (HANDOFF.md)
- Task name
- Completed items (with file paths)
- Verification results (commands + outcome)
- Unresolved issues
- Exact next task

## PHASE 1 UPDATE (2026-10-17)
### Roles (NEW)
- user, staff, senior_admin, super_admin
- Old moderator/admin: SUPERSEDED

### Recovery (NEW)
- Admin-assisted only
- No email/SMS provider
- Audit every reset

### Home (LOCKED)
- Search lives on Home (no /search)
- Section A: Machine+Code (same row)
- Section B: Machine Code (visual distinct)

### Header (LOCKED)
- Brand + local time + refresh + bell + green-dot count
- No "Online/Offline" text label

### Chat (LOCKED)
- Sent only after server DB confirms
- No auto-queue offline

### Excel (LOCKED)
- Local only
- Never uploads to server
- Never visible to admin

### Phase Rules
- Documentation before code
- Server-side authz always
- No fabrication
- Update PROJECT_STATE + CHANGELOG + HANDOFF each task
- Commit/Push only with owner approval

### Start-of-Task Ritual
1. Read AGENTS.md
2. Read DECISIONS.md (latest non-superseded)
3. Read PROJECT_STATE.md
4. Read HANDOFF.md
5. Read phase-specific doc (UI_UX_PLAN, SECURITY_PLAN, etc.)
6. Confirm next task
7. Do not rely on chat memory
