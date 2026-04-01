import * as familyRoutes from '../mockBackend/routes/families';

export async function fetchMyFamilies() {
  return familyRoutes.getMyFamilies();
}

export async function createFamily(payload) {
  return familyRoutes.postFamily(payload);
}

export async function updateFamily(payload) {
  return familyRoutes.putFamily(payload);
}

export async function updateFamilyPhoto(payload) {
  return familyRoutes.putFamilyPhoto(payload);
}

export async function addFamilyMember(payload) {
  return familyRoutes.postFamilyMember(payload);
}
