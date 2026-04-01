import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

export function ItemsPageContent({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeSearchValue(searchTerm);
  const filteredItems = useMemo(() => {
    if (!normalizedSearchTerm) {
      return items;
    }

    return items.filter((item) => {
      const searchableParts = [
        item.title,
        item.type,
        item.description,
        item.owner_username,
        ...(item.visible_families || []).map((family) => family.name),
      ];

      return searchableParts.some((value) => normalizeSearchValue(value).includes(normalizedSearchTerm));
    });
  }, [items, normalizedSearchTerm]);

  return (
    <section className="space-y-6">
      <div className="heirloom-panel">
        <label htmlFor="items-search" className="block text-sm font-medium text-heirloom-earthy">
          Search heirlooms
        </label>
        <input
          id="items-search"
          type="search"
          className="heirloom-input mt-2"
          placeholder="Search by name, family, type, description, or owner"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {items.length ? (
        <div className="space-y-4">
          {filteredItems.length ? (
            filteredItems.map((item) => {
              const visibleFamilies = item.visible_families || [];
              const linkedFamiliesLabel = visibleFamilies.length
                ? visibleFamilies.map((family) => family.name).join(', ')
                : 'Only visible to the owner';

              return (
                <article key={item.item_id} className="heirloom-panel">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Item</p>
                      <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">
                        <Link to={`/items/${item.item_id}`} className="text-heirloom-earthy hover:text-heirloom-tomato">
                          {item.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm text-heirloom-earthy/70">
                        {item.type || 'Uncategorized'} · Owned by{' '}
                        <Link to={`/profile/${item.owner_user_id}`} className="font-semibold text-heirloom-tomato">
                          {item.owner_username}
                        </Link>
                      </p>
                      <p className="mt-2 text-sm text-heirloom-earthy/70">Linked families: {linkedFamiliesLabel}</p>
                      <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
                        {item.description || 'Open this item to add more detail, a photo, family sharing, and timeline events.'}
                      </p>
                    </div>
                    <Link
                      to={`/items/${item.item_id}`}
                      aria-label={`Open ${item.title}`}
                      className="ml-auto block h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40"
                    >
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-heirloom-earthy/60">
                          No image
                        </div>
                      )}
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="heirloom-panel">
              <p className="text-lg font-semibold text-heirloom-earthy">No matching heirlooms</p>
              <p className="mt-2 text-sm leading-6 text-heirloom-earthy/75">
                Try a different search term for the item name, linked family, type, description, or owner.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="heirloom-panel">
          <p className="text-lg font-semibold text-heirloom-earthy">No items yet</p>
          <p className="mt-2 text-sm leading-6 text-heirloom-earthy/75">
            Add your first heirloom and keep it private until you are ready to share it with a family.
          </p>
        </div>
      )}
    </section>
  );
}
