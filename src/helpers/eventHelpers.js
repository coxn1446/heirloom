import * as eventRoutes from '../mockBackend/routes/events';

export async function addItemEvent(payload) {
  return eventRoutes.postItemEvent(payload);
}

export async function updateItemEvent(payload) {
  return eventRoutes.putItemEvent(payload);
}
