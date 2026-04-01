import * as itemService from '../services/itemService';

export async function getVisibleItems() {
  return itemService.listVisibleItems();
}

export async function postItem(body) {
  return itemService.createItem(body);
}

export async function putItem(body) {
  return itemService.updateItem(body);
}

export async function putItemFamilies(body) {
  return itemService.updateItemFamilies(body);
}

export async function putItemPhoto(body) {
  return itemService.updateItemPhoto(body);
}
