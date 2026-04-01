import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function EventDetailPageContent({ eventRecord, items, onSaveEvent }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [occurredOn, setOccurredOn] = useState('');
  const [itemId, setItemId] = useState('');
  const [newOwnerUserId, setNewOwnerUserId] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const pendingImageUrlRef = useRef('');

  useEffect(() => {
    setTitle(eventRecord?.title || '');
    setDescription(eventRecord?.description || '');
    setOccurredOn(eventRecord?.occurred_on || '');
    setItemId(eventRecord?.item_id ? String(eventRecord.item_id) : items[0] ? String(items[0].item_id) : '');
    setNewOwnerUserId(eventRecord?.new_owner_user_id ? String(eventRecord.new_owner_user_id) : '');
    setPendingImageFile(null);

    if (pendingImageUrlRef.current) {
      URL.revokeObjectURL(pendingImageUrlRef.current);
      pendingImageUrlRef.current = '';
    }

    setPendingImageUrl('');
  }, [eventRecord, items]);

  useEffect(() => {
    return () => {
      if (pendingImageUrlRef.current) {
        URL.revokeObjectURL(pendingImageUrlRef.current);
      }
    };
  }, []);

  const canEditEvent = Boolean(eventRecord?.can_edit);
  const currentImageSrc = pendingImageUrl || eventRecord?.photo_url || '';
  const selectedItem = items.find((item) => String(item.item_id) === String(itemId || eventRecord?.item_id)) || null;
  const transferCandidates = selectedItem?.transfer_candidates || [];
  const detailsChanged =
    title !== (eventRecord?.title || '') ||
    description !== (eventRecord?.description || '') ||
    occurredOn !== (eventRecord?.occurred_on || '') ||
    String(itemId) !== String(eventRecord?.item_id || '') ||
    String(newOwnerUserId) !== String(eventRecord?.new_owner_user_id || '');
  const imageChanged = Boolean(pendingImageFile);
  const isDirty = canEditEvent && (detailsChanged || imageChanged);

  if (!eventRecord) {
    return (
      <section className="heirloom-panel">
        <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Event detail</p>
        <h2 className="mt-3 text-2xl font-semibold text-heirloom-earthy">Event not found</h2>
        <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
          Pick an event from the events page or the linked item timeline.
        </p>
      </section>
    );
  }

  async function handleSave() {
    if (!isDirty) {
      return;
    }

    setIsSaving(true);
    const saved = await onSaveEvent({
      itemEventId: eventRecord.item_event_id,
      itemId: Number(itemId),
      title,
      description,
      occurredOn,
      newOwnerUserId: newOwnerUserId ? Number(newOwnerUserId) : null,
      imageFile: pendingImageFile,
      detailsChanged,
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

  return (
    <section className="space-y-6">
      <div
        data-testid="event-detail-sticky-header"
        className="sticky top-0 z-10 rounded-[1.75rem] border border-heirloom-earthy/10 bg-white/95 p-6 shadow-[0_18px_60px_rgba(78,124,90,0.12)] backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="event-title" className="sr-only">
              Event title
            </label>
            <input
              id="event-title"
              className="heirloom-input text-2xl font-semibold sm:text-3xl"
              value={title}
              disabled={!canEditEvent}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={`min-w-24 shrink-0 ${!isDirty || !canEditEvent ? 'heirloom-button heirloom-button-secondary text-heirloom-earthy hover:bg-heirloom-beige' : 'heirloom-button'}`}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {!canEditEvent ? <p className="mt-3 text-sm leading-6 text-heirloom-earthy/70">Only the event creator can edit this event.</p> : null}
      </div>

      <section className="heirloom-panel min-w-0">
        <h2 className="text-sm font-semibold text-heirloom-earthy">Event Basic Information</h2>
        <div data-testid="event-detail-basic-grid" className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
          <div className="grid min-w-0 gap-4">
            <div className="min-w-0">
              <label htmlFor="event-item-select" className="block text-sm font-medium text-heirloom-earthy">
                Item
              </label>
              <select
                id="event-item-select"
                className="heirloom-input mt-2"
                value={itemId}
                disabled={!canEditEvent}
                onChange={(event) => setItemId(event.target.value)}
              >
                {items.map((item) => (
                  <option key={item.item_id} value={item.item_id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div data-testid="event-date-field" className="min-w-0 overflow-hidden">
              <label htmlFor="event-date" className="block text-sm font-medium text-heirloom-earthy">
                Date
              </label>
              <input
                id="event-date"
                type="date"
                className="heirloom-input mt-2"
                value={occurredOn}
                disabled={!canEditEvent}
                onChange={(event) => setOccurredOn(event.target.value)}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="event-new-owner" className="block text-sm font-medium text-heirloom-earthy">
                New Owner
              </label>
              <select
                id="event-new-owner"
                className="heirloom-input mt-2"
                value={newOwnerUserId}
                disabled={!canEditEvent}
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
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-medium text-heirloom-earthy">Event image</h3>
            {currentImageSrc ? (
              <div className="mt-4 overflow-hidden rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40">
                <img src={currentImageSrc} alt={title || eventRecord.title} className="h-72 w-full object-cover" />
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-heirloom-earthy/20 bg-heirloom-beige/40 p-8 text-center">
                <p className="text-sm leading-6 text-heirloom-earthy/70">No image uploaded yet.</p>
              </div>
            )}
            {canEditEvent ? (
              <div className="mt-4">
                <input id="event-image-upload" className="sr-only" type="file" accept="image/*" onChange={handlePhotoChange} />
                <label htmlFor="event-image-upload" className="heirloom-button heirloom-button-secondary cursor-pointer">
                  Choose image
                </label>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 xl:col-span-2">
            <label htmlFor="event-description" className="block text-sm font-medium text-heirloom-earthy">
              Story
            </label>
            <textarea
              id="event-description"
              className="heirloom-input mt-2 min-h-40 resize-y"
              value={description}
              disabled={!canEditEvent}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div data-testid="event-detail-meta-row" className="xl:col-span-2 flex min-w-0 flex-wrap items-center justify-between gap-4">
            <Link to={`/items/${itemId || eventRecord.item_id}`} className="text-sm font-semibold text-heirloom-tomato">
              View linked item
            </Link>
            <p className="min-w-0 flex-1 text-sm text-heirloom-earthy/70">
              Created by{' '}
              <Link to={`/profile/${eventRecord.created_by_user_id}`} className="font-semibold text-heirloom-tomato">
                {eventRecord.created_by_username}
              </Link>{' '}
              · Item owner{' '}
              <Link to={`/profile/${eventRecord.owner_user_id}`} className="font-semibold text-heirloom-tomato">
                {eventRecord.owner_username}
              </Link>
              {eventRecord.new_owner_username ? (
                <>
                  {' '}
                  · New owner{' '}
                  <Link to={`/profile/${eventRecord.new_owner_user_id}`} className="font-semibold text-heirloom-tomato">
                    {eventRecord.new_owner_username}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
