import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreateRecordModal } from '../components/Catalog/CreateRecordModal';
import { DesktopSidebar } from '../components/Catalog/DesktopSidebar';
import { EventDetailPageContent } from '../components/Catalog/EventDetailPageContent';
import { EventsPageContent } from '../components/Catalog/EventsPageContent';
import { FamilyDetailPageContent } from '../components/Catalog/FamilyDetailPageContent';
import { FamiliesPageContent } from '../components/Catalog/FamiliesPageContent';
import { HomePageContent } from '../components/Catalog/HomePageContent';
import { ItemDetail } from '../components/Catalog/ItemDetail';
import { ItemsPageContent } from '../components/Catalog/ItemsPageContent';
import { ProfilePageContent } from '../components/Catalog/ProfilePageContent';
import { AppNav } from '../components/Nav/AppNav';
import { addItemEvent, updateItemEvent } from '../helpers/eventHelpers';
import { addFamilyMember, createFamily, fetchMyFamilies, updateFamily, updateFamilyPhoto } from '../helpers/familyHelpers';
import { createItem, fetchVisibleItems, updateItem, updateItemFamilies, updateItemPhoto } from '../helpers/itemHelpers';
import { setCatalogStatus, setItems } from '../store/catalog.reducer';
import { setFamilies } from '../store/family.reducer';

export default function AppShell({ page = 'home' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const families = useSelector((state) => state.family.families);
  const items = useSelector((state) => state.catalog.items);
  const status = useSelector((state) => state.catalog.status);
  const [createMode, setCreateMode] = useState(null);
  const mainContentRef = useRef(null);
  const activeSection = useMemo(() => {
    if (page === 'families' || page === 'items' || page === 'events') {
      return page;
    }

    if (page === 'familyDetail') {
      return 'families';
    }

    if (page === 'itemDetail') {
      return 'items';
    }

    if (page === 'eventDetail') {
      return 'events';
    }

    if (page === 'profile') {
      return 'profile';
    }

    return 'home';
  }, [page]);

  const refreshCatalog = useCallback(async () => {
    dispatch(setCatalogStatus('loading'));

    const [familiesRes, itemsRes] = await Promise.all([fetchMyFamilies(), fetchVisibleItems()]);

    if (!familiesRes.ok) {
      dispatch(setCatalogStatus('error'));
      toast.error(familiesRes.body?.error || 'Failed to load families');
      return false;
    }

    if (!itemsRes.ok) {
      dispatch(setCatalogStatus('error'));
      toast.error(itemsRes.body?.error || 'Failed to load items');
      return false;
    }

    dispatch(setFamilies(familiesRes.body.families));
    dispatch(setItems(itemsRes.body.items));
    dispatch(setCatalogStatus('ready'));
    return true;
  }, [dispatch]);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const events = useMemo(
    () =>
      items
        .flatMap((item) =>
          item.events.map((event) => ({
            ...event,
            item_id: item.item_id,
            item_title: item.title,
            owner_user_id: item.owner_user_id,
            owner_username: item.owner_username,
          }))
        )
        .sort((left, right) => String(right.occurred_on).localeCompare(String(left.occurred_on))),
    [items]
  );

  const activeFamily = families.find((family) => String(family.family_id) === String(params.familyId)) || null;
  const activeItem = items.find((item) => String(item.item_id) === String(params.itemId)) || null;
  const activeEvent = events.find((event) => String(event.item_event_id) === String(params.eventId)) || null;
  const familyItems = activeFamily
    ? items.filter((item) => item.visible_families.some((family) => String(family.family_id) === String(activeFamily.family_id)))
    : [];
  const familyEvents = activeFamily
    ? events.filter((event) =>
        items
          .find((item) => item.item_id === event.item_id)
          ?.visible_families.some((family) => String(family.family_id) === String(activeFamily.family_id))
      )
    : [];
  const ownedItems = useMemo(
    () => items.filter((item) => item.owner_user_id === user?.user_id),
    [items, user?.user_id]
  );
  const visibleUsers = useMemo(() => {
    const usersById = new Map();

    function addUserRecord(userRecord) {
      if (!userRecord?.user_id || !userRecord?.username) {
        return;
      }

      usersById.set(userRecord.user_id, {
        user_id: userRecord.user_id,
        username: userRecord.username,
      });
    }

    addUserRecord(user);
    families.forEach((family) => family.members.forEach(addUserRecord));
    items.forEach((item) => {
      addUserRecord({
        user_id: item.owner_user_id,
        username: item.owner_username,
      });
      item.events.forEach((event) => {
        addUserRecord({
          user_id: event.created_by_user_id,
          username: event.created_by_username,
        });
        addUserRecord({
          user_id: event.new_owner_user_id,
          username: event.new_owner_username,
        });
      });
    });

    return [...usersById.values()].sort((left, right) => String(left.username).localeCompare(String(right.username)));
  }, [families, items, user]);
  const activeProfileUserId = params.userId ? Number(params.userId) : user?.user_id;
  const activeProfile = visibleUsers.find((entry) => entry.user_id === activeProfileUserId) || null;
  const isOwnProfile = activeProfile?.user_id === user?.user_id;
  const profileFamilies = activeProfile
    ? families.filter((family) => family.members.some((member) => member.user_id === activeProfile.user_id))
    : [];
  const profileItems = activeProfile
    ? items.filter((item) => item.owner_user_id === activeProfile.user_id)
    : [];
  const profileEvents = activeProfile
    ? events.filter((event) =>
        profileItems.some((item) => item.item_id === event.item_id)
      )
    : [];

  useEffect(() => {
    if (typeof mainContentRef.current?.scrollTo === 'function') {
      mainContentRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
      mainContentRef.current.scrollLeft = 0;
    }
  }, [location.pathname, page]);

  async function handleCreateFamily(payload) {
    const response = await createFamily(payload);

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not create family');
      return false;
    }

    toast.success('Family created');
    await refreshCatalog();
    navigate(`/families/${response.body.family.family_id}`);
    return true;
  }

  async function handleQuickCreateFamily({ name }) {
    return handleCreateFamily({ name, description: '' });
  }

  async function handleSaveFamily(payload) {
    const { familyId, name, description, imageFile, detailsChanged = true, imageChanged = false } = payload;

    if (detailsChanged) {
      const familyResponse = await updateFamily({
        familyId,
        name,
        description,
      });

      if (!familyResponse.ok) {
        toast.error(familyResponse.body?.error || 'Could not update family');
        return false;
      }
    }

    if (imageChanged) {
      const imageResponse = await updateFamilyPhoto({
        familyId,
        imageFile,
      });

      if (!imageResponse.ok) {
        toast.error(imageResponse.body?.error || 'Could not update family image');
        return false;
      }
    }

    if (detailsChanged || imageChanged) {
      toast.success('Family updated');
      await refreshCatalog();
    }

    return true;
  }

  async function handleAddFamilyMember(payload) {
    const response = await addFamilyMember(payload);

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not add that member');
      return false;
    }

    toast.success('Family member added');
    await refreshCatalog();
    return true;
  }

  async function handleCreateItem(payload) {
    const response = await createItem(payload);

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not save item');
      return false;
    }

    toast.success('Item saved');
    await refreshCatalog();
    navigate(`/items/${response.body.item.item_id}`);
    return true;
  }

  async function handleQuickCreateItem({ name }) {
    return handleCreateItem({
      title: name,
      type: '',
      description: '',
      yearMade: '',
      dateReceived: '',
      familyIds: [],
      imageFile: null,
    });
  }

  async function handleSaveItem(payload) {
    const { itemId, title, type, description, yearMade, dateReceived, familyIds, imageFile, detailsChanged, familiesChanged, imageChanged } =
      payload;

    if (detailsChanged) {
      const itemResponse = await updateItem({
        itemId,
        title,
        type,
        description,
        yearMade,
        dateReceived,
      });

      if (!itemResponse.ok) {
        toast.error(itemResponse.body?.error || 'Could not update item');
        return false;
      }
    }

    if (familiesChanged) {
      const familiesResponse = await updateItemFamilies({
        itemId,
        familyIds,
      });

      if (!familiesResponse.ok) {
        toast.error(familiesResponse.body?.error || 'Could not update sharing settings');
        return false;
      }
    }

    if (imageChanged) {
      const imageResponse = await updateItemPhoto({
        itemId,
        imageFile,
      });

      if (!imageResponse.ok) {
        toast.error(imageResponse.body?.error || 'Could not update item image');
        return false;
      }
    }

    if (detailsChanged || familiesChanged || imageChanged) {
      toast.success('Heirloom saved');
      await refreshCatalog();
    }

    return true;
  }

  async function handleAddEvent(payload) {
    const response = await addItemEvent(payload);

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not add event');
      return false;
    }

    toast.success('Event added');
    await refreshCatalog();
    return true;
  }

  async function handleQuickCreateEvent({ name, itemId }) {
    const response = await addItemEvent({
      itemId: Number(itemId),
      title: name,
      description: '',
      occurredOn: '',
      newOwnerUserId: null,
      imageFile: null,
    });

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not add event');
      return false;
    }

    toast.success('Event created');
    await refreshCatalog();
    navigate(`/events/${response.body.event.item_event_id}`);
    return true;
  }

  async function handleSaveEvent(payload) {
    const { itemEventId, itemId, title, description, occurredOn, newOwnerUserId, imageFile, detailsChanged = true, imageChanged = false } = payload;

    if (!detailsChanged && !imageChanged) {
      return true;
    }

    const response = await updateItemEvent({
      itemEventId,
      itemId,
      title,
      description,
      occurredOn,
      newOwnerUserId,
      imageFile: imageChanged ? imageFile : null,
    });

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not update event');
      return false;
    }

    if (detailsChanged || imageChanged) {
      toast.success('Event updated');
      await refreshCatalog();
    }

    return true;
  }

  async function handleUpdatePhoto(payload) {
    const response = await updateItemPhoto(payload);

    if (!response.ok) {
      toast.error(response.body?.error || 'Could not update item image');
      return false;
    }

    toast.success('Image updated for this session');
    await refreshCatalog();
    return true;
  }

  const recentFamilies = useMemo(
    () =>
      [...families]
        .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
        .slice(0, 3),
    [families]
  );
  const recentItems = items.slice(0, 3);

  function renderPageContent() {
    if (page === 'families') {
      return <FamiliesPageContent families={families} />;
    }

    if (page === 'familyDetail') {
      return (
        <FamilyDetailPageContent
          family={activeFamily}
          familyItems={familyItems}
          familyEvents={familyEvents}
          onSaveFamily={handleSaveFamily}
          onAddMember={handleAddFamilyMember}
        />
      );
    }

    if (page === 'items') {
      return <ItemsPageContent items={items} />;
    }

    if (page === 'itemDetail') {
      return (
        <ItemDetail
          item={activeItem}
          families={families}
          currentUserId={user?.user_id}
          onSaveItem={handleSaveItem}
          onAddEvent={handleAddEvent}
        />
      );
    }

    if (page === 'events') {
      return <EventsPageContent events={events} />;
    }

    if (page === 'eventDetail') {
      return <EventDetailPageContent eventRecord={activeEvent} items={items} onSaveEvent={handleSaveEvent} />;
    }

    if (page === 'profile') {
      return (
        <ProfilePageContent
          viewer={user}
          profileUser={activeProfile}
          profileFamilies={profileFamilies}
          profileItems={profileItems}
          profileEvents={profileEvents}
          isOwnProfile={params.userId ? isOwnProfile : true}
        />
      );
    }

    return (
      <HomePageContent onOpenCreate={setCreateMode} />
    );
  }

  async function handleCreateModalSubmit(payload) {
    if (createMode === 'family') {
      return handleQuickCreateFamily(payload);
    }

    if (createMode === 'item') {
      return handleQuickCreateItem(payload);
    }

    if (createMode === 'event') {
      return handleQuickCreateEvent(payload);
    }

    return false;
  }

  return (
    <IonPage>
      <IonContent scrollY={false} className="bg-heirloom-beige">
        <div className="shell-page shell-app-frame">
          <AppNav activeSection={activeSection} />
          <div className="shell-container shell-app-body xl:grid-cols-4">
            <DesktopSidebar
              families={recentFamilies}
              recentItems={recentItems}
              selectedFamilyId={params.familyId}
              selectedItemId={params.itemId}
            />
            <main ref={mainContentRef} className="shell-app-main xl:col-span-3">
              {renderPageContent()}
            </main>
          </div>
          <CreateRecordModal
            mode={createMode}
            isOpen={Boolean(createMode)}
            items={createMode === 'event' ? ownedItems : items}
            onClose={() => setCreateMode(null)}
            onSubmit={handleCreateModalSubmit}
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
