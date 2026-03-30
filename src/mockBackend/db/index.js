/**
 * In-browser store that mimics a PostgreSQL-backed database for static / Surge deployments.
 * Structure mirrors DATABASE_SCHEMA.md. Persist optional via localStorage (off by default).
 */

const STORAGE_KEY = 'heirloom_mock_db_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function createInitialState() {
  return {
    users: [
      {
        user_id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: null,
        created_at: new Date().toISOString(),
      },
    ],
    sessions: [],
  };
}

let memory = load() || createInitialState();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

export function getMockDb() {
  return memory;
}

export function resetMockDb() {
  memory = createInitialState();
  persist();
}

export function updateMockDb(mutator) {
  mutator(memory);
  persist();
}

export function enableMockPersistence() {
  persist();
}
