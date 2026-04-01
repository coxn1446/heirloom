/**
 * Mock query layer — mirrors server/queries/* (parameterized-style API, no raw SQL).
 */

export function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

export function findUserByUsername(db, username) {
  const normalizedUsername = normalizeUsername(username);
  return db.users.find((u) => String(u.username || '').trim().toLowerCase() === normalizedUsername) || null;
}

export function findUserById(db, userId) {
  return db.users.find((u) => u.user_id === userId) || null;
}

export function listUsers(db) {
  return [...db.users];
}

export function createUserRecord(db, userRecord) {
  db.users.push(userRecord);
  return userRecord;
}
