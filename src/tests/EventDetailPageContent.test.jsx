import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EventDetailPageContent } from '../components/Catalog/EventDetailPageContent';

function createEvent(overrides = {}) {
  return {
    item_event_id: 9,
    item_id: 2,
    title: 'Album labels revised',
    description: 'Updated names attached to older reunion photos.',
    occurred_on: '2026-03-18',
    photo_url: '',
    created_by_username: 'timo',
    owner_username: 'natalie',
    new_owner_user_id: null,
    new_owner_username: '',
    can_edit: true,
    ...overrides,
  };
}

const items = [
  {
    item_id: 1,
    title: 'Recipe Journal',
    transfer_candidates: [
      { user_id: 1, username: 'demo' },
      { user_id: 2, username: 'timo' },
    ],
  },
  {
    item_id: 2,
    title: 'Annotated Photo Album',
    transfer_candidates: [
      { user_id: 2, username: 'timo' },
      { user_id: 3, username: 'natalie' },
      { user_id: 4, username: 'samantha' },
    ],
  },
];

function renderEventDetail(props = {}) {
  const onSaveEvent = jest.fn().mockResolvedValue(true);

  const view = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <EventDetailPageContent eventRecord={createEvent()} items={items} onSaveEvent={onSaveEvent} {...props} />
    </MemoryRouter>
  );

  return {
    ...view,
    onSaveEvent,
  };
}

describe('EventDetailPageContent', () => {
  test('keeps Save disabled until the creator edits a field, then submits the unified draft payload', async () => {
    const user = userEvent.setup();
    const { onSaveEvent } = renderEventDetail();

    expect(screen.getByTestId('event-detail-sticky-header').className).toMatch(/sticky/);

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeDisabled();

    await user.clear(screen.getByLabelText(/event title/i));
    await user.type(screen.getByLabelText(/event title/i), 'Album labels updated');
    await user.selectOptions(screen.getByLabelText(/new owner/i), '4');

    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(onSaveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        itemEventId: 9,
        title: 'Album labels updated',
        newOwnerUserId: 4,
        detailsChanged: true,
        imageChanged: false,
      })
    );
  });

  test('activates Save for image drafts and linked-item changes', async () => {
    const user = userEvent.setup();
    const { onSaveEvent } = renderEventDetail();

    await user.selectOptions(screen.getByLabelText(/^item$/i), '1');
    await user.upload(
      screen.getByLabelText(/choose image/i),
      new File(['event-image'], 'event-photo.png', { type: 'image/png' })
    );

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(onSaveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 1,
        imageChanged: true,
        imageFile: expect.objectContaining({ name: 'event-photo.png' }),
      })
    );
  });

  test('prevents non-creators from editing the event detail draft fields', () => {
    renderEventDetail({
      eventRecord: createEvent({
        can_edit: false,
      }),
    });

    expect(screen.getByLabelText(/event title/i)).toBeDisabled();
    expect(screen.getByLabelText(/^item$/i)).toBeDisabled();
    expect(screen.getByLabelText(/date/i)).toBeDisabled();
    expect(screen.getByLabelText(/new owner/i)).toBeDisabled();
    expect(screen.getByLabelText(/story/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.queryByLabelText(/choose image/i)).not.toBeInTheDocument();
    expect(screen.getByText(/only the event creator can edit this event/i)).toBeInTheDocument();
  });

  test('adds overflow guards around mobile-sensitive event detail fields and metadata', () => {
    renderEventDetail();

    expect(screen.getByTestId('event-detail-basic-grid').className).toMatch(/grid/);
    expect(screen.getByLabelText(/^item$/i).closest('div')?.className).toMatch(/min-w-0/);
    expect(screen.getByTestId('event-date-field').className).toMatch(/overflow-hidden/);
    expect(screen.getByLabelText(/new owner/i).closest('div')?.className).toMatch(/min-w-0/);
    expect(screen.getByTestId('event-detail-meta-row').className).toMatch(/flex-wrap/);
  });
});
