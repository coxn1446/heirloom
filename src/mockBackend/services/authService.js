import { getMockDb, getNextMockUserId, updateMockDb } from '../db';
import * as userQueries from '../queries/userQueries';
import journalImage from '../../resources/journal.png';
import toastGlassesImage from '../../resources/toastglasses.png';
import trunkImage from '../../resources/trunk.png';
import familyImage from '../../resources/family.png';
import event7Image from '../../resources/event7.png';
import event8Image from '../../resources/event8.png';
import event9Image from '../../resources/event9.png';
import event10Image from '../../resources/event10.png';
import event11Image from '../../resources/event11.png';

function delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Mimics server-side session: in static app this lives in memory only (resets on refresh unless you add persistence). */
let activeUser = null;

function buildUserRecord(username) {
  const normalizedUsername = String(username || '').trim();
  const emailHandle = normalizedUsername.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'guest';

  return {
    user_id: getNextMockUserId(),
    username: normalizedUsername,
    email: `${emailHandle}@example.com`,
    password: null,
    created_at: new Date().toISOString(),
  };
}

function toSafeUser(user) {
  const { password: _p, ...safe } = user;
  return safe;
}

function getNextId(records, idField) {
  return records.reduce((maxId, record) => Math.max(maxId, record[idField]), 0) + 1;
}

function titleCase(value) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return 'New';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function createStarterArchive(draftDb, user) {
  const baseName = titleCase(user.username);
  const now = new Date().toISOString();
  let nextUserId = getNextId(draftDb.users, 'user_id');
  let nextFamilyId = getNextId(draftDb.families, 'family_id');
  let nextMembershipId = getNextId(draftDb.family_memberships, 'membership_id');
  let nextItemId = getNextId(draftDb.items, 'item_id');
  let nextItemFamilyId = getNextId(draftDb.item_families, 'item_family_id');
  let nextEventId = getNextId(draftDb.item_events, 'item_event_id');

  const relativeUsers = [
    {
      user_id: nextUserId++,
      username: `${user.username}-relative-1`,
      email: `${user.username}.relative1@example.com`,
      password: null,
      created_at: now,
    },
    {
      user_id: nextUserId++,
      username: `${user.username}-relative-2`,
      email: `${user.username}.relative2@example.com`,
      password: null,
      created_at: now,
    },
  ];

  const personalFamily = {
    family_id: nextFamilyId++,
    name: `${baseName} Household`,
    description: `A close family archive for ${baseName}'s immediate household and the stories they are actively preserving.`,
    created_by_user_id: user.user_id,
    photo_url: familyImage,
    photo_name: 'family.png',
    created_at: now,
  };
  const lineageFamily = {
    family_id: nextFamilyId++,
    name: `${baseName} Heritage Circle`,
    description: `A broader family group for shared heirlooms, genealogy notes, and items with multiple branches of relevance.`,
    created_by_user_id: user.user_id,
    photo_url: familyImage,
    photo_name: 'family.png',
    created_at: now,
  };
  const cousinsFamily = {
    family_id: nextFamilyId++,
    name: `${baseName} Cousins Table`,
    description: `A smaller family circle for cousin stories, recurring gatherings, and objects that are still passed around in living memory.`,
    created_by_user_id: relativeUsers[1].user_id,
    photo_url: familyImage,
    photo_name: 'family.png',
    created_at: now,
  };

  const membershipRecords = [
    {
      membership_id: nextMembershipId++,
      family_id: personalFamily.family_id,
      user_id: user.user_id,
      role: 'admin',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: lineageFamily.family_id,
      user_id: user.user_id,
      role: 'admin',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: personalFamily.family_id,
      user_id: relativeUsers[0].user_id,
      role: 'member',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: lineageFamily.family_id,
      user_id: relativeUsers[0].user_id,
      role: 'member',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: lineageFamily.family_id,
      user_id: relativeUsers[1].user_id,
      role: 'member',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: cousinsFamily.family_id,
      user_id: relativeUsers[1].user_id,
      role: 'admin',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: cousinsFamily.family_id,
      user_id: user.user_id,
      role: 'member',
      created_at: now,
    },
    {
      membership_id: nextMembershipId++,
      family_id: cousinsFamily.family_id,
      user_id: relativeUsers[0].user_id,
      role: 'member',
      created_at: now,
    },
  ];

  const items = [
    {
      item_id: nextItemId++,
      owner_user_id: user.user_id,
      created_by_user_id: user.user_id,
      title: `${baseName} Recipe Journal`,
      type: 'Paper Goods',
      description: `A private notebook of handwritten recipes and margin notes that ${baseName} wants to preserve before the context fades.`,
      year_made: '1978',
      date_received: '2011-05-15',
      photo_url: journalImage,
      photo_name: 'journal.png',
      created_at: now,
    },
    {
      item_id: nextItemId++,
      owner_user_id: user.user_id,
      created_by_user_id: user.user_id,
      title: `${baseName} Wedding Toast Glasses`,
      type: 'Glassware',
      description: `A pair of glasses tied to a major family milestone, shared with the household archive and updated with story notes over time.`,
      year_made: '2009',
      date_received: '2009-09-12',
      photo_url: toastGlassesImage,
      photo_name: 'toastglasses.png',
      created_at: now,
    },
    {
      item_id: nextItemId++,
      owner_user_id: relativeUsers[0].user_id,
      created_by_user_id: relativeUsers[0].user_id,
      title: `${baseName} Family Trunk`,
      type: 'Storage',
      description: `A shared heirloom trunk holding letters, loose photographs, and objects that matter across more than one family branch.`,
      year_made: '1936',
      date_received: '1998-11-20',
      photo_url: trunkImage,
      photo_name: 'trunk.png',
      created_at: now,
    },
    {
      item_id: nextItemId++,
      owner_user_id: relativeUsers[1].user_id,
      created_by_user_id: relativeUsers[1].user_id,
      title: `${baseName} Photo Album`,
      type: 'Paper Goods',
      description: `A labeled album used to compare names, dates, and faces across the household and heritage branches.`,
      year_made: '1964',
      date_received: '2014-07-09',
      photo_url: journalImage,
      photo_name: 'journal.png',
      created_at: now,
    },
    {
      item_id: nextItemId++,
      owner_user_id: relativeUsers[1].user_id,
      created_by_user_id: relativeUsers[1].user_id,
      title: `${baseName} Keepsake Brooch`,
      type: 'Jewelry',
      description: `A brooch with notes about who wore it at milestone events, now tracked through the cousins table group.`,
      year_made: '1928',
      date_received: '2019-10-03',
      photo_url: trunkImage,
      photo_name: 'trunk.png',
      created_at: now,
    },
  ];

  const itemFamilies = [
    {
      item_family_id: nextItemFamilyId++,
      item_id: items[1].item_id,
      family_id: personalFamily.family_id,
      created_at: now,
    },
    {
      item_family_id: nextItemFamilyId++,
      item_id: items[2].item_id,
      family_id: personalFamily.family_id,
      created_at: now,
    },
    {
      item_family_id: nextItemFamilyId++,
      item_id: items[2].item_id,
      family_id: lineageFamily.family_id,
      created_at: now,
    },
    {
      item_family_id: nextItemFamilyId++,
      item_id: items[3].item_id,
      family_id: lineageFamily.family_id,
      created_at: now,
    },
    {
      item_family_id: nextItemFamilyId++,
      item_id: items[3].item_id,
      family_id: cousinsFamily.family_id,
      created_at: now,
    },
    {
      item_family_id: nextItemFamilyId++,
      item_id: items[4].item_id,
      family_id: cousinsFamily.family_id,
      created_at: now,
    },
  ];

  const events = [
    {
      item_event_id: nextEventId++,
      item_id: items[0].item_id,
      title: 'Transcribed family notes',
      description: `Added context about where the journal came from and which recipes people still talk about at family gatherings.`,
      occurred_on: '2026-02-04',
      photo_url: event7Image,
      photo_name: 'event7.png',
      created_by_user_id: user.user_id,
      created_at: now,
    },
    {
      item_event_id: nextEventId++,
      item_id: items[1].item_id,
      title: 'Shared to household archive',
      description: `Opened the item to the household family group so the story could be maintained collectively.`,
      occurred_on: '2026-02-18',
      photo_url: event8Image,
      photo_name: 'event8.png',
      created_by_user_id: user.user_id,
      created_at: now,
    },
    {
      item_event_id: nextEventId++,
      item_id: items[2].item_id,
      title: 'Lineage research added',
      description: `Connected the trunk to multiple branches after realizing several people had inherited stories about it.`,
      occurred_on: '2026-03-01',
      photo_url: event9Image,
      photo_name: 'event9.png',
      created_by_user_id: relativeUsers[0].user_id,
      created_at: now,
    },
    {
      item_event_id: nextEventId++,
      item_id: items[3].item_id,
      title: 'Album names reconciled',
      description: `Compared handwritten captions and updated the people identified in older reunion photos.`,
      occurred_on: '2026-03-08',
      photo_url: event10Image,
      photo_name: 'event10.png',
      created_by_user_id: relativeUsers[1].user_id,
      created_at: now,
    },
    {
      item_event_id: nextEventId++,
      item_id: items[4].item_id,
      title: 'Brooch note shared with cousins',
      description: `Added the latest memory about who last wore the brooch and why it remains meaningful.`,
      occurred_on: '2026-03-16',
      photo_url: event11Image,
      photo_name: 'event11.png',
      created_by_user_id: relativeUsers[1].user_id,
      created_at: now,
    },
  ];

  draftDb.users.push(...relativeUsers);
  draftDb.families.push(personalFamily, lineageFamily, cousinsFamily);
  draftDb.family_memberships.push(...membershipRecords);
  draftDb.items.push(...items);
  draftDb.item_families.push(...itemFamilies);
  draftDb.item_events.push(...events);
}

function ensureUserRecord(username) {
  const db = getMockDb();
  const existingUser = userQueries.findUserByUsername(db, username);

  if (existingUser) {
    return existingUser;
  }

  const nextUser = buildUserRecord(username);
  updateMockDb((draftDb) => {
    userQueries.createUserRecord(draftDb, nextUser);
    createStarterArchive(draftDb, nextUser);
  });

  return nextUser;
}

export async function mockLogin({ username }) {
  await delay();
  const normalizedUsername = String(username || '').trim();

  if (!normalizedUsername) {
    return { ok: false, status: 400, body: { error: 'Username is required' } };
  }

  const user = ensureUserRecord(normalizedUsername);
  const safeUser = toSafeUser(user);

  activeUser = safeUser;
  return {
    ok: true,
    status: 200,
    body: { user: safeUser, isProfileComplete: true },
  };
}

export async function mockMe() {
  await delay(40);
  if (!activeUser) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Not authenticated' },
    };
  }
  return {
    ok: true,
    status: 200,
    body: { user: activeUser, isProfileComplete: true },
  };
}

export async function mockLogout() {
  await delay(30);
  activeUser = null;
  return { ok: true, status: 200, body: {} };
}

export function getActiveUser() {
  return activeUser;
}
