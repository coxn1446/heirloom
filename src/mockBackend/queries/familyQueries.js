export function findFamilyById(db, familyId) {
  return db.families.find((family) => family.family_id === Number(familyId)) || null;
}

export function listFamilies(db) {
  return [...db.families];
}

export function listMembershipsByUserId(db, userId) {
  return db.family_memberships.filter((membership) => membership.user_id === Number(userId));
}

export function listMembershipsByFamilyId(db, familyId) {
  return db.family_memberships.filter((membership) => membership.family_id === Number(familyId));
}

export function findMembership(db, userId, familyId) {
  return (
    db.family_memberships.find(
      (membership) => membership.user_id === Number(userId) && membership.family_id === Number(familyId)
    ) || null
  );
}

export function listFamiliesByUserId(db, userId) {
  const membershipFamilyIds = new Set(listMembershipsByUserId(db, userId).map((membership) => membership.family_id));
  return db.families.filter((family) => membershipFamilyIds.has(family.family_id));
}

export function createFamilyRecord(db, familyRecord) {
  db.families.push(familyRecord);
  return familyRecord;
}

export function updateFamilyRecord(db, familyId, updates) {
  const family = findFamilyById(db, familyId);

  if (!family) {
    return null;
  }

  Object.assign(family, updates);
  return family;
}

export function createMembershipRecord(db, membershipRecord) {
  db.family_memberships.push(membershipRecord);
  return membershipRecord;
}
