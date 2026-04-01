import { resetMockDb } from '../mockBackend/db';
import { addItemEvent, updateItemEvent } from '../helpers/eventHelpers';
import { addFamilyMember, createFamily, fetchMyFamilies, updateFamily, updateFamilyPhoto } from '../helpers/familyHelpers';
import { loginWithUsername, logout } from '../helpers/authHelpers';
import { createItem, fetchVisibleItems, updateItem, updateItemFamilies, updateItemPhoto } from '../helpers/itemHelpers';

describe('record editing flows', () => {
  beforeEach(async () => {
    resetMockDb();
    await logout();
  });

  test('updates family, item, and event records through the documented helper chain', async () => {
    await loginWithUsername('william');

    const familyResponse = await createFamily({
      name: 'William Branch',
      description: '',
    });
    const familyId = familyResponse.body.family.family_id;

    const updatedFamilyResponse = await updateFamily({
      familyId,
      name: 'William Branch Archive',
      description: 'Shared records for the cousins and siblings in this branch.',
    });

    expect(updatedFamilyResponse.ok).toBe(true);

    const updatedFamilyPhotoResponse = await updateFamilyPhoto({
      familyId,
      imageFile: new File(['family-photo'], 'branch-family.png', { type: 'image/png' }),
    });

    expect(updatedFamilyPhotoResponse.ok).toBe(true);

    const itemResponse = await createItem({
      title: 'Brass Lamp',
      type: '',
      description: '',
      yearMade: '',
      dateReceived: '',
      familyIds: [],
    });
    const itemId = itemResponse.body.item.item_id;

    expect(itemResponse.body.item.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Received item',
        }),
      ])
    );

    const updatedItemResponse = await updateItem({
      itemId,
      title: 'Brass Reading Lamp',
      type: 'Lighting',
      description: 'A restored lamp that now sits in the archive room.',
      yearMade: '1948',
      dateReceived: '2026-03-30',
    });

    expect(updatedItemResponse.ok).toBe(true);

    const updatedFamiliesResponse = await updateItemFamilies({
      itemId,
      familyIds: [familyId],
    });

    expect(updatedFamiliesResponse.ok).toBe(true);

    const updatedPhotoResponse = await updateItemPhoto({
      itemId,
      imageFile: new File(['lamp'], 'lamp.png', { type: 'image/png' }),
    });

    expect(updatedPhotoResponse.ok).toBe(true);

    const eventResponse = await addItemEvent({
      itemId,
      title: 'Lamp restored',
      description: '',
      occurredOn: '2026-03-30',
      newOwnerUserId: 2,
      imageFile: new File(['event-photo'], 'lamp-event.png', { type: 'image/png' }),
    });
    const itemEventId = eventResponse.body.event.item_event_id;

    const updatedEventResponse = await updateItemEvent({
      itemEventId,
      itemId,
      title: 'Lamp restored and cataloged',
      description: 'Added the repair details and current location.',
      occurredOn: '2026-03-31',
      newOwnerUserId: 3,
      imageFile: new File(['updated-event-photo'], 'lamp-event-updated.png', { type: 'image/png' }),
    });

    expect(updatedEventResponse.ok).toBe(true);

    const familiesResponse = await fetchMyFamilies();
    const savedFamily = familiesResponse.body.families.find((family) => family.family_id === familyId);
    expect(savedFamily.name).toBe('William Branch Archive');
    expect(savedFamily.description).toMatch(/cousins and siblings/i);
    expect(savedFamily.photo_name).toBe('branch-family.png');

    const itemsResponse = await fetchVisibleItems();
    const savedItem = itemsResponse.body.items.find((item) => item.item_id === itemId);
    expect(savedItem.title).toBe('Brass Reading Lamp');
    expect(savedItem.type).toBe('Lighting');
    expect(savedItem.visible_families.map((family) => family.family_id)).toContain(familyId);
    expect(savedItem.photo_name).toBe('lamp.png');
    const restoredEvent = savedItem.events.find((event) => event.title === 'Lamp restored and cataloged');
    expect(restoredEvent).toBeTruthy();
    expect(restoredEvent.description).toMatch(/repair details/i);
    expect(restoredEvent.photo_name).toBe('lamp-event-updated.png');
    expect(restoredEvent.new_owner_user_id).toBe(3);
    expect(restoredEvent.new_owner_username).toBe('natalie');
    expect(savedItem.owner_user_id).toBe(3);
    expect(savedItem.owner_username).toBe('natalie');
  });

  test('creates an initial Received item event and orders the timeline by occurred_on', async () => {
    await loginWithUsername('william');

    const itemResponse = await createItem({
      title: 'Recipe Box',
      type: '',
      description: '',
      yearMade: '',
      dateReceived: '',
      familyIds: [],
    });
    const itemId = itemResponse.body.item.item_id;

    expect(itemResponse.body.item.events).toHaveLength(1);
    expect(itemResponse.body.item.events[0].title).toBe('Received item');
    expect(itemResponse.body.item.events[0].photo_name).toBe('');

    const initialOccurredOn = itemResponse.body.item.events[0].occurred_on;
    const [year, month, day] = initialOccurredOn.split('-').map(Number);
    const initialDate = new Date(Date.UTC(year, month - 1, day));
    const olderOccurredOn = new Date(initialDate);
    olderOccurredOn.setUTCDate(initialDate.getUTCDate() - 1);
    const newerOccurredOn = new Date(initialDate);
    newerOccurredOn.setUTCDate(initialDate.getUTCDate() + 1);
    const olderDateString = olderOccurredOn.toISOString().slice(0, 10);
    const newerDateString = newerOccurredOn.toISOString().slice(0, 10);

    await addItemEvent({
      itemId,
      title: 'Box repaired',
      description: '',
      occurredOn: olderDateString,
    });

    await addItemEvent({
      itemId,
      title: 'Moved to dining room',
      description: '',
      occurredOn: newerDateString,
    });

    const itemsResponse = await fetchVisibleItems();
    const savedItem = itemsResponse.body.items.find((item) => item.item_id === itemId);

    expect(savedItem.events.map((event) => event.title)).toEqual([
      'Moved to dining room',
      'Received item',
      'Box repaired',
    ]);
    expect(savedItem.events[1].occurred_on).toBe(initialOccurredOn);
  });

  test('rejects blank required fields during record updates', async () => {
    await loginWithUsername('william');

    const familyResponse = await createFamily({
      name: 'Validation Group',
      description: '',
    });

    const itemResponse = await createItem({
      title: 'Validation Item',
      type: '',
      description: '',
      yearMade: '',
      dateReceived: '',
      familyIds: [],
    });

    const eventResponse = await addItemEvent({
      itemId: itemResponse.body.item.item_id,
      title: 'Initial event',
      description: '',
      occurredOn: '2026-03-30',
    });

    await expect(
      updateFamily({
        familyId: familyResponse.body.family.family_id,
        name: '',
        description: '',
      })
    ).resolves.toMatchObject({ ok: false, status: 400 });

    await expect(
      updateItem({
        itemId: itemResponse.body.item.item_id,
        title: '',
        type: '',
        description: '',
        yearMade: '',
        dateReceived: '',
      })
    ).resolves.toMatchObject({ ok: false, status: 400 });

    await expect(
      updateItemEvent({
        itemEventId: eventResponse.body.event.item_event_id,
        itemId: itemResponse.body.item.item_id,
        title: '',
        description: '',
        occurredOn: '',
      })
    ).resolves.toMatchObject({ ok: false, status: 400 });
  });

  test('rejects unknown new owner ids when recording ownership transfers', async () => {
    await loginWithUsername('william');

    const itemResponse = await createItem({
      title: 'Transfer Ledger',
      type: '',
      description: '',
      yearMade: '',
      dateReceived: '',
      familyIds: [],
    });

    await expect(
      addItemEvent({
        itemId: itemResponse.body.item.item_id,
        title: 'Transferred to an unknown owner',
        description: '',
        occurredOn: '2026-03-30',
        newOwnerUserId: 9999,
      })
    ).resolves.toMatchObject({ ok: false, status: 400 });
  });

  test('enforces ownership and creator rules when editing items and events', async () => {
    await loginWithUsername('william');

    const itemResponse = await createItem({
      title: 'Locked Cabinet',
      type: '',
      description: '',
      yearMade: '',
      dateReceived: '',
      familyIds: [],
    });

    const eventResponse = await addItemEvent({
      itemId: itemResponse.body.item.item_id,
      title: 'Cabinet logged',
      description: '',
      occurredOn: '2026-03-30',
    });

    await logout();
    await loginWithUsername('demo');

    await expect(
      updateItem({
        itemId: itemResponse.body.item.item_id,
        title: 'Demo edit attempt',
        type: '',
        description: '',
        yearMade: '',
        dateReceived: '',
      })
    ).resolves.toMatchObject({ ok: false, status: 403 });

    await expect(
      addItemEvent({
        itemId: itemResponse.body.item.item_id,
        title: 'Demo event create attempt',
        description: '',
        occurredOn: '2026-03-31',
      })
    ).resolves.toMatchObject({ ok: false, status: 403 });

    await expect(
      updateItemEvent({
        itemEventId: eventResponse.body.event.item_event_id,
        itemId: itemResponse.body.item.item_id,
        title: 'Demo event edit attempt',
        description: '',
        occurredOn: '2026-03-31',
      })
    ).resolves.toMatchObject({ ok: false, status: 403 });
  });

  test('only family admins can edit family details or add members', async () => {
    await loginWithUsername('avery');

    const familiesResponse = await fetchMyFamilies();
    const memberFamily = familiesResponse.body.families.find((family) => family.my_role === 'member');

    expect(memberFamily).toBeTruthy();

    await expect(
      updateFamily({
        familyId: memberFamily.family_id,
        name: 'Edited by non-admin',
        description: memberFamily.description,
      })
    ).resolves.toMatchObject({ ok: false, status: 403 });

    await expect(
      updateFamilyPhoto({
        familyId: memberFamily.family_id,
        imageFile: new File(['family-photo'], 'member-edit.png', { type: 'image/png' }),
      })
    ).resolves.toMatchObject({ ok: false, status: 403 });

    await expect(
      addFamilyMember({
        familyId: memberFamily.family_id,
        username: 'new-cousin',
      })
    ).resolves.toMatchObject({ ok: false, status: 403 });
  });
});
