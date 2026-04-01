import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function ItemDetail({
  item,
  families,
  currentUserId,
  onSaveItem,
  onAddEvent,
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [yearMade, setYearMade] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [selectedFamilyIds, setSelectedFamilyIds] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [occurredOn, setOccurredOn] = useState('');
  const [newOwnerUserId, setNewOwnerUserId] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const pendingImageUrlRef = useRef('');
  const timelineScrollRef = useRef(null);

  const canEditItem = item?.owner_user_id === currentUserId;

  useEffect(() => {
    setTitle(item?.title || '');
    setType(item?.type || '');
    setDescription(item?.description || '');
    setYearMade(item?.year_made || '');
    setDateReceived(item?.date_received || '');
    setSelectedFamilyIds(item?.visible_families?.map((family) => family.family_id) || []);
    setPendingImageFile(null);

    if (pendingImageUrlRef.current) {
      URL.revokeObjectURL(pendingImageUrlRef.current);
      pendingImageUrlRef.current = '';
    }

    setPendingImageUrl('');
  }, [item]);

  const selectedFamilySet = useMemo(() => new Set(selectedFamilyIds.map(String)), [selectedFamilyIds]);
  const initialFamilyIds = useMemo(
    () => (item?.visible_families?.map((family) => family.family_id) || []).map(String).sort(),
    [item]
  );
  const selectedFamilyIdsKey = useMemo(() => selectedFamilyIds.map(String).sort().join(','), [selectedFamilyIds]);
  const initialFamilyIdsKey = useMemo(() => initialFamilyIds.join(','), [initialFamilyIds]);
  const currentImageSrc = pendingImageUrl || item?.photo_url || '';
  const transferCandidates = item?.transfer_candidates || [];
  const timelineEvents = useMemo(
    () =>
      [...(item?.events || [])].sort((left, right) => String(left.occurred_on).localeCompare(String(right.occurred_on))),
    [item]
  );
  const detailsChanged =
    title !== (item?.title || '') ||
    type !== (item?.type || '') ||
    description !== (item?.description || '') ||
    yearMade !== (item?.year_made || '') ||
    dateReceived !== (item?.date_received || '');
  const familiesChanged = selectedFamilyIdsKey !== initialFamilyIdsKey;
  const imageChanged = Boolean(pendingImageFile);
  const isDirty = canEditItem && (detailsChanged || familiesChanged || imageChanged);

  useEffect(() => {
    return () => {
      if (pendingImageUrlRef.current) {
        URL.revokeObjectURL(pendingImageUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!timelineScrollRef.current) {
      return;
    }

    const nextLeft = timelineScrollRef.current.scrollWidth;

    if (typeof timelineScrollRef.current.scrollTo === 'function') {
      timelineScrollRef.current.scrollTo({
        left: nextLeft,
        behavior: 'smooth',
      });
      return;
    }

    timelineScrollRef.current.scrollLeft = nextLeft;
  }, [item?.item_id, timelineEvents.length]);

  function toggleFamily(familyId) {
    setSelectedFamilyIds((current) =>
      current.some((value) => String(value) === String(familyId))
        ? current.filter((value) => String(value) !== String(familyId))
        : [...current, familyId]
    );
  }

  async function handleSaveItem() {
    if (!isDirty) {
      return;
    }

    setIsSaving(true);
    const saved = await onSaveItem({
      itemId: item.item_id,
      title,
      type,
      description,
      yearMade,
      dateReceived,
      familyIds: selectedFamilyIds,
      imageFile: pendingImageFile,
      detailsChanged,
      familiesChanged,
      imageChanged,
    });
    setIsSaving(false);

    if (saved && pendingImageUrlRef.current) {
      URL.revokeObjectURL(pendingImageUrlRef.current);
      pendingImageUrlRef.current = '';
      setPendingImageUrl('');
      setPendingImageFile(null);
    }
  }

  async function handleAddEvent(event) {
    event.preventDefault();

    if (!canEditItem) {
      return;
    }

    const created = await onAddEvent({
      itemId: item.item_id,
      title: eventTitle,
      description: eventDescription,
      occurredOn,
      newOwnerUserId: newOwnerUserId ? Number(newOwnerUserId) : null,
    });

    if (created) {
      setEventTitle('');
      setEventDescription('');
      setOccurredOn('');
      setNewOwnerUserId('');
    }
  }

  async function handlePhotoChange(event) {
    const imageFile = event.target.files?.[0] || null;

    if (!imageFile) {
      return;
    }

    if (pendingImageUrlRef.current) {
      URL.revokeObjectURL(pendingImageUrlRef.current);
    }

    const nextPreviewUrl =
      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(imageFile) : '';

    pendingImageUrlRef.current = nextPreviewUrl;
    setPendingImageFile(imageFile);
    setPendingImageUrl(nextPreviewUrl);
    event.target.value = '';
  }

  if (!item) {
    return (
      <section className="heirloom-panel">
        <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Item detail</p>
        <h2 className="mt-3 text-2xl font-semibold text-heirloom-earthy">Item not found</h2>
        <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
          Choose an item from the sidebar or the items page to review its story, event history, and visibility settings.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-6">
        <div
          data-testid="item-detail-sticky-header"
          className="sticky top-0 z-10 rounded-[1.75rem] border border-heirloom-earthy/10 bg-white/95 p-6 shadow-[0_18px_60px_rgba(78,124,90,0.12)] backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="item-title" className="sr-only">
                Heirloom title
              </label>
              <input
                id="item-title"
                className="heirloom-input text-2xl font-semibold sm:text-3xl"
                value={title}
                disabled={!canEditItem}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveItem}
              className={`min-w-24 shrink-0 ${!isDirty || !canEditItem ? 'heirloom-button heirloom-button-secondary text-heirloom-earthy hover:bg-heirloom-beige' : 'heirloom-button'}`}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {!canEditItem ? <p className="mt-3 text-sm leading-6 text-heirloom-earthy/70">Only the item owner can edit this heirloom.</p> : null}
        </div>

        <div className="grid gap-6">
          <section className="heirloom-panel min-w-0">
            <h2 className="text-sm font-semibold text-heirloom-earthy">Heirloom Basic Information</h2>
            <div data-testid="item-detail-basic-grid" className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
              <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="item-type" className="block text-sm font-medium text-heirloom-earthy">
                    Type
                  </label>
                  <input
                    id="item-type"
                    className="heirloom-input mt-2"
                    value={type}
                    disabled={!canEditItem}
                    onChange={(event) => setType(event.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="item-year" className="block text-sm font-medium text-heirloom-earthy">
                    Year made
                  </label>
                  <input
                    id="item-year"
                    className="heirloom-input mt-2"
                    value={yearMade}
                    disabled={!canEditItem}
                    onChange={(event) => setYearMade(event.target.value)}
                  />
                </div>
                <div data-testid="item-date-received-field" className="min-w-0 overflow-hidden lg:col-span-2">
                  <label htmlFor="item-date-received" className="block text-sm font-medium text-heirloom-earthy">
                    Date received
                  </label>
                  <input
                    id="item-date-received"
                    type="date"
                    className="heirloom-input mt-2"
                    value={dateReceived}
                    disabled={!canEditItem}
                    onChange={(event) => setDateReceived(event.target.value)}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-heirloom-earthy">Most Recent Image</h3>
                {currentImageSrc ? (
                  <div className="mt-4 overflow-hidden rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40">
                    <img src={currentImageSrc} alt={title || item.title} className="h-72 w-full object-cover" />
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-dashed border-heirloom-earthy/20 bg-heirloom-beige/40 p-8 text-center">
                    <p className="text-sm leading-6 text-heirloom-earthy/70">No image uploaded yet.</p>
                  </div>
                )}
                {canEditItem ? (
                  <div className="mt-4">
                    <input id="item-image-upload" className="sr-only" type="file" accept="image/*" onChange={handlePhotoChange} />
                    <label htmlFor="item-image-upload" className="heirloom-button heirloom-button-secondary cursor-pointer">
                      Choose image
                    </label>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 xl:col-span-2">
                <label htmlFor="item-description" className="block text-sm font-medium text-heirloom-earthy">
                  Description
                </label>
                <textarea
                  id="item-description"
                  className="heirloom-input mt-2 min-h-40 resize-y"
                  value={description}
                  disabled={!canEditItem}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="min-w-0 xl:col-span-2">
                <p className="text-sm font-medium text-heirloom-earthy">Families Linked</p>
                <div className="mt-4 space-y-3">
                  {families.length ? (
                    families.map((family) => (
                      <label key={family.family_id} className="flex items-start gap-3 rounded-2xl border border-heirloom-earthy/10 p-4">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={selectedFamilySet.has(String(family.family_id))}
                          disabled={!canEditItem}
                          onChange={() => toggleFamily(family.family_id)}
                        />
                        <div>
                          <p className="font-semibold text-heirloom-earthy">{family.name}</p>
                          <p className="mt-1 text-sm leading-6 text-heirloom-earthy/70">{family.description || 'Family group'}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-heirloom-beige p-4 text-sm leading-6 text-heirloom-earthy/75">
                      You do not belong to any families yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="heirloom-panel min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-heirloom-earthy">Timeline</h2>
                <p className="mt-1 text-sm text-heirloom-earthy/70">Events are ordered by event date and inherit the same visibility as the item.</p>
              </div>
            </div>
            <div ref={timelineScrollRef} data-testid="timeline-scroll-region" className="mt-6 max-w-full overflow-x-auto pb-2">
              {timelineEvents.length ? (
                <ol className="flex w-max min-w-full items-stretch gap-3">
                  {timelineEvents.map((event, index) => (
                    <li key={event.item_event_id} className="flex items-center gap-3">
                      <div className="w-72 rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/70 p-5">
                        <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">{event.occurred_on}</p>
                        <Link
                          to={`/events/${event.item_event_id}`}
                          className="mt-3 block text-xl font-semibold text-heirloom-earthy hover:text-heirloom-tomato"
                        >
                          {event.title}
                        </Link>
                        <p className="mt-3 text-sm leading-6 text-heirloom-earthy/80">{event.description || 'No event description yet.'}</p>
                        {event.new_owner_username ? (
                          <p className="mt-3 text-sm font-medium text-heirloom-earthy/70">
                            New owner:{' '}
                            <Link to={`/profile/${event.new_owner_user_id}`} className="text-heirloom-tomato">
                              {event.new_owner_username}
                            </Link>
                          </p>
                        ) : null}
                      </div>
                      {index < timelineEvents.length - 1 ? (
                        <span aria-hidden="true" className="text-2xl text-heirloom-earthy/50">
                          →
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm leading-6 text-heirloom-earthy/70">No events recorded yet.</p>
              )}
            </div>
            <form data-testid="item-detail-add-event-form" onSubmit={handleAddEvent} className="mt-6 grid min-w-0 gap-4 lg:grid-cols-5">
              <div className="min-w-0 lg:col-span-2">
                <label htmlFor="new-event-title" className="block text-sm font-medium text-heirloom-earthy">
                  Event title
                </label>
                <input
                  id="new-event-title"
                  className="heirloom-input mt-2"
                  value={eventTitle}
                  disabled={!canEditItem}
                  onChange={(event) => setEventTitle(event.target.value)}
                />
              </div>
              <div data-testid="item-event-date-field" className="min-w-0 overflow-hidden">
                <label htmlFor="new-event-date" className="block text-sm font-medium text-heirloom-earthy">
                  Event date
                </label>
                <input
                  id="new-event-date"
                  className="heirloom-input mt-2"
                  type="date"
                  value={occurredOn}
                  disabled={!canEditItem}
                  onChange={(event) => setOccurredOn(event.target.value)}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="new-event-owner" className="block text-sm font-medium text-heirloom-earthy">
                  New Owner
                </label>
                <select
                  id="new-event-owner"
                  className="heirloom-input mt-2"
                  value={newOwnerUserId}
                  disabled={!canEditItem}
                  onChange={(event) => setNewOwnerUserId(event.target.value)}
                >
                  <option value="">No ownership change</option>
                  {transferCandidates.map((candidate) => (
                    <option key={candidate.user_id} value={candidate.user_id}>
                      {candidate.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 flex items-end">
                <button type="submit" className="heirloom-button w-full" disabled={!canEditItem}>
                  Add event
                </button>
              </div>
              <div className="min-w-0 lg:col-span-5">
                <label htmlFor="new-event-description" className="block text-sm font-medium text-heirloom-earthy">
                  Event details
                </label>
                <textarea
                  id="new-event-description"
                  className="heirloom-input mt-2 min-h-28 resize-y"
                  placeholder="What happened, and why does it matter?"
                  value={eventDescription}
                  disabled={!canEditItem}
                  onChange={(event) => setEventDescription(event.target.value)}
                />
              </div>
            </form>
            {!canEditItem ? (
              <p className="mt-4 text-sm leading-6 text-heirloom-earthy/70">Only the item owner can add timeline events.</p>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}
