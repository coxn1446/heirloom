import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FamiliesPageContent } from '../components/Catalog/FamiliesPageContent';

function createFamily(overrides = {}) {
  return {
    family_id: 1,
    name: 'Archive Council',
    description: 'A cross-branch family group for shared records and restored objects.',
    member_count: 4,
    my_role: 'member',
    photo_url: '',
    ...overrides,
  };
}

function renderFamiliesPage(families) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FamiliesPageContent families={families} />
    </MemoryRouter>
  );
}

describe('FamiliesPageContent', () => {
  test('filters families by name and description', async () => {
    const user = userEvent.setup();

    renderFamiliesPage([
      createFamily(),
      createFamily({
        family_id: 2,
        name: 'Cousins Correspondence',
        description: 'Letters, meal traditions, and reunion planning notes.',
      }),
    ]);

    const searchInput = screen.getByLabelText(/search families/i);

    await user.type(searchInput, 'cousins');
    expect(screen.getByText(/cousins correspondence/i)).toBeInTheDocument();
    expect(screen.queryByText(/archive council/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'restored objects');
    expect(screen.getByText(/archive council/i)).toBeInTheDocument();
    expect(screen.queryByText(/cousins correspondence/i)).not.toBeInTheDocument();
  });

  test('renders the family image area and falls back to a no-image placeholder', () => {
    renderFamiliesPage([
      createFamily({
        photo_url: 'https://example.com/family.jpg',
      }),
      createFamily({
        family_id: 2,
        name: 'No Image Family',
        photo_url: '',
      }),
    ]);

    expect(screen.getByRole('img', { name: /archive council/i })).toHaveAttribute('src', 'https://example.com/family.jpg');
    expect(screen.getByText(/^no image$/i)).toBeInTheDocument();
  });

  test('shows an empty filtered state when no families match the search term', async () => {
    const user = userEvent.setup();

    renderFamiliesPage([createFamily()]);

    await user.type(screen.getByLabelText(/search families/i), 'not-a-match');

    expect(screen.getByText(/no matching families/i)).toBeInTheDocument();
    expect(screen.queryByText(/archive council/i)).not.toBeInTheDocument();
  });
});
