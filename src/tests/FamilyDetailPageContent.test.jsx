import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FamilyDetailPageContent } from '../components/Catalog/FamilyDetailPageContent';

function createFamily(overrides = {}) {
  return {
    family_id: 5,
    name: 'Archive Council',
    description: 'A cross-branch family group for shared records and restored objects.',
    member_count: 3,
    my_role: 'admin',
    can_edit: true,
    can_manage_members: true,
    photo_url: '',
    members: [
      { user_id: 1, username: 'william', role: 'admin' },
      { user_id: 2, username: 'timo', role: 'member' },
    ],
    ...overrides,
  };
}

const familyItems = [{ item_id: 1, title: 'Recipe Journal', type: 'Paper Goods' }];
const familyEvents = [{ item_id: 1, item_event_id: 7, item_title: 'Recipe Journal', title: 'Journal cataloged', occurred_on: '2026-03-01' }];

function renderFamilyDetail(props = {}) {
  const onSaveFamily = jest.fn().mockResolvedValue(true);
  const onAddMember = jest.fn().mockResolvedValue(true);

  const view = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FamilyDetailPageContent
        family={createFamily()}
        familyItems={familyItems}
        familyEvents={familyEvents}
        onSaveFamily={onSaveFamily}
        onAddMember={onAddMember}
        {...props}
      />
    </MemoryRouter>
  );

  return {
    ...view,
    onSaveFamily,
    onAddMember,
  };
}

describe('FamilyDetailPageContent', () => {
  test('keeps Save disabled until an admin edits a field, then submits the unified draft payload', async () => {
    const user = userEvent.setup();
    const { onSaveFamily } = renderFamilyDetail();

    expect(screen.getByTestId('family-detail-sticky-header').className).toMatch(/sticky/);

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeDisabled();

    await user.clear(screen.getByLabelText(/family name/i));
    await user.type(screen.getByLabelText(/family name/i), 'Archive Council Updated');

    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(onSaveFamily).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: 5,
        name: 'Archive Council Updated',
        detailsChanged: true,
        imageChanged: false,
      })
    );
  });

  test('activates Save for image drafts and adds members immediately without using Save', async () => {
    const user = userEvent.setup();
    const { onSaveFamily, onAddMember } = renderFamilyDetail();

    await user.upload(
      screen.getByLabelText(/choose image/i),
      new File(['family-image'], 'family-photo.png', { type: 'image/png' })
    );

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeEnabled();

    await user.type(screen.getByLabelText(/add member by username/i), 'helen');
    await user.click(screen.getByRole('button', { name: /add member/i }));

    expect(onAddMember).toHaveBeenCalledWith({
      familyId: 5,
      username: 'helen',
    });
    expect(onSaveFamily).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/add member by username/i)).toHaveValue('');
  });

  test('prevents non-admins from editing family details or adding members', () => {
    renderFamilyDetail({
      family: createFamily({
        my_role: 'member',
        can_edit: false,
        can_manage_members: false,
      }),
    });

    expect(screen.getByLabelText(/family name/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.queryByLabelText(/choose image/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/add member by username/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /add member/i })).toBeDisabled();
    expect(screen.getByText(/only family admins can edit this family/i)).toBeInTheDocument();
    expect(screen.getByText(/only family admins can add members/i)).toBeInTheDocument();
  });
});
