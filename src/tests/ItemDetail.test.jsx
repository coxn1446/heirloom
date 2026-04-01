import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ItemDetail } from '../components/Catalog/ItemDetail';

function createItem(overrides = {}) {
  return {
    item_id: 7,
    owner_user_id: 1,
    owner_username: 'william',
    title: 'Archive Clock',
    type: 'Furniture',
    description: 'Tall clock from the front hall.',
    year_made: '1902',
    date_received: '2026-03-10',
    photo_url: '',
    visible_families: [
      { family_id: 11, name: 'Nash Archive' },
    ],
    transfer_candidates: [
      { user_id: 1, username: 'william' },
      { user_id: 2, username: 'demo' },
      { user_id: 3, username: 'natalie' },
    ],
    is_private: false,
    events: [
      {
        item_event_id: 2,
        title: 'Restored',
        description: 'Cleaned and tuned.',
        occurred_on: '2026-03-20',
        new_owner_username: '',
      },
      {
        item_event_id: 1,
        title: 'Received item',
        description: '',
        occurred_on: '2026-03-10',
        new_owner_username: '',
      },
    ],
    ...overrides,
  };
}

const families = [
  { family_id: 11, name: 'Nash Archive', description: 'Primary branch' },
  { family_id: 12, name: 'Stevens Branch', description: 'Secondary branch' },
];

function renderItemDetail(props = {}) {
  const onSaveItem = jest.fn().mockResolvedValue(true);
  const onAddEvent = jest.fn().mockResolvedValue(true);

  const view = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ItemDetail
        item={createItem()}
        families={families}
        currentUserId={1}
        onSaveItem={onSaveItem}
        onAddEvent={onAddEvent}
        {...props}
      />
    </MemoryRouter>
  );

  return {
    ...view,
    onSaveItem,
    onAddEvent,
  };
}

describe('ItemDetail', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: jest.fn(),
    });
  });

  test('keeps Save disabled until the owner edits a field, then submits the changed draft', async () => {
    const user = userEvent.setup();
    const { onSaveItem } = renderItemDetail();

    expect(screen.getByTestId('item-detail-sticky-header').className).toMatch(/sticky/);

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton.className).toMatch(/heirloom-button-secondary/);

    await user.clear(screen.getByLabelText(/heirloom title/i));
    await user.type(screen.getByLabelText(/heirloom title/i), 'Archive Clock Updated');

    expect(saveButton).toBeEnabled();
    expect(saveButton.className).not.toMatch(/heirloom-button-secondary/);

    await user.click(saveButton);

    expect(onSaveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 7,
        title: 'Archive Clock Updated',
        detailsChanged: true,
        familiesChanged: false,
        imageChanged: false,
      })
    );
  });

  test('activates Save for family and image drafts and sends them in the unified payload', async () => {
    const user = userEvent.setup();
    const { onSaveItem } = renderItemDetail();

    await user.click(screen.getByLabelText(/stevens branch/i));
    await user.upload(
      screen.getByLabelText(/choose image/i),
      new File(['image-bytes'], 'clock.png', { type: 'image/png' })
    );

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(onSaveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 7,
        familyIds: [11, 12],
        familiesChanged: true,
        imageChanged: true,
        imageFile: expect.objectContaining({ name: 'clock.png' }),
      })
    );
  });

  test('drops unsaved draft changes when the component remounts', async () => {
    const user = userEvent.setup();
    const firstRender = renderItemDetail();

    await user.clear(screen.getByLabelText(/heirloom title/i));
    await user.type(screen.getByLabelText(/heirloom title/i), 'Unsaved Draft');
    expect(screen.getByLabelText(/heirloom title/i)).toHaveValue('Unsaved Draft');

    firstRender.unmount();
    renderItemDetail();

    expect(screen.getByLabelText(/heirloom title/i)).toHaveValue('Archive Clock');
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
  });

  test('creates timeline events immediately without using the top Save action and can capture a new owner', async () => {
    const user = userEvent.setup();
    const { onSaveItem, onAddEvent } = renderItemDetail();

    await user.type(screen.getByLabelText(/event title/i), 'Moved to study');
    await user.type(screen.getByLabelText(/event date/i), '2026-03-25');
    await user.selectOptions(screen.getByLabelText(/new owner/i), '2');
    await user.type(screen.getByLabelText(/event details/i), 'Placed beside the writing desk.');
    await user.click(screen.getByRole('button', { name: /add event/i }));

    expect(onAddEvent).toHaveBeenCalledWith({
      itemId: 7,
      title: 'Moved to study',
      description: 'Placed beside the writing desk.',
      occurredOn: '2026-03-25',
      newOwnerUserId: 2,
    });
    expect(onSaveItem).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/new owner/i)).toHaveValue('');
  });

  test('renders timeline events from oldest on the left to newest on the right', () => {
    renderItemDetail();

    const eventLinks = screen
      .getAllByRole('link')
      .filter((link) => /received item|restored/i.test(link.textContent || ''));

    expect(eventLinks).toHaveLength(2);
    expect(eventLinks[0]).toHaveTextContent(/received item/i);
    expect(eventLinks[1]).toHaveTextContent(/restored/i);
  });

  test('scrolls the timeline viewport to the latest event on load and when events update', () => {
    const { rerender } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ItemDetail
          item={createItem()}
          families={families}
          currentUserId={1}
          onSaveItem={jest.fn().mockResolvedValue(true)}
          onAddEvent={jest.fn().mockResolvedValue(true)}
        />
      </MemoryRouter>
    );

    const scrollRegion = screen.getByTestId('timeline-scroll-region');
    expect(scrollRegion.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: 'smooth',
      })
    );

    rerender(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ItemDetail
          item={createItem({
            events: [
              ...createItem().events,
              {
                item_event_id: 3,
                title: 'Moved to study',
                description: '',
                occurred_on: '2026-03-25',
                new_owner_username: '',
              },
            ],
          })}
          families={families}
          currentUserId={1}
          onSaveItem={jest.fn().mockResolvedValue(true)}
          onAddEvent={jest.fn().mockResolvedValue(true)}
        />
      </MemoryRouter>
    );

    expect(scrollRegion.scrollTo).toHaveBeenCalledTimes(2);
  });

  test('prevents non-owners from editing the item detail draft fields', () => {
    renderItemDetail({
      currentUserId: 2,
    });

    expect(screen.getByLabelText(/heirloom title/i)).toBeDisabled();
    expect(screen.getByLabelText(/type/i)).toBeDisabled();
    expect(screen.getByLabelText(/nash archive/i)).toBeDisabled();
    expect(screen.getByLabelText(/event title/i)).toBeDisabled();
    expect(screen.getByLabelText(/event date/i)).toBeDisabled();
    expect(screen.getByLabelText(/new owner/i)).toBeDisabled();
    expect(screen.getByLabelText(/event details/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /add event/i })).toBeDisabled();
    expect(screen.queryByLabelText(/choose image/i)).not.toBeInTheDocument();
    expect(screen.getByText(/only the item owner can add timeline events/i)).toBeInTheDocument();
  });

  test('adds overflow guards around mobile-sensitive detail and event form fields', () => {
    renderItemDetail();

    expect(screen.getByTestId('item-detail-basic-grid').className).toMatch(/grid/);
    expect(screen.getByTestId('item-detail-add-event-form').className).toMatch(/min-w-0/);
    expect(screen.getByTestId('item-date-received-field').className).toMatch(/overflow-hidden/);
    expect(screen.getByTestId('item-event-date-field').className).toMatch(/overflow-hidden/);
    expect(screen.getByLabelText(/new owner/i).closest('div')?.className).toMatch(/min-w-0/);
  });
});
