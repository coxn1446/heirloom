/**
 * Mock query layer — mirrors server/queries/* (parameterized-style API, no raw SQL).
 */

export function findUserByUsername(db, username) {
  return db.users.find((u) => u.username === username) || null;
}

export function findUserById(db, userId) {
  return db.users.find((u) => u.user_id === userId) || null;
}

export function listUsers(db) {
  return [...db.users];
}
