# NEXFIX — DATABASE_PLAN.md
Version: 1.0
Database: PostgreSQL (Neon)

## 1. Entities
### users
- id (uuid PK)
- public_id (text unique, NXF-XXXXX)
- email (citext unique)
- password_hash (text)
- role (enum: user|moderator|admin|superadmin)
- display_name, locale, theme
- created_at, updated_at, last_seen_at

### sessions
- id (uuid PK), user_id (FK), token_hash, ip_hash, user_agent
- created_at, expires_at, revoked_at

### machines
- id, name, slug (unique), status (draft|published|archived)

### error_codes
- id, machine_id (FK), code, name, status, version
- UNIQUE (machine_id, code)

### error_content
- id, error_code_id (FK), locale, cause, troubleshooting, solution, safety, notes, version

### articles
- id, slug (unique), status, version, published_at

### article_content
- id, article_id (FK), locale, title, body, version

### media
- id, owner_type, owner_id, kind, mime, size, hash, storage_key, status

### chat_messages
- id, user_id, body, kind, media_id, created_at, edited_at, deleted_at, deleted_by

### chat_reports
- id, message_id, reporter_id, reason, status, resolved_by, resolved_at

### chat_moderation
- id, target_user_id, action, reason, expires_at, actor_id, created_at

### notifications
- id, user_id, kind, payload (jsonb), read_at, created_at

### notes
- id, user_id, title, body, created_at, updated_at

### reminders
- id, note_id, user_id, recurrence, tz, next_at, status, snooze_until

### reminder_occurrences
- id, reminder_id, due_at, state, done_at

### user_excel_datasets (PRIVATE)
- id, user_id, filename, schema_json, version, status
- Admin zero access. No joins to admin views.

### user_excel_rows (PRIVATE)
- id, dataset_id, data_json
- User-scoped queries only.

### activity_events
- id, user_id, kind, target_type, target_id, meta_json, created_at
- Retention: 180d

### search_events
- id, user_id, scope (shared|private), query, result_count, created_at
- Retention: 90d
- scope=private excluded from admin API

### audit_log
- id, actor_id, action, target_type, target_id, meta_json, created_at
- Append-only

## 2. Indexes
- users(email), users(public_id)
- error_codes(machine_id, code), error_codes(code)
- articles(slug), articles(status, published_at)
- chat_messages(created_at DESC), chat_messages(user_id)
- notifications(user_id, read_at)
- reminders(next_at), reminders(user_id)
- activity_events(user_id, created_at), activity_events(created_at)
- search_events(user_id, created_at)

## 3. Privacy Boundaries (HARD RULES)
- user_excel_datasets/rows: user-scoped only. Admin endpoints MUST NOT include.
- search_events(scope=private): excluded from admin API.
- Notes body: user-scoped only.
- Passwords/tokens: never in activity_events or audit_log.

## 4. Retention
- activity_events: 180 days
- search_events: 90 days
- audit_log: indefinite (append-only)
- chat_messages: indefinite (soft-delete on moderation)

## 5. LOCAL DATABASE (IndexedDB) — Browser Side
### nexfix-shared
- machines (synced)
- error_codes (synced)
- error_content (synced)
- articles (synced)
- article_content (synced)
- sync_metadata (version, last_sync)

### nexfix-private-<userId>
- excel_dataset (local-only)
- excel_rows (local-only)
- notes_cache

### nexfix-chat-cache
- chat_messages (recent, paginated)

## 6. SERVER DATABASE — Chat Additions (LOCKED)
### chat_messages (extended)
- id (uuid PK)
- sender_id (FK users)
- idempotency_key (unique, prevents duplicates)
- content (text)
- message_type (text|emoji|photo|video|file)
- attachment_ref (nullable, FK media)
- created_at
- edited_at
- deleted_at (soft delete)
- moderation_status (pending|approved|hidden)

### chat_attachments
- id, message_id (FK), media_id (FK), mime, size, hash

### chat_idempotency
- key (unique), user_id, created_at, expires_at

## 7. SYNC TABLES (Server)
### data_versions
- entity (machine|error|article)
- version (int)
- published_at
- revision_hash

### tombstones
- entity, entity_id, deleted_at, reason

## 8. PRIVACY (UNCHANGED + REINFORCED)
- Private Excel: Local-only, never syncs, admin zero access.
- Chat messages: Server (PostgreSQL) but private notes never logged.
- Search queries: Not sent to server (Local-first).

## 5. LOCAL DATABASE (IndexedDB)
- nexfix-shared: machines, error_codes, error_content, articles, article_content, sync_metadata
- nexfix-private-<userId>: excel_dataset, excel_rows, notes_cache
- nexfix-chat-cache: chat_messages

## 6. SERVER DATABASE — Chat (LOCKED)
- chat_messages: id, sender_id, idempotency_key, content, message_type, attachment_ref, created_at, edited_at, deleted_at, moderation_status
- chat_attachments, chat_idempotency

## 7. SYNC TABLES (Server)
- data_versions, tombstones
