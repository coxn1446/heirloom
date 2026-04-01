import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateRecordModal } from '../components/Catalog/CreateRecordModal';

describe('CreateRecordModal', () => {
  test('disables quick-create event submission when the user owns no items', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<CreateRecordModal mode="event" isOpen={true} items={[]} onClose={jest.fn()} onSubmit={onSubmit} />);

    expect(screen.getByText(/you need to own an item before you can create an event/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/event name/i), 'Transfer recorded');
    await user.click(screen.getByRole('button', { name: /create event/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
