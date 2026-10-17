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
