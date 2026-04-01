import { getMockDb, getNextMockItemEventId, updateMockDb } from '../db';
import * as eventQueries from '../queries/eventQueries';
import * as itemQueries from '../queries/itemQueries';
import * as userQueries from '../queries/userQueries';
import { getActiveUser } from './authService';
import { userCanViewItemForTests } from './itemService';

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

function normalizeNewOwnerUserId(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function validateNewOwner(db, newOwnerUserId) {
  if (!newOwnerUserId) {
    return null;
  }

  return userQueries.findUserById(db, newOwnerUserId) ? null : 'New owner not found';
}

function deriveOwnerUserIdFromHistory(db, itemId) {
  const item = itemQueries.findItemById(db, itemId);

  if (!item) {
    return null;
  }

  return eventQueries
    .listEventsByItemId(db, itemId)
    .slice()
    .sort((left, right) => {
      const dateComparison = String(left.occurred_on).localeCompare(String(right.occurred_on));

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return left.item_event_id - right.item_event_id;
    })
    .reduce(
      (ownerUserId, event) => (event.new_owner_user_id ? event.new_owner_user_id : ownerUserId),
      item.created_by_user_id || item.owner_user_id
    );
}

function syncItemOwnerFromTimeline(db, itemId) {
  const item = itemQueries.findItemById(db, itemId);

  if (!item) {
    return;
  }

  const derivedOwnerUserId = deriveOwnerUserIdFromHistory(db, itemId);

  if (derivedOwnerUserId) {
    item.owner_user_id = derivedOwnerUserId;
  }
}

export async function createItemEvent({ itemId, title, description, occurredOn, newOwnerUserId = null, imageFile = null }) {
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

  if (!userCanViewItemForTests(db, currentUser.user_id, item.item_id)) {
    return { ok: false, status: 403, body: { error: 'You do not have access to this item' } };
  }

  if (item.owner_user_id !== currentUser.user_id) {
    return { ok: false, status: 403, body: { error: 'Only the item owner can create events' } };
  }

  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) {
    return { ok: false, status: 400, body: { error: 'Event title is required' } };
  }

  const normalizedNewOwnerUserId = normalizeNewOwnerUserId(newOwnerUserId);
  const newOwnerValidationError = validateNewOwner(db, normalizedNewOwnerUserId);

  if (newOwnerValidationError) {
    return { ok: false, status: 400, body: { error: newOwnerValidationError } };
  }

  const photoFields = buildPhotoFields(imageFile);

  const eventRecord = {
    item_event_id: getNextMockItemEventId(),
    item_id: item.item_id,
    title: trimmedTitle,
    description: String(description || '').trim(),
    occurred_on: String(occurredOn || '').trim() || new Date().toISOString().slice(0, 10),
    photo_url: photoFields.photo_url,
    photo_name: photoFields.photo_name,
    created_by_user_id: currentUser.user_id,
    new_owner_user_id: normalizedNewOwnerUserId,
    created_at: new Date().toISOString(),
  };

  updateMockDb((draftDb) => {
    eventQueries.createItemEventRecord(draftDb, eventRecord);
    syncItemOwnerFromTimeline(draftDb, item.item_id);
  });

  const nextDb = getMockDb();
  const nextEvent = eventQueries.findEventById(nextDb, eventRecord.item_event_id);

  return {
    ok: true,
    status: 201,
    body: { event: nextEvent },
  };
}

export async function updateItemEvent({ itemEventId, itemId, title, description, occurredOn, newOwnerUserId = null, imageFile = null }) {
  await delay();
  const currentUser = getActiveUser();

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const db = getMockDb();
  const event = eventQueries.findEventById(db, itemEventId);

  if (!event) {
    return { ok: false, status: 404, body: { error: 'Event not found' } };
  }

  if (event.created_by_user_id !== currentUser.user_id) {
    return { ok: false, status: 403, body: { error: 'Only the event creator can edit it' } };
  }

  const nextItem = itemQueries.findItemById(db, itemId);

  if (!nextItem) {
    return { ok: false, status: 404, body: { error: 'Item not found' } };
  }

  if (!userCanViewItemForTests(db, currentUser.user_id, nextItem.item_id)) {
    return { ok: false, status: 403, body: { error: 'You do not have access to this item' } };
  }

  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) {
    return { ok: false, status: 400, body: { error: 'Event title is required' } };
  }

  const normalizedNewOwnerUserId = normalizeNewOwnerUserId(newOwnerUserId);
  const newOwnerValidationError = validateNewOwner(db, normalizedNewOwnerUserId);

  if (newOwnerValidationError) {
    return { ok: false, status: 400, body: { error: newOwnerValidationError } };
  }

  const photoFields = buildPhotoFields(imageFile);
  const previousItemId = event.item_id;

  updateMockDb((draftDb) => {
    eventQueries.updateItemEventRecord(draftDb, event.item_event_id, {
      item_id: nextItem.item_id,
      title: trimmedTitle,
      description: String(description || '').trim(),
      occurred_on: String(occurredOn || '').trim() || new Date().toISOString().slice(0, 10),
      new_owner_user_id: normalizedNewOwnerUserId,
      photo_url: photoFields.photo_url,
      photo_name: photoFields.photo_name,
    });
    syncItemOwnerFromTimeline(draftDb, previousItemId);
    syncItemOwnerFromTimeline(draftDb, nextItem.item_id);
  });

  const nextDb = getMockDb();
  const nextEvent = eventQueries.findEventById(nextDb, event.item_event_id);

  return {
    ok: true,
    status: 200,
    body: { event: nextEvent },
  };
}
