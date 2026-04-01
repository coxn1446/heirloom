import { getMockDb, getNextMockFamilyId, getNextMockMembershipId, getNextMockUserId, updateMockDb } from '../db';
import * as familyQueries from '../queries/familyQueries';
import * as userQueries from '../queries/userQueries';
import { getActiveUser } from './authService';

function delay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unauthorizedResponse() {
  return { ok: false, status: 401, body: { error: 'Not authenticated' } };
}

function requireCurrentUser() {
  return getActiveUser();
}

function buildPhotoFields(imageFile) {
  if (!imageFile) {
    return { photo_url: '', photo_name: '' };
  }

  const objectUrl =
    typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(imageFile) : '';

  return {
    photo_url: objectUrl,
    photo_name: imageFile.name || '',
  };
}

function isFamilyAdmin(membership) {
  return membership?.role === 'admin';
}

function buildFamilySummary(db, family, currentUserId) {
  const memberships = familyQueries.listMembershipsByFamilyId(db, family.family_id);
  const memberRecords = memberships
    .map((membership) => {
      const user = userQueries.findUserById(db, membership.user_id);

      if (!user) {
        return null;
      }

      return {
        user_id: user.user_id,
        username: user.username,
        role: membership.role,
      };
    })
    .filter(Boolean);

  const myMembership = familyQueries.findMembership(db, currentUserId, family.family_id);

  return {
    ...family,
    member_count: memberRecords.length,
    members: memberRecords,
    my_role: myMembership?.role || null,
    can_edit: isFamilyAdmin(myMembership),
    can_manage_members: isFamilyAdmin(myMembership),
  };
}

function ensureDomainUser(username) {
  const db = getMockDb();
  const existingUser = userQueries.findUserByUsername(db, username);

  if (existingUser) {
    return existingUser;
  }

  const normalizedUsername = String(username || '').trim();
  const emailHandle = normalizedUsername.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'guest';
  const newUser = {
    user_id: getNextMockUserId(),
    username: normalizedUsername,
    email: `${emailHandle}@example.com`,
    password: null,
    created_at: new Date().toISOString(),
  };

  updateMockDb((draftDb) => {
    userQueries.createUserRecord(draftDb, newUser);
  });

  return newUser;
}

export async function listMyFamilies() {
  await delay();
  const currentUser = requireCurrentUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const families = familyQueries
    .listFamiliesByUserId(db, currentUser.user_id)
    .map((family) => buildFamilySummary(db, family, currentUser.user_id))
    .sort((left, right) => left.name.localeCompare(right.name));

  return { ok: true, status: 200, body: { families } };
}

export async function createFamily({ name, description }) {
  await delay();
  const currentUser = requireCurrentUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const trimmedName = String(name || '').trim();

  if (!trimmedName) {
    return { ok: false, status: 400, body: { error: 'Family name is required' } };
  }

  const familyRecord = {
    family_id: getNextMockFamilyId(),
    name: trimmedName,
    description: String(description || '').trim(),
    created_by_user_id: currentUser.user_id,
    photo_url: '',
    photo_name: '',
    created_at: new Date().toISOString(),
  };
  const membershipRecord = {
    membership_id: getNextMockMembershipId(),
    family_id: familyRecord.family_id,
    user_id: currentUser.user_id,
    role: 'admin',
    created_at: new Date().toISOString(),
  };

  updateMockDb((draftDb) => {
    familyQueries.createFamilyRecord(draftDb, familyRecord);
    familyQueries.createMembershipRecord(draftDb, membershipRecord);
  });

  const db = getMockDb();
  return {
    ok: true,
    status: 201,
    body: {
      family: buildFamilySummary(db, familyRecord, currentUser.user_id),
    },
  };
}

export async function updateFamily({ familyId, name, description }) {
  await delay();
  const currentUser = requireCurrentUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const family = familyQueries.findFamilyById(db, familyId);

  if (!family) {
    return { ok: false, status: 404, body: { error: 'Family not found' } };
  }

  const currentMembership = familyQueries.findMembership(db, currentUser.user_id, family.family_id);
  if (!currentMembership) {
    return { ok: false, status: 403, body: { error: 'You must belong to this family to edit it' } };
  }

  if (!isFamilyAdmin(currentMembership)) {
    return { ok: false, status: 403, body: { error: 'Only family admins can edit this family' } };
  }

  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    return { ok: false, status: 400, body: { error: 'Family name is required' } };
  }

  updateMockDb((draftDb) => {
    familyQueries.updateFamilyRecord(draftDb, family.family_id, {
      name: trimmedName,
      description: String(description || '').trim(),
    });
  });

  const nextDb = getMockDb();
  const nextFamily = familyQueries.findFamilyById(nextDb, family.family_id);

  return {
    ok: true,
    status: 200,
    body: {
      family: buildFamilySummary(nextDb, nextFamily, currentUser.user_id),
    },
  };
}

export async function updateFamilyPhoto({ familyId, imageFile = null }) {
  await delay();
  const currentUser = requireCurrentUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const family = familyQueries.findFamilyById(db, familyId);

  if (!family) {
    return { ok: false, status: 404, body: { error: 'Family not found' } };
  }

  const currentMembership = familyQueries.findMembership(db, currentUser.user_id, family.family_id);
  if (!currentMembership) {
    return { ok: false, status: 403, body: { error: 'You must belong to this family to update its image' } };
  }

  if (!isFamilyAdmin(currentMembership)) {
    return { ok: false, status: 403, body: { error: 'Only family admins can update the family image' } };
  }

  const photoFields = buildPhotoFields(imageFile);

  updateMockDb((draftDb) => {
    familyQueries.updateFamilyRecord(draftDb, family.family_id, {
      photo_url: photoFields.photo_url,
      photo_name: photoFields.photo_name,
    });
  });

  const nextDb = getMockDb();
  const nextFamily = familyQueries.findFamilyById(nextDb, family.family_id);

  return {
    ok: true,
    status: 200,
    body: {
      family: buildFamilySummary(nextDb, nextFamily, currentUser.user_id),
    },
  };
}

export async function addFamilyMember({ familyId, username }) {
  await delay();
  const currentUser = requireCurrentUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const family = familyQueries.findFamilyById(db, familyId);

  if (!family) {
    return { ok: false, status: 404, body: { error: 'Family not found' } };
  }

  const currentMembership = familyQueries.findMembership(db, currentUser.user_id, family.family_id);
  if (!currentMembership) {
    return { ok: false, status: 403, body: { error: 'You must belong to this family to add members' } };
  }

  if (!isFamilyAdmin(currentMembership)) {
    return { ok: false, status: 403, body: { error: 'Only family admins can add members' } };
  }

  const trimmedUsername = String(username || '').trim();
  if (!trimmedUsername) {
    return { ok: false, status: 400, body: { error: 'Username is required' } };
  }

  const user = ensureDomainUser(trimmedUsername);
  const existingMembership = familyQueries.findMembership(getMockDb(), user.user_id, family.family_id);

  if (existingMembership) {
    return { ok: false, status: 409, body: { error: 'That user already belongs to this family' } };
  }

  const membershipRecord = {
    membership_id: getNextMockMembershipId(),
    family_id: family.family_id,
    user_id: user.user_id,
    role: 'member',
    created_at: new Date().toISOString(),
  };

  updateMockDb((draftDb) => {
    familyQueries.createMembershipRecord(draftDb, membershipRecord);
  });

  const nextDb = getMockDb();

  return {
    ok: true,
    status: 201,
    body: {
      family: buildFamilySummary(nextDb, family, currentUser.user_id),
    },
  };
}
