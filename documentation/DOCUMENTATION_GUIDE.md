# Documentation Guide

This guide explains how to use and maintain the documentation templates throughout your project lifecycle.

## Files Overview

### 1. `APP_SHELL_PROMPT.md`
**Purpose**: Comprehensive prompt for generating new app shells based on your chosen architecture.

### 2. `DATABASE_SCHEMA.md` (create from template)
**Purpose**: Complete documentation of your database structure.

**When to use**: 
- When starting a new project, copy this template to your project
- Use as your primary source of truth for the DB schema and migrations

**How to use**:
1. Copy `DATABASE_SCHEMA_TEMPLATE.md` to `DATABASE_SCHEMA.md`
2. Document all tables, columns, constraints, triggers, or indexes
3. Update this file **immediately** after any database changes
4. Add migration notes with dates
5. Keep it accurate and in sync with the actual database

**Example workflow**:
```sql
-- You run this SQL:
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

-- IMMEDIATELY update DATABASE_SCHEMA.md:
### users
- **Columns**:
  - ...
  - `phone_number` (VARCHAR(20)) - User's phone number
- **Last Modified**: 2024-01-15
```

### 3. `ARCHITECTURE.md` (create from template)
**Purpose**: High-level architecture documentation and feature descriptions.

**When to update**:
- When adding new features
- When architecture patterns or integrations change
- When deployment processes change
- Periodically to keep it current

**How to maintain**:
1. Start with `ARCHITECTURE_TEMPLATE.md` as a base
2. Copy it to your project as `ARCHITECTURE.md`
3. Update as you build features
4. Keep API endpoint docs up-to-date
5. Document integration points when relevant

### 4. `TESTING_GUIDELINES.md` (create from template)
**Purpose**: Comprehensive testing guidelines and best practices.

**When to use**:
- When writing new tests
- When reviewing test coverage
- When setting up test infrastructure
- When onboarding/training new developers

**How to maintain**:
1. Start with `TESTING_GUIDELINES_TEMPLATE.md`
2. Copy it to your project as `TESTING_GUIDELINES.md` (or `src/tests/README.md` if preferred)
3. Customize with project-specific info
4. Update as practices evolve

**Example workflow**:
```javascript
// You add a new feature: Comments
// 1. Build the feature
// 2. Update ARCHITECTURE.md:

## Features

### Comments
- **Description**: Users can comment on posts
- **Components**: CommentList, CommentForm, CommentItem
- **Routes**: /api/comments
- **Services**: commentService.js
- **State**: comments reducer
- **Dependencies**: Posts, Users
```

## Documentation Workflow

### Starting a New Project

1. **Copy templates**:
   ```bash
   cp DATABASE_SCHEMA_TEMPLATE.md DATABASE_SCHEMA.md
   cp ARCHITECTURE_TEMPLATE.md ARCHITECTURE.md
   cp APP_SHELL_PROMPT.md APP_SHELL_PROMPT.md
   cp TESTING_GUIDELINES_TEMPLATE.md TESTING_GUIDELINES.md
   # Or copy to src/tests/README.md if preferred
   ```

2. **Customize templates**:
   - Update project name
   - Update dates
   - Add an initial project description

3. **Use APP_SHELL_PROMPT.md** to generate the app structure

### During Development

#### When Making Database Changes

1. **Make the change** (SQL, migration, etc.)
2. **IMMEDIATELY update DATABASE_SCHEMA.md**:
   - Add/modify table documentation
   - Update indexes, constraints, triggers
   - Add migration notes with dates
3. **Commit both together**:
   ```bash
   git add migration_file.sql DATABASE_SCHEMA.md
   git commit -m "Add phone_number to users table"
   ```

#### When Adding Features

1. **Build the feature**
2. **Update ARCHITECTURE.md**:
   - Add feature description
   - Document components, routes, services
   - Update API endpoints section
3. **Update DATABASE_SCHEMA.md** if the database changed
4. **Update tests** (see Testing section)

#### When Adding Tests

1. **Follow testing guidelines** in `TESTING_GUIDELINES.md` (or `src/tests/README.md`)
2. **Write tests** in `src/tests/` or `server/tests/` following established patterns
3. **Use shared mock utilities** from `src/tests/__mocks__/` when available
4. **Update setupTests.js** if new utilities are added
5. **Document test coverage** in ARCHITECTURE.md

## Best Practices

### Database Documentation
- ✅ Update immediately after changes
- ✅ Include dates for all changes
- ✅ Document the "why", not just the "what"
- ✅ Keep migration history
- ❌ Don’t let it get out of sync
- ❌ Don’t document in multiple places

### Architecture Documentation
- ✅ Update when features are complete
- ✅ Keep API endpoints current
- ✅ Document integration points
- ✅ Include diagrams when helpful
- ❌ Don’t document incomplete features
- ❌ Don’t duplicate code comments

### General
- ✅ Keep documentation in the codebase
- ✅ Review documentation during code reviews
- ✅ Use clear, concise language
- ✅ Include examples when helpful
- ❌ Don’t let documentation become stale
- ❌ Don’t document implementation details (that's what code is for)

## Quick Reference Checklist

### Database Change Checklist
- [ ] Make database change
- [ ] Update DATABASE_SCHEMA.md immediately
- [ ] Add migration note with date
- [ ] Update related queries if needed
- [ ] Test the change
- [ ] Commit database change + documentation together

### Feature Addition Checklist
- [ ] Build the feature
- [ ] Update ARCHITECTURE.md with feature details
- [ ] Update DATABASE_SCHEMA.md if database changed
- [ ] Add/update tests
- [ ] Update API documentation
- [ ] Review documentation for accuracy

### Code Review Checklist
- [ ] Check if DATABASE_SCHEMA.md was updated for DB changes
- [ ] Check if ARCHITECTURE.md was updated for new features
- [ ] Verify documentation accuracy
- [ ] Ensure tests were added/updated

## Benefits of This Approach

1. **Onboarding**: New developers can understand the system quickly
2. **Maintenance**: Easier to make changes when you understand the full picture
3. **Debugging**: Clear documentation helps identify issues faster
4. **Planning**: Architecture docs help plan new features

## Example: Complete Feature Addition

Let's say you're adding a "Likes" feature:

1. **Database Change**:
   ```sql
   CREATE TABLE likes (
     like_id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(user_id),
     item_id INTEGER,
     item_type VARCHAR(20),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Update DATABASE_SCHEMA.md**:
   ```markdown
   ### likes
   - **Purpose**: Stores user likes on posts, comments, etc.
   - **Columns**:
     - `like_id` (SERIAL PRIMARY KEY)
     - `user_id` (INTEGER) - References users.user_id
     - `item_id` (INTEGER) - ID of liked item
     - `item_type` (VARCHAR(20)) - Type: 'post', 'comment', etc.
     - `created_at` (TIMESTAMPTZ) - When like was created
   - **Foreign Keys**: user_id → users(user_id)
   - **Indexes**: idx_likes_user_item on (user_id, item_id, item_type)
   - **Last Modified**: 2024-01-15
   ```

3. **Build Feature** (routes, services, components)

4. **Update ARCHITECTURE.md**:
   ```markdown
   ### Likes
   - **Description**: Users can like posts and comments
   - **Components**: LikeButton, LikeCount
   - **Routes**: POST /api/likes, DELETE /api/likes/:id
   - **Services**: likesService.js
   - **State**: posts reducer (includes like state)
   - **Dependencies**: Posts, Comments
   ```

5. **Add Tests**: Test like creation, deletion, counts

6. **Commit Everything Together**

---

**Remember**: Documentation is not a chore, it's an investment. Well-maintained documentation makes development faster and more reliable.
