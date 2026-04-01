export function findItemById(db, itemId) {
  return db.items.find((item) => item.item_id === Number(itemId)) || null;
}

export function listItems(db) {
  return [...db.items];
}

export function listItemsByOwnerId(db, userId) {
  return db.items.filter((item) => item.owner_user_id === Number(userId));
}

export function listItemFamilyLinksByItemId(db, itemId) {
  return db.item_families.filter((link) => link.item_id === Number(itemId));
}

export function listFamilyIdsByItemId(db, itemId) {
  return listItemFamilyLinksByItemId(db, itemId).map((link) => link.family_id);
}

export function createItemRecord(db, itemRecord) {
  db.items.push(itemRecord);
  return itemRecord;
}

export function updateItemRecord(db, itemId, updates) {
  const item = findItemById(db, itemId);

  if (!item) {
    return null;
  }

  Object.assign(item, updates);
  return item;
}

export function replaceItemFamilyLinks(db, itemId, familyIds, makeItemFamilyId) {
  db.item_families = db.item_families.filter((link) => link.item_id !== Number(itemId));
  let nextItemFamilyId = makeItemFamilyId();

  const nextLinks = familyIds.map((familyId) => ({
    item_family_id: nextItemFamilyId++,
    item_id: Number(itemId),
    family_id: Number(familyId),
    created_at: new Date().toISOString(),
  }));

  db.item_families.push(...nextLinks);
  return nextLinks;
}
