import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

export function EventsPageContent({ events }) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeSearchValue(searchTerm);
  const filteredEvents = useMemo(() => {
    if (!normalizedSearchTerm) {
      return events;
    }

    return events.filter((entry) =>
      [
        entry.title,
        entry.item_title,
        entry.occurred_on,
        entry.description,
        entry.created_by_username,
        entry.owner_username,
      ].some((value) => normalizeSearchValue(value).includes(normalizedSearchTerm))
    );
  }, [events, normalizedSearchTerm]);

  return (
    <section className="space-y-6">
      <div className="heirloom-panel">
        <label htmlFor="events-search" className="block text-sm font-medium text-heirloom-earthy">
          Search events
        </label>
        <input
          id="events-search"
          type="search"
          className="heirloom-input mt-2"
          placeholder="Search by title, item, date, description, or creator"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {events.length ? (
        <div className="space-y-4">
          {filteredEvents.length ? (
            filteredEvents.map((entry) => (
              <article key={entry.item_event_id} className="heirloom-panel">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Event</p>
                    <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">
                      <Link to={`/events/${entry.item_event_id}`} className="text-heirloom-earthy hover:text-heirloom-tomato">
                        {entry.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm text-heirloom-earthy/70">
                      {entry.occurred_on} · On item: {entry.item_title}
                    </p>
                    <p className="mt-2 text-sm text-heirloom-earthy/70">
                      Created by{' '}
                      <Link to={`/profile/${entry.created_by_user_id}`} className="font-semibold text-heirloom-tomato">
                        {entry.created_by_username}
                      </Link>{' '}
                      · Item owner{' '}
                      <Link to={`/profile/${entry.owner_user_id}`} className="font-semibold text-heirloom-tomato">
                        {entry.owner_username}
                      </Link>
                    </p>
                    <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
                      {entry.description || 'Open this event to add more detail, update the linked item, or attach an image.'}
                    </p>
                  </div>
                  <Link
                    to={`/events/${entry.item_event_id}`}
                    aria-label={`Open ${entry.title}`}
                    className="ml-auto block h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40"
                  >
                    {entry.photo_url ? (
                      <img src={entry.photo_url} alt={entry.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-heirloom-earthy/60">
                        No image
                      </div>
                    )}
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="heirloom-panel">
              <p className="text-lg font-semibold text-heirloom-earthy">No matching events</p>
              <p className="mt-2 text-sm leading-6 text-heirloom-earthy/75">
                Try a different search term for the event title, linked item, date, description, or creator.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="heirloom-panel">
          <p className="text-lg font-semibold text-heirloom-earthy">No events yet</p>
          <p className="mt-2 text-sm leading-6 text-heirloom-earthy/75">
            Add an event to capture when an item was found, shared, inherited, restored, or remembered.
          </p>
        </div>
      )}
    </section>
  );
}
