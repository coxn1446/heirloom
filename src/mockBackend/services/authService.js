import { getMockDb } from '../db';
import * as userQueries from '../queries/userQueries';

function delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Mimics server-side session: in static app this lives in memory only (resets on refresh unless you add persistence). */
let activeUserId = null;

export async function mockLogin({ username }) {
  await delay();
  const db = getMockDb();
  const user = userQueries.findUserByUsername(db, username);
  if (!user) {
    return { ok: false, status: 401, body: { error: 'Invalid credentials' } };
  }
  activeUserId = user.user_id;
  const { password: _p, ...safe } = user;
  return {
    ok: true,
    status: 200,
    body: { user: safe, isProfileComplete: true },
  };
}

export async function mockMe() {
  await delay(40);
  if (activeUserId == null) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Not authenticated' },
    };
  }
  const db = getMockDb();
  const user = userQueries.findUserById(db, activeUserId);
  if (!user) {
    activeUserId = null;
    return {
      ok: false,
      status: 401,
      body: { error: 'Not authenticated' },
    };
  }
  const { password: _p, ...safe } = user;
  return {
    ok: true,
    status: 200,
    body: { user: safe, isProfileComplete: true },
  };
}

export async function mockLogout() {
  await delay(30);
  activeUserId = null;
  return { ok: true, status: 200, body: {} };
}
