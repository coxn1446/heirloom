# Database Schema Documentation

> **IMPORTANT**: For Heirloom, this describes the **logical** schema your mock (`src/mockBackend`) and future PostgreSQL database should align with. Update this file whenever you add tables or fields.

## Last Updated
2026-03-30

## Overview

Minimal starter schema: **users** for mock authentication demos. Expand with feature tables as the product grows.

## Tables

### users

- **Purpose**: Account records for mock (and future real) auth.
- **Columns**:
  - `user_id` (INTEGER, primary key) — synthetic id in mock; SERIAL in Postgres
  - `username` (TEXT UNIQUE NOT NULL)
  - `email` (TEXT)
  - `password` (TEXT, nullable in mock) — bcrypt hash in production
  - `created_at` (TIMESTAMPTZ / ISO string in mock)
- **Primary Key**: `user_id`
- **Indexes**: `username` (unique)
- **Foreign Keys**: none
- **Last Modified**: 2026-03-30

### sessions

- **Purpose**: Reserved for future session-store documentation (e.g. `connect-pg-simple`). The static app uses an in-memory session in `authService.js` instead.
- **Columns**: TBD when a real backend exists.
- **Last Modified**: 2026-03-30

---

## Relationships Diagram

```
(users) — no FKs in shell
```

---

## Migration History

### 2026-03-30 - Initial shell

- **Description**: Documented starter `users` table and mock seed user `demo`.
- **Tables Created**: `users` (logical)
- **Breaking Changes**: none

---

## Notes

- Mock data initializer: `src/mockBackend/db/index.js`
- When moving to PostgreSQL, add triggers, constraints, and real session storage here first, then implement in SQL.

---

## Initial Setup SQL (reference for future Postgres)

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);

INSERT INTO users (username, email) VALUES ('demo', 'demo@example.com');
```
