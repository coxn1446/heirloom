export function findEventById(db, itemEventId) {
  return db.item_events.find((event) => event.item_event_id === Number(itemEventId)) || null;
}

export function listEventsByItemId(db, itemId) {
  return db.item_events.filter((event) => event.item_id === Number(itemId));
}

export function createItemEventRecord(db, eventRecord) {
  db.item_events.push(eventRecord);
  return eventRecord;
}

export function updateItemEventRecord(db, itemEventId, updates) {
  const event = findEventById(db, itemEventId);

  if (!event) {
    return null;
  }

  Object.assign(event, updates);
  return event;
}
