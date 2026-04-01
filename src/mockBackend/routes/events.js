import * as eventService from '../services/eventService';

export async function postItemEvent(body) {
  return eventService.createItemEvent(body);
}

export async function putItemEvent(body) {
  return eventService.updateItemEvent(body);
}
