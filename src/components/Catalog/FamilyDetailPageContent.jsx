import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function FamilyDetailPageContent({ family, familyItems, familyEvents, onSaveFamily, onAddMember }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const pendingImageUrlRef = useRef('');

  useEffect(() => {
    setName(family?.name || '');
    setDescription(family?.description || '');
    setPendingImageFile(null);

    if (pendingImageUrlRef.current) {
      URL.revokeObjectURL(pendingImageUrlRef.current);
      pendingImageUrlRef.current = '';
    }

    setPendingImageUrl('');
  }, [family]);

  useEffect(() => {
    return () => {
      if (pendingImageUrlRef.current) {
        URL.revokeObjectURL(pendingImageUrlRef.current);
      }
    };
  }, []);

  const canEditFamily = Boolean(family?.can_edit);
  const canManageMembers = Boolean(family?.can_manage_members);
  const currentImageSrc = pendingImageUrl || family?.photo_url || '';
  const detailsChanged = name !== (family?.name || '') || description !== (family?.description || '');
  const imageChanged = Boolean(pendingImageFile);
  const isDirty = canEditFamily && (detailsChanged || imageChanged);

  if (!family) {
    return (
      <section className="heirloom-panel">
        <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Family detail</p>
        <h2 className="mt-3 text-2xl font-semibold text-heirloom-earthy">Family not found</h2>
        <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
          Pick a family from the left sidebar or return to the families directory.
        </p>
      </section>
    );
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!isDirty) {
      return;
    }

    setIsSaving(true);
    const saved = await onSaveFamily({
      familyId: family.family_id,
      name,
      description,
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

  async function handleAddMember(event) {
    event.preventDefault();

    if (!canManageMembers) {
      return;
    }

    const created = await onAddMember({
      familyId: family.family_id,
      username,
    });

    if (created) {
      setUsername('');
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
        data-testid="family-detail-sticky-header"
        className="sticky top-0 z-10 rounded-[1.75rem] border border-heirloom-earthy/10 bg-white/95 p-6 shadow-[0_18px_60px_rgba(78,124,90,0.12)] backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <label htmlFor="family-name" className="sr-only">
              Family name
            </label>
            <input
              id="family-name"
              className="heirloom-input text-2xl font-semibold sm:text-3xl"
              value={name}
              disabled={!canEditFamily}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={`min-w-24 shrink-0 ${!isDirty || !canEditFamily ? 'heirloom-button heirloom-button-secondary text-heirloom-earthy hover:bg-heirloom-beige' : 'heirloom-button'}`}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {!canEditFamily ? <p className="mt-3 text-sm leading-6 text-heirloom-earthy/70">Only family admins can edit this family.</p> : null}
      </div>

      <div className="grid gap-6">
        <section className="heirloom-panel">
          <h2 className="text-sm font-semibold text-heirloom-earthy">Family Basic Information</h2>
          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
            <div>
              <label htmlFor="family-description" className="block text-sm font-medium text-heirloom-earthy">
                Description
              </label>
              <textarea
                id="family-description"
                className="heirloom-input mt-2 min-h-40 resize-y"
                value={description}
                disabled={!canEditFamily}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-heirloom-earthy">Family image</h3>
              {currentImageSrc ? (
                <div className="mt-4 overflow-hidden rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40">
                  <img src={currentImageSrc} alt={name || family.name} className="h-72 w-full object-cover" />
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-dashed border-heirloom-earthy/20 bg-heirloom-beige/40 p-8 text-center">
                  <p className="text-sm leading-6 text-heirloom-earthy/70">No image uploaded yet.</p>
                </div>
              )}
              {canEditFamily ? (
                <div className="mt-4">
                  <input id="family-image-upload" className="sr-only" type="file" accept="image/*" onChange={handlePhotoChange} />
                  <label htmlFor="family-image-upload" className="heirloom-button heirloom-button-secondary cursor-pointer">
                    Choose image
                  </label>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-3 gap-3 xl:col-span-2">
              <div className="rounded-2xl border border-heirloom-earthy/10 bg-white p-3 sm:p-4">
                <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Members</p>
                <p className="mt-2 text-lg font-semibold text-heirloom-earthy sm:text-xl">{family.member_count}</p>
              </div>
              <div className="rounded-2xl border border-heirloom-earthy/10 bg-white p-3 sm:p-4">
                <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Your role</p>
                <p className="mt-2 text-lg font-semibold text-heirloom-earthy sm:text-xl">{family.my_role || 'member'}</p>
              </div>
              <div className="rounded-2xl border border-heirloom-earthy/10 bg-white p-3 sm:p-4">
                <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Shared items</p>
                <p className="mt-2 text-lg font-semibold text-heirloom-earthy sm:text-xl">{familyItems.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="heirloom-panel">
          <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Members</p>
          <div className="mt-4 space-y-3">
            {family.members.length ? (
              family.members.map((member) => (
                <div key={member.user_id} className="rounded-2xl border border-heirloom-earthy/10 bg-white p-4">
                  <Link to={`/profile/${member.user_id}`} className="font-semibold text-heirloom-earthy hover:text-heirloom-tomato">
                    {member.username}
                  </Link>
                  <p className="mt-1 text-sm uppercase text-heirloom-earthy/60">{member.role}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-heirloom-beige p-4 text-sm leading-6 text-heirloom-earthy/75">No members yet.</p>
            )}
          </div>

          <form onSubmit={handleAddMember} className="mt-5 space-y-3">
            <label htmlFor="member-username" className="block text-sm font-medium text-heirloom-earthy">
              Add member by username
            </label>
            <input
              id="member-username"
              className="heirloom-input"
              value={username}
              disabled={!canManageMembers}
              onChange={(event) => setUsername(event.target.value)}
            />
            <button type="submit" className="heirloom-button heirloom-button-secondary" disabled={!canManageMembers}>
              Add member
            </button>
            {!canManageMembers ? (
              <p className="text-sm leading-6 text-heirloom-earthy/70">Only family admins can add members.</p>
            ) : null}
          </form>
        </section>
      </div>

      <section className="heirloom-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Shared items</p>
            <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">Objects in this family</h2>
          </div>
          <span className="shrink-0 rounded-full bg-heirloom-sage/20 px-3 py-1 text-xs font-semibold uppercase text-heirloom-earthy">
            {familyItems.length} items
          </span>
        </div>

        {familyItems.length ? (
          <div className="mt-5 space-y-3">
            {familyItems.map((item) => (
              <Link key={item.item_id} to={`/items/${item.item_id}`} className="block rounded-2xl border border-heirloom-earthy/10 bg-white p-4">
                <p className="font-semibold text-heirloom-earthy">{item.title}</p>
                <p className="mt-1 text-sm text-heirloom-earthy/70">{item.type || 'Uncategorized'}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-heirloom-earthy/75">No shared items yet.</p>
        )}
      </section>

      <section className="heirloom-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Family timeline</p>
            <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">Recent events</h2>
          </div>
          <span className="shrink-0 rounded-full bg-heirloom-sage/20 px-3 py-1 text-xs font-semibold uppercase text-heirloom-earthy">
            {familyEvents.length} events
          </span>
        </div>

        {familyEvents.length ? (
          <div className="mt-5 space-y-3">
            {familyEvents.map((entry) => (
              <Link
                key={`${entry.item_id}-${entry.item_event_id}`}
                to={`/events/${entry.item_event_id}`}
                className="block rounded-2xl border border-heirloom-earthy/10 bg-white p-4"
              >
                <p className="font-semibold text-heirloom-earthy">{entry.title}</p>
                <p className="mt-1 text-sm text-heirloom-earthy/70">
                  {entry.item_title} · {entry.occurred_on}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-heirloom-earthy/75">No events tied to this family yet.</p>
        )}
      </section>
    </section>
  );
}
