import journalImage from '../../resources/journal.png';
import toastGlassesImage from '../../resources/toastglasses.png';
import trunkImage from '../../resources/trunk.png';
import familyImage from '../../resources/family.png';

/**
 * In-browser store that mimics a PostgreSQL-backed database for static / Surge deployments.
 * Structure mirrors DATABASE_SCHEMA.md. Data is intentionally session-only.
 */

function createInitialState() {
  const now = new Date().toISOString();

  return {
    users: [
      {
        user_id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: null,
        created_at: now,
      },
      {
        user_id: 2,
        username: 'timo',
        email: 'timo@example.com',
        password: null,
        created_at: now,
      },
      {
        user_id: 3,
        username: 'natalie',
        email: 'natalie@example.com',
        password: null,
        created_at: now,
      },
      {
        user_id: 4,
        username: 'samantha',
        email: 'samantha@example.com',
        password: null,
        created_at: now,
      },
      {
        user_id: 5,
        username: 'willa',
        email: 'willa@example.com',
        password: null,
        created_at: now,
      },
      {
        user_id: 6,
        username: 'helen',
        email: 'helen@example.com',
        password: null,
        created_at: now,
      },
      {
        user_id: 7,
        username: 'oscar',
        email: 'oscar@example.com',
        password: null,
        created_at: now,
      },
    ],
    families: [
      {
        family_id: 1,
        name: 'Nash-Stevens',
        description: 'Shared heirlooms, stories, and gifts passed through the Nash-Stevens side of the family.',
        created_by_user_id: 1,
        photo_url: familyImage,
        photo_name: 'family.png',
        created_at: now,
      },
      {
        family_id: 2,
        name: 'Freese-Oddleifson',
        description: 'Objects, silver, and stories that trace through the Freese-Oddleifson lineage.',
        created_by_user_id: 2,
        photo_url: familyImage,
        photo_name: 'family.png',
        created_at: now,
      },
      {
        family_id: 3,
        name: 'Archive Council',
        description: 'A cross-branch family group for shared records, restored objects, and photos with overlapping relevance.',
        created_by_user_id: 2,
        photo_url: familyImage,
        photo_name: 'family.png',
        created_at: now,
      },
      {
        family_id: 4,
        name: 'Cousins Correspondence',
        description: 'A family circle focused on letters, table traditions, and objects that still appear at cousin gatherings.',
        created_by_user_id: 1,
        photo_url: familyImage,
        photo_name: 'family.png',
        created_at: now,
      },
    ],
    family_memberships: [
      {
        membership_id: 1,
        family_id: 1,
        user_id: 1,
        role: 'admin',
        created_at: now,
      },
      {
        membership_id: 2,
        family_id: 1,
        user_id: 2,
        role: 'admin',
        created_at: now,
      },
      {
        membership_id: 3,
        family_id: 1,
        user_id: 4,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 4,
        family_id: 2,
        user_id: 2,
        role: 'admin',
        created_at: now,
      },
      {
        membership_id: 5,
        family_id: 2,
        user_id: 5,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 6,
        family_id: 3,
        user_id: 2,
        role: 'admin',
        created_at: now,
      },
      {
        membership_id: 7,
        family_id: 3,
        user_id: 1,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 8,
        family_id: 3,
        user_id: 3,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 9,
        family_id: 3,
        user_id: 6,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 10,
        family_id: 4,
        user_id: 1,
        role: 'admin',
        created_at: now,
      },
      {
        membership_id: 11,
        family_id: 4,
        user_id: 4,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 12,
        family_id: 4,
        user_id: 6,
        role: 'member',
        created_at: now,
      },
      {
        membership_id: 13,
        family_id: 4,
        user_id: 7,
        role: 'member',
        created_at: now,
      },
    ],
    items: [
      {
        item_id: 1,
        owner_user_id: 1,
        created_by_user_id: 1,
        title: 'Recipe Journal',
        type: 'Paper Goods',
        description: 'A private notebook of handwritten recipes and margin notes saved so the family context does not fade.',
        year_made: '1978',
        date_received: '2011-05-15',
        photo_url: journalImage,
        photo_name: 'journal.png',
        created_at: now,
      },
      {
        item_id: 2,
        owner_user_id: 2,
        created_by_user_id: 2,
        title: 'Wedding Toast Glasses',
        type: 'Glassware',
        description: 'A pair of glasses tied to a major family milestone and shared so the story remains attached to the object.',
        year_made: '2009',
        date_received: '2009-09-12',
        photo_url: toastGlassesImage,
        photo_name: 'toastglasses.png',
        created_at: now,
      },
      {
        item_id: 3,
        owner_user_id: 3,
        created_by_user_id: 3,
        title: 'Family Trunk',
        type: 'Storage',
        description: 'A shared heirloom trunk holding letters, loose photographs, and objects that matter across more than one family branch.',
        year_made: '1936',
        date_received: '1998-11-20',
        photo_url: trunkImage,
        photo_name: 'trunk.png',
        created_at: now,
      },
      {
        item_id: 4,
        owner_user_id: 2,
        created_by_user_id: 2,
        title: 'Annotated Photo Album',
        type: 'Paper Goods',
        description: 'An album of labeled snapshots used to anchor names, branches, and reunion stories across cousins.',
        year_made: '1968',
        date_received: '2006-08-14',
        photo_url: journalImage,
        photo_name: 'journal.png',
        created_at: now,
      },
      {
        item_id: 5,
        owner_user_id: 1,
        created_by_user_id: 1,
        title: 'Porcelain Serving Bowl',
        type: 'Tableware',
        description: 'A large serving bowl that still appears at family gatherings and is referenced in cousin correspondence.',
        year_made: '1949',
        date_received: '1999-12-18',
        photo_url: toastGlassesImage,
        photo_name: 'toastglasses.png',
        created_at: now,
      },
      {
        item_id: 6,
        owner_user_id: 6,
        created_by_user_id: 6,
        title: 'Keepsake Brooch',
        type: 'Jewelry',
        description: 'A brooch with notes about who wore it at milestone events, shared across two family circles.',
        year_made: '1928',
        date_received: '2018-05-05',
        photo_url: trunkImage,
        photo_name: 'trunk.png',
        created_at: now,
      },
    ],
    item_families: [
      {
        item_family_id: 1,
        item_id: 1,
        family_id: 1,
        created_at: now,
      },
      {
        item_family_id: 2,
        item_id: 2,
        family_id: 1,
        created_at: now,
      },
      {
        item_family_id: 3,
        item_id: 2,
        family_id: 2,
        created_at: now,
      },
      {
        item_family_id: 4,
        item_id: 4,
        family_id: 3,
        created_at: now,
      },
      {
        item_family_id: 5,
        item_id: 5,
        family_id: 1,
        created_at: now,
      },
      {
        item_family_id: 6,
        item_id: 5,
        family_id: 4,
        created_at: now,
      },
      {
        item_family_id: 7,
        item_id: 6,
        family_id: 3,
        created_at: now,
      },
      {
        item_family_id: 8,
        item_id: 6,
        family_id: 4,
        created_at: now,
      },
    ],
    item_events: [
      {
        item_event_id: 1,
        item_id: 1,
        title: 'Cataloged from family memory',
        description: 'Documented with stories about the house where it originally stood and who cared for it.',
        occurred_on: '2026-03-01',
        photo_url: journalImage,
        photo_name: 'journal.png',
        created_by_user_id: 1,
        created_at: now,
      },
      {
        item_event_id: 2,
        item_id: 2,
        title: 'Marked for future inheritance discussion',
        description: 'Notes added about how the set might be divided between Samantha and Willa one day.',
        occurred_on: '2026-03-12',
        photo_url: toastGlassesImage,
        photo_name: 'toastglasses.png',
        created_by_user_id: 2,
        created_at: now,
      },
      {
        item_event_id: 3,
        item_id: 3,
        title: 'Birthday purchase remembered',
        description: 'Natalie logged the Bergdorf Goodman trip so the story stays attached to the bag.',
        occurred_on: '2025-04-22',
        photo_url: trunkImage,
        photo_name: 'trunk.png',
        created_by_user_id: 3,
        created_at: now,
      },
      {
        item_event_id: 4,
        item_id: 4,
        title: 'Album labels revised',
        description: 'Timo added names and dates after comparing notes from multiple branches.',
        occurred_on: '2026-03-18',
        photo_url: journalImage,
        photo_name: 'journal.png',
        created_by_user_id: 2,
        created_at: now,
      },
      {
        item_event_id: 5,
        item_id: 5,
        title: 'Used at spring gathering',
        description: 'The serving bowl was brought out again and tied back to older family meal stories.',
        occurred_on: '2026-03-22',
        photo_url: toastGlassesImage,
        photo_name: 'toastglasses.png',
        created_by_user_id: 1,
        created_at: now,
      },
      {
        item_event_id: 6,
        item_id: 6,
        title: 'Brooch lending note added',
        description: 'Helen recorded the last family event where the brooch was worn and returned.',
        occurred_on: '2026-03-27',
        photo_url: trunkImage,
        photo_name: 'trunk.png',
        created_by_user_id: 6,
        created_at: now,
      },
    ],
    sessions: [],
  };
}

let memory = createInitialState();

export function getMockDb() {
  return memory;
}

export function getNextMockUserId() {
  return memory.users.reduce((maxUserId, user) => Math.max(maxUserId, user.user_id), 0) + 1;
}

function getNextId(collectionName, idField) {
  return memory[collectionName].reduce((maxId, record) => Math.max(maxId, record[idField]), 0) + 1;
}

export function getNextMockFamilyId() {
  return getNextId('families', 'family_id');
}

export function getNextMockMembershipId() {
  return getNextId('family_memberships', 'membership_id');
}

export function getNextMockItemId() {
  return getNextId('items', 'item_id');
}

export function getNextMockItemFamilyId() {
  return getNextId('item_families', 'item_family_id');
}

export function getNextMockItemEventId() {
  return getNextId('item_events', 'item_event_id');
}

export function resetMockDb() {
  memory = createInitialState();
}

export function updateMockDb(mutator) {
  mutator(memory);
}

export function enableMockPersistence() {
  /* intentionally a no-op: the mock app does not persist user data */
}
