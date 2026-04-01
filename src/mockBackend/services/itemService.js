import { getMockDb, getNextMockItemEventId, getNextMockItemFamilyId, getNextMockItemId, updateMockDb } from '../db';
import * as eventQueries from '../queries/eventQueries';
import * as familyQueries from '../queries/familyQueries';
import * as itemQueries from '../queries/itemQueries';
import * as userQueries from '../queries/userQueries';
import { getActiveUser } from './authService';

function delay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unauthorizedResponse() {
  return { ok: false, status: 401, body: { error: 'Not authenticated' } };
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

function listCurrentUserFamilyIds(db, userId) {
  return familyQueries.listMembershipsByUserId(db, userId).map((membership) => membership.family_id);
}

function canUserViewItem(db, userId, item) {
  if (!item) {
    return false;
  }

  if (item.owner_user_id === Number(userId)) {
    return true;
  }

  const memberFamilyIds = new Set(listCurrentUserFamilyIds(db, userId));
  const itemFamilyIds = itemQueries.listFamilyIdsByItemId(db, item.item_id);

  return itemFamilyIds.some((familyId) => memberFamilyIds.has(familyId));
}

function listTransferCandidates(db) {
  return userQueries
    .listUsers(db)
    .map((user) => ({
      user_id: user.user_id,
      username: user.username,
    }))
    .sort((left, right) => String(left.username).localeCompare(String(right.username)));
}

function enrichItem(db, item, currentUserId) {
  const owner = userQueries.findUserById(db, item.owner_user_id);
  const familyIds = itemQueries.listFamilyIdsByItemId(db, item.item_id);
  const visibleFamilies = familyIds
    .map((familyId) => familyQueries.findFamilyById(db, familyId))
    .filter(Boolean)
    .map((family) => ({
      family_id: family.family_id,
      name: family.name,
    }));
  const events = eventQueries
    .listEventsByItemId(db, item.item_id)
    .map((event) => {
      const creator = userQueries.findUserById(db, event.created_by_user_id);

      return {
        ...event,
        created_by_username: creator?.username || 'Unknown',
        new_owner_username: userQueries.findUserById(db, event.new_owner_user_id)?.username || '',
        can_edit: event.created_by_user_id === Number(currentUserId),
      };
    })
    .slice()
    .sort((left, right) => String(right.occurred_on).localeCompare(String(left.occurred_on)));

  return {
    ...item,
    owner_username: owner?.username || 'Unknown',
    visible_families: visibleFamilies,
    transfer_candidates: listTransferCandidates(db),
    is_private: visibleFamilies.length === 0,
    can_edit: item.owner_user_id === Number(currentUserId),
    events,
  };
}

export function userCanViewItemForTests(db, userId, itemId) {
  return canUserViewItem(db, userId, itemQueries.findItemById(db, itemId));
}

export async function listVisibleItems() {
  await delay();
  const currentUser = getActiveUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const items = itemQueries
    .listItems(db)
    .filter((item) => canUserViewItem(db, currentUser.user_id, item))
    .map((item) => enrichItem(db, item, currentUser.user_id))
    .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)));

  return { ok: true, status: 200, body: { items } };
}

export async function createItem({ title, type, description, yearMade, dateReceived, familyIds = [], imageFile = null }) {
  await delay();
  const currentUser = getActiveUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) {
    return { ok: false, status: 400, body: { error: 'Item name is required' } };
  }

  const db = getMockDb();
  const memberFamilyIds = new Set(listCurrentUserFamilyIds(db, currentUser.user_id));
  const safeFamilyIds = [...new Set(familyIds.map(Number))].filter((familyId) => memberFamilyIds.has(familyId));
  const photoFields = buildPhotoFields(imageFile);
  const createdAt = new Date().toISOString();
  const createdOn = createdAt.slice(0, 10);
  const itemRecord = {
    item_id: getNextMockItemId(),
    owner_user_id: currentUser.user_id,
    created_by_user_id: currentUser.user_id,
    title: trimmedTitle,
    type: String(type || '').trim(),
    description: String(description || '').trim(),
    year_made: String(yearMade || '').trim(),
    date_received: String(dateReceived || '').trim(),
    photo_url: photoFields.photo_url,
    photo_name: photoFields.photo_name,
    created_at: createdAt,
  };
  const initialEventRecord = {
    item_event_id: getNextMockItemEventId(),
    item_id: itemRecord.item_id,
    title: 'Received item',
    description: '',
    occurred_on: createdOn,
    photo_url: photoFields.photo_url,
    photo_name: photoFields.photo_name,
    created_by_user_id: currentUser.user_id,
    created_at: createdAt,
  };

  updateMockDb((draftDb) => {
    itemQueries.createItemRecord(draftDb, itemRecord);
    itemQueries.replaceItemFamilyLinks(draftDb, itemRecord.item_id, safeFamilyIds, getNextMockItemFamilyId);
    eventQueries.createItemEventRecord(draftDb, initialEventRecord);
  });

  const nextDb = getMockDb();

  return {
    ok: true,
    status: 201,
    body: {
      item: enrichItem(nextDb, itemRecord, currentUser.user_id),
    },
  };
}

export async function updateItem({ itemId, title, type, description, yearMade, dateReceived }) {
  await delay();
  const currentUser = getActiveUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const item = itemQueries.findItemById(db, itemId);

  if (!item) {
    return { ok: false, status: 404, body: { error: 'Item not found' } };
  }

  if (item.owner_user_id !== currentUser.user_id) {
    return { ok: false, status: 403, body: { error: 'Only the owner can edit this item' } };
  }

  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) {
    return { ok: false, status: 400, body: { error: 'Item name is required' } };
  }

  updateMockDb((draftDb) => {
    itemQueries.updateItemRecord(draftDb, item.item_id, {
      title: trimmedTitle,
      type: String(type || '').trim(),
      description: String(description || '').trim(),
      year_made: String(yearMade || '').trim(),
      date_received: String(dateReceived || '').trim(),
    });
  });

  const nextDb = getMockDb();
  const nextItem = itemQueries.findItemById(nextDb, item.item_id);

  return {
    ok: true,
    status: 200,
    body: {
      item: enrichItem(nextDb, nextItem, currentUser.user_id),
    },
  };
}

export async function updateItemPhoto({ itemId, imageFile = null }) {
  await delay();
  const currentUser = getActiveUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const item = itemQueries.findItemById(db, itemId);

  if (!item) {
    return { ok: false, status: 404, body: { error: 'Item not found' } };
  }

  if (item.owner_user_id !== currentUser.user_id) {
    return { ok: false, status: 403, body: { error: 'Only the owner can update the item image' } };
  }

  const photoFields = buildPhotoFields(imageFile);

  updateMockDb((draftDb) => {
    const draftItem = itemQueries.findItemById(draftDb, item.item_id);
    draftItem.photo_url = photoFields.photo_url;
    draftItem.photo_name = photoFields.photo_name;
  });

  const nextDb = getMockDb();
  const nextItem = itemQueries.findItemById(nextDb, item.item_id);

  return {
    ok: true,
    status: 200,
    body: {
      item: enrichItem(nextDb, nextItem, currentUser.user_id),
    },
  };
}

export async function updateItemFamilies({ itemId, familyIds = [] }) {
  await delay();
  const currentUser = getActiveUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const item = itemQueries.findItemById(db, itemId);

  if (!item) {
    return { ok: false, status: 404, body: { error: 'Item not found' } };
  }

  if (item.owner_user_id !== currentUser.user_id) {
    return { ok: false, status: 403, body: { error: 'Only the owner can retag this item' } };
  }

  const memberFamilyIds = new Set(listCurrentUserFamilyIds(db, currentUser.user_id));
  const safeFamilyIds = [...new Set(familyIds.map(Number))].filter((familyId) => memberFamilyIds.has(familyId));

  updateMockDb((draftDb) => {
    itemQueries.replaceItemFamilyLinks(draftDb, item.item_id, safeFamilyIds, getNextMockItemFamilyId);
  });

  const nextDb = getMockDb();
  const nextItem = itemQueries.findItemById(nextDb, item.item_id);

  return {
    ok: true,
    status: 200,
    body: {
      item: enrichItem(nextDb, nextItem, currentUser.user_id),
    },
  };
}
