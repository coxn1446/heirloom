import * as familyService from '../services/familyService';

export async function getMyFamilies() {
  return familyService.listMyFamilies();
}

export async function postFamily(body) {
  return familyService.createFamily(body);
}

export async function putFamily(body) {
  return familyService.updateFamily(body);
}

export async function putFamilyPhoto(body) {
  return familyService.updateFamilyPhoto(body);
}

export async function postFamilyMember(body) {
  return familyService.addFamilyMember(body);
}
