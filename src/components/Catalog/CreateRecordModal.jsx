import React, { useEffect, useRef, useState } from 'react';

const INITIAL_FORM = {
  name: '',
  itemId: '',
};

export function CreateRecordModal({ mode, isOpen, items, onClose, onSubmit }) {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const wasOpenRef = useRef(false);
  const hasSelectableItems = items.length > 0;

  useEffect(() => {
    if (!isOpen) {
      setFormState(INITIAL_FORM);
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current) {
      setFormState({
        name: '',
        itemId: items[0] ? String(items[0].item_id) : '',
      });
      wasOpenRef.current = true;
      return;
    }

    if (mode === 'event' && !formState.itemId && items[0]) {
      setFormState((current) => ({
        ...current,
        itemId: String(items[0].item_id),
      }));
    }
  }, [isOpen, mode, items, formState.itemId]);

  if (!isOpen || !mode) {
    return null;
  }

  const modalCopy = {
    item: {
      heading: 'Add item',
      label: 'Item name',
      button: 'Create item',
    },
    family: {
      heading: 'Add family',
      label: 'Family name',
      button: 'Create family',
    },
    event: {
      heading: 'Add event',
      label: 'Event name',
      button: 'Create event',
    },
  }[mode];

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === 'event' && !hasSelectableItems) {
      return;
    }

    const payload = {
      name: formState.name,
      itemId: formState.itemId,
    };

    const created = await onSubmit(payload);

    if (created) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heirloom-earthy/40 px-4 py-8">
      <div className="heirloom-panel w-full max-w-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Quick Create</p>
            <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">{modalCopy.heading}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-heirloom-earthy/70">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="record-name" className="block text-sm font-medium text-heirloom-earthy">
              {modalCopy.label}
            </label>
            <input
              id="record-name"
              className="heirloom-input mt-2"
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            />
          </div>

          {mode === 'event' ? (
            <div>
              <label htmlFor="event-item" className="block text-sm font-medium text-heirloom-earthy">
                Item
              </label>
              {hasSelectableItems ? (
                <>
                  <select
                    id="event-item"
                    className="heirloom-input mt-2"
                    value={formState.itemId}
                    onChange={(event) => setFormState((current) => ({ ...current, itemId: event.target.value }))}
                  >
                    {items.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm leading-6 text-heirloom-earthy/70">
                    Events must belong to an item you own, so pick the closest match now and add more detail on the next page.
                  </p>
                </>
              ) : (
                <p className="mt-2 rounded-2xl bg-heirloom-beige p-4 text-sm leading-6 text-heirloom-earthy/75">
                  You need to own an item before you can create an event.
                </p>
              )}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="heirloom-button heirloom-button-secondary">
              Cancel
            </button>
            <button type="submit" className="heirloom-button" disabled={mode === 'event' && !hasSelectableItems}>
              {modalCopy.button}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
