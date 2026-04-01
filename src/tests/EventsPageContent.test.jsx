import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EventsPageContent } from '../components/Catalog/EventsPageContent';

function createEvent(overrides = {}) {
  return {
    item_event_id: 1,
    title: 'Cataloged from family memory',
    item_title: 'Recipe Journal',
    description: 'Documented where the journal came from and who cared for it.',
    occurred_on: '2026-03-01',
    created_by_username: 'william',
    owner_username: 'william',
    photo_url: '',
    ...overrides,
  };
}

function renderEventsPage(events) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <EventsPageContent events={events} />
    </MemoryRouter>
  );
}

describe('EventsPageContent', () => {
  test('filters events by title, linked item, date, description, and creator fields', async () => {
    const user = userEvent.setup();

    renderEventsPage([
      createEvent(),
      createEvent({
        item_event_id: 2,
        title: 'Album labels revised',
        item_title: 'Annotated Photo Album',
        description: 'Timo updated the names attached to older reunion photos.',
        occurred_on: '2026-03-18',
        created_by_username: 'timo',
        owner_username: 'natalie',
      }),
    ]);

    const searchInput = screen.getByLabelText(/search events/i);

    await user.type(searchInput, 'annotated photo album');
    expect(screen.getByText(/album labels revised/i)).toBeInTheDocument();
    expect(screen.queryByText(/cataloged from family memory/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, '2026-03-01');
    expect(screen.getByText(/cataloged from family memory/i)).toBeInTheDocument();
    expect(screen.queryByText(/album labels revised/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'timo');
    expect(screen.getByText(/album labels revised/i)).toBeInTheDocument();
    expect(screen.queryByText(/cataloged from family memory/i)).not.toBeInTheDocument();
  });

  test('renders the event image area and falls back to a no-image placeholder', () => {
    renderEventsPage([
      createEvent({
        photo_url: 'https://example.com/event.jpg',
      }),
      createEvent({
        item_event_id: 2,
        title: 'Archive Move',
        photo_url: '',
      }),
    ]);

    expect(screen.getByRole('img', { name: /cataloged from family memory/i })).toHaveAttribute('src', 'https://example.com/event.jpg');
    expect(screen.getByText(/^no image$/i)).toBeInTheDocument();
  });

  test('shows an empty filtered state when no events match the search term', async () => {
    const user = userEvent.setup();

    renderEventsPage([createEvent()]);

    await user.type(screen.getByLabelText(/search events/i), 'not-a-match');

    expect(screen.getByText(/no matching events/i)).toBeInTheDocument();
    expect(screen.queryByText(/cataloged from family memory/i)).not.toBeInTheDocument();
  });
});
