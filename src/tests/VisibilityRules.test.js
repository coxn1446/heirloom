import { resetMockDb } from '../mockBackend/db';
import { addItemEvent } from '../helpers/eventHelpers';
import { addFamilyMember, createFamily } from '../helpers/familyHelpers';
import { loginWithUsername, logout } from '../helpers/authHelpers';
import { createItem, fetchVisibleItems, updateItemFamilies } from '../helpers/itemHelpers';

describe('Heirloom visibility rules', () => {
  beforeEach(async () => {
    resetMockDb();
    await logout();
  });

  test('seeded items are filtered by owner and family membership', async () => {
    await loginWithUsername('demo');
    let response = await fetchVisibleItems();
    expect(response.ok).toBe(true);
    let titles = response.body.items.map((item) => item.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        'Recipe Journal',
        'Wedding Toast Glasses',
        'Annotated Photo Album',
        'Porcelain Serving Bowl',
        'Keepsake Brooch',
      ])
    );
    expect(titles).not.toContain('Family Trunk');

    const recipeJournal = response.body.items.find((item) => item.title === 'Recipe Journal');
    const weddingToastGlasses = response.body.items.find((item) => item.title === 'Wedding Toast Glasses');
    expect(recipeJournal?.photo_name).toBe('journal.png');
    expect(recipeJournal?.photo_url).toBeTruthy();
    expect(weddingToastGlasses?.photo_name).toBe('toastglasses.png');
    expect(weddingToastGlasses?.photo_url).toBeTruthy();
    expect(recipeJournal?.events[0].photo_name).toBe('journal.png');

    await logout();
    await loginWithUsername('natalie');
    response = await fetchVisibleItems();
    titles = response.body.items.map((item) => item.title);
    expect(titles).toEqual(expect.arrayContaining(['Family Trunk', 'Annotated Photo Album', 'Keepsake Brooch']));
    const familyTrunk = response.body.items.find((item) => item.title === 'Family Trunk');
    expect(familyTrunk?.photo_name).toBe('trunk.png');
    expect(familyTrunk?.photo_url).toBeTruthy();

    await logout();
    await loginWithUsername('willa');
    response = await fetchVisibleItems();
    titles = response.body.items.map((item) => item.title);
    expect(titles).toContain('Wedding Toast Glasses');
    expect(titles).not.toContain('Recipe Journal');
  });

  test('a brand-new username receives a pre-populated starter archive', async () => {
    await loginWithUsername('avery');

    const response = await fetchVisibleItems();

    expect(response.ok).toBe(true);
    expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    expect(response.body.items.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        'Avery Recipe Journal',
        'Avery Wedding Toast Glasses',
        'Avery Family Trunk',
        'Avery Photo Album',
        'Avery Keepsake Brooch',
      ])
    );
    expect(response.body.items.map((item) => item.photo_name)).toEqual(
      expect.arrayContaining(['journal.png', 'toastglasses.png', 'trunk.png'])
    );
    expect(response.body.items.every((item) => Boolean(item.photo_url))).toBe(true);
    expect(response.body.items.some((item) => item.events.some((event) => Boolean(event.photo_url)))).toBe(true);
  });

  test('private items become visible to family members once shared, and events follow item visibility', async () => {
    await loginWithUsername('william');

    const familyResponse = await createFamily({
      name: 'William Archive',
      description: 'A private branch for testing shared visibility.',
    });
    const familyId = familyResponse.body.family.family_id;

    const itemResponse = await createItem({
      title: 'Pocket Watch',
      type: 'Jewelry',
      description: 'A watch kept private until the family is ready to see it.',
      yearMade: '1938',
      dateReceived: '2026-03-30',
      familyIds: [],
    });
    const itemId = itemResponse.body.item.item_id;

    let visibleItems = await fetchVisibleItems();
    let pocketWatch = visibleItems.body.items.find((item) => item.item_id === itemId);
    expect(pocketWatch).toBeTruthy();
    expect(pocketWatch.is_private).toBe(true);

    const addMemberResponse = await addFamilyMember({
      familyId,
      username: 'demo',
    });
    expect(addMemberResponse.ok).toBe(true);

    const retagResponse = await updateItemFamilies({
      itemId,
      familyIds: [familyId],
    });
    expect(retagResponse.ok).toBe(true);
    expect(retagResponse.body.item.is_private).toBe(false);

    const eventResponse = await addItemEvent({
      itemId,
      title: 'Shared with William Archive',
      description: 'The watch is now visible to the tagged family.',
      occurredOn: '2026-03-30',
    });
    expect(eventResponse.ok).toBe(true);

    await logout();
    await loginWithUsername('demo');

    visibleItems = await fetchVisibleItems();
    pocketWatch = visibleItems.body.items.find((item) => item.item_id === itemId);

    expect(pocketWatch).toBeTruthy();
    expect(pocketWatch.visible_families.map((family) => family.family_id)).toContain(familyId);
    expect(pocketWatch.events.some((event) => event.title === 'Shared with William Archive')).toBe(true);
  });
});
