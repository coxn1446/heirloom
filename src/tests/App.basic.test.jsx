import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import { AppRoutes } from '../components/App';

function renderWithProviders(route = '/') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>
  );
}

describe('App shell', () => {
  test('renders home content', async () => {
    renderWithProviders('/');
    expect(await screen.findByRole('heading', { name: /heirloom/i })).toBeInTheDocument();
  });
});
