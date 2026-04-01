import * as itemRoutes from '../mockBackend/routes/items';

export async function fetchVisibleItems() {
  return itemRoutes.getVisibleItems();
}

export async function createItem(payload) {
  return itemRoutes.postItem(payload);
}

export async function updateItem(payload) {
  return itemRoutes.putItem(payload);
}

export async function updateItemFamilies(payload) {
  return itemRoutes.putItemFamilies(payload);
}

export async function updateItemPhoto(payload) {
  return itemRoutes.putItemPhoto(payload);
}
