import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ItemsPageContent } from '../components/Catalog/ItemsPageContent';

function createItem(overrides = {}) {
  return {
    item_id: 1,
    title: 'Grandfather Clock',
    type: 'Furniture',
    description: 'Walnut case with a handwritten service note inside.',
    owner_username: 'william',
    photo_url: '',
    visible_families: [{ family_id: 1, name: 'Nash-Stevens' }],
    events: [{ item_event_id: 1 }, { item_event_id: 2 }],
    is_private: false,
    ...overrides,
  };
}

function renderItemsPage(items) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ItemsPageContent items={items} />
    </MemoryRouter>
  );
}

describe('ItemsPageContent', () => {
  test('filters visible heirlooms by family, type, description, and owner fields', async () => {
    const user = userEvent.setup();

    renderItemsPage([
      createItem(),
      createItem({
        item_id: 2,
        title: 'Wedding Silver Set',
        type: 'Tableware',
        description: 'Silver setting discussed for a future sibling split.',
        owner_username: 'timo',
        visible_families: [{ family_id: 2, name: 'Freese-Oddleifson' }],
      }),
    ]);

    const searchInput = screen.getByLabelText(/search heirlooms/i);

    await user.type(searchInput, 'freese');
    expect(screen.getByText(/wedding silver set/i)).toBeInTheDocument();
    expect(screen.queryByText(/grandfather clock/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'tableware');
    expect(screen.getByText(/wedding silver set/i)).toBeInTheDocument();
    expect(screen.queryByText(/grandfather clock/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'handwritten service note');
    expect(screen.getByText(/grandfather clock/i)).toBeInTheDocument();
    expect(screen.queryByText(/wedding silver set/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'timo');
    expect(screen.getByText(/wedding silver set/i)).toBeInTheDocument();
    expect(screen.queryByText(/grandfather clock/i)).not.toBeInTheDocument();
  });

  test('renders the item image area and omits the removed private and event pills', () => {
    renderItemsPage([
      createItem({
        photo_url: 'https://example.com/clock.jpg',
      }),
      createItem({
        item_id: 2,
        title: 'Private Journal',
        photo_url: '',
        is_private: true,
        events: [{ item_event_id: 3 }, { item_event_id: 4 }, { item_event_id: 5 }],
        visible_families: [],
      }),
    ]);

    expect(screen.getByRole('img', { name: /grandfather clock/i })).toHaveAttribute('src', 'https://example.com/clock.jpg');
    expect(screen.getByText(/no image/i)).toBeInTheDocument();
    expect(screen.queryByText(/^private$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^3 events$/i)).not.toBeInTheDocument();
  });

  test('shows an empty filtered state when no items match the search term', async () => {
    const user = userEvent.setup();

    renderItemsPage([createItem()]);

    await user.type(screen.getByLabelText(/search heirlooms/i), 'not-in-the-archive');

    expect(screen.getByText(/no matching heirlooms/i)).toBeInTheDocument();
    expect(screen.queryByText(/grandfather clock/i)).not.toBeInTheDocument();
  });
});
