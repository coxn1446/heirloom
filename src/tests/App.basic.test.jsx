import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { store } from '../store';
import { AppRoutes } from '../components/App';
import { clearAuth } from '../store/auth.reducer';
import { resetCatalog } from '../store/catalog.reducer';
import { resetFamilies } from '../store/family.reducer';
import { logout } from '../helpers/authHelpers';
import { resetMockDb } from '../mockBackend/db';

function setViewportWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

function renderWithProviders(route = '/') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>
  );
}

async function openSignInModal(user) {
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  return screen.findByRole('dialog', { name: /sign in with a username/i });
}

async function loginAs(user, username = 'william') {
  await openSignInModal(user);
  await user.type(await screen.findByLabelText(/^Username$/i), username);
  await user.click(screen.getByRole('button', { name: /submit/i }));
}

describe('App shell', () => {
  beforeEach(async () => {
    setViewportWidth(390);
    resetMockDb();
    await logout();
    store.dispatch(clearAuth());
    store.dispatch(resetCatalog());
    store.dispatch(resetFamilies());
  });

  test('renders the root login experience', async () => {
    renderWithProviders('/');
    const heading = await screen.findByRole('heading', { name: /heirloom/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Username$/i)).not.toBeInTheDocument();
    const logo = screen.getByRole('img', { name: /heirloom/i });
    expect(logo).toHaveAttribute('src', expect.stringContaining('heirloom-logo.png'));
    const carousel = screen.getByTestId('mobile-how-it-works-carousel');
    expect(carousel).toHaveClass('snap-x', 'overflow-x-auto');
    expect(within(carousel).getByRole('img', { name: /camera and keepsakes/i })).toBeInTheDocument();
    expect(within(carousel).getByRole('img', { name: /open storybook/i })).toBeInTheDocument();
    expect(within(carousel).getByRole('img', { name: /family photo sharing/i })).toBeInTheDocument();
  });

  test('renders the desktop landing sign-in form and desktop feature artwork', async () => {
    setViewportWidth(1280);

    renderWithProviders('/');

    expect(await screen.findByRole('heading', { name: /heirloom/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^sign in$/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /camera and keepsakes/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /open storybook/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /family photo sharing/i })).toBeInTheDocument();
  });

  test('logs in with a typed username and shows the app shell', async () => {
    const user = userEvent.setup();

    renderWithProviders('/');

    await loginAs(user);

    expect(await screen.findByRole('button', { name: /add heirloom/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add family/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /add heirloom/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /add family/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /add event/i })).toBeInTheDocument();
  });

  test('keeps the modal open and shows an error when username is empty', async () => {
    const user = userEvent.setup();
    const toastErrorSpy = jest.spyOn(toast, 'error').mockImplementation(() => {});

    try {
      renderWithProviders('/');

      await openSignInModal(user);
      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(toastErrorSpy).toHaveBeenCalledWith('Enter a username to continue');
      expect(screen.getByRole('dialog', { name: /sign in with a username/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add heirloom/i })).not.toBeInTheDocument();
    } finally {
      toastErrorSpy.mockRestore();
    }
  });

  test('renders the login flow and app shell without scroll-related console errors', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      renderWithProviders('/');

      await loginAs(user);

      expect(await screen.findByRole('button', { name: /add heirloom/i })).toBeInTheDocument();

      const errorMessages = consoleErrorSpy.mock.calls.flat().map(String).join('\n');
      expect(errorMessages).not.toMatch(/window\.scrollTo/);
      expect(errorMessages).not.toMatch(/`scrollY` prop/);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  test('supports authenticated navigation between the main desktop routes', async () => {
    const user = userEvent.setup();

    renderWithProviders('/');

    await loginAs(user);

    expect(await screen.findByRole('button', { name: /add heirloom/i })).toBeInTheDocument();

    const desktopNav = screen.getByRole('navigation', { name: /desktop navigation/i });
    const getMobileNav = () => screen.getByRole('navigation', { name: /mobile navigation/i });

    expect(within(desktopNav).getByRole('link', { name: /william profile/i })).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Home$/i })).toHaveAttribute('aria-current', 'page');
    expect(within(getMobileNav()).getByRole('link', { name: /^Families$/i })).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Items$/i })).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Events$/i })).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Profile$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();

    await user.click(within(getMobileNav()).getByRole('link', { name: /^Families$/i }));
    expect(await screen.findByLabelText(/search families/i)).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Families$/i })).toHaveAttribute('aria-current', 'page');

    await user.click(within(getMobileNav()).getByRole('link', { name: /^Items$/i }));
    expect(await screen.findByLabelText(/search heirlooms/i)).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Items$/i })).toHaveAttribute('aria-current', 'page');

    await user.click(within(getMobileNav()).getByRole('link', { name: /^Events$/i }));
    expect(await screen.findByLabelText(/search events/i)).toBeInTheDocument();
    expect(within(getMobileNav()).getByRole('link', { name: /^Events$/i })).toHaveAttribute('aria-current', 'page');

    await user.click(within(getMobileNav()).getByRole('link', { name: /^Profile$/i }));
    expect(await screen.findByRole('heading', { name: /^william$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/william profile picture/i)).toHaveTextContent('W');
    expect(screen.getByRole('heading', { name: /objects in this profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  test('clicking a username opens that user profile', async () => {
    const user = userEvent.setup();

    renderWithProviders('/');

    await loginAs(user, 'demo');
    await screen.findByRole('button', { name: /add heirloom/i });

    await user.click(within(screen.getByRole('navigation', { name: /mobile navigation/i })).getByRole('link', { name: /^Items$/i }));
    expect(await screen.findByLabelText(/search heirlooms/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/recipe journal/i)).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole('link', { name: /^timo$/i })[0]);

    const mainContent = screen.getByRole('main');
    expect(await screen.findByRole('heading', { name: /^timo$/i })).toBeInTheDocument();
    expect(screen.getByText(/timo's profile collects the heirlooms they currently own/i)).toBeInTheDocument();
    expect(within(mainContent).getAllByRole('link', { name: /wedding toast glasses/i }).length).toBeGreaterThan(0);
    expect(within(mainContent).queryByRole('link', { name: /recipe journal/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view your profile/i })).toBeInTheDocument();
  });

  test('quick-creates a family and routes to its detail page', async () => {
    const user = userEvent.setup();

    renderWithProviders('/');

    await loginAs(user);
    await screen.findByRole('button', { name: /add heirloom/i });

    await user.click(screen.getByRole('button', { name: /add family/i }));
    expect(await screen.findByLabelText(/family name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/family name/i), 'William Cousins');
    await user.click(screen.getByRole('button', { name: /create family/i }));

    const familyHeader = await screen.findByTestId('family-detail-sticky-header');
    expect(within(familyHeader).getByLabelText(/family name/i)).toHaveValue('William Cousins');
    expect(within(familyHeader).getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(within(screen.getByRole('navigation', { name: /mobile navigation/i })).getByRole('link', { name: /^Families$/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('quick-creates an item and routes to its detail page', async () => {
    const user = userEvent.setup();

    renderWithProviders('/');

    await loginAs(user);
    await screen.findByRole('button', { name: /add heirloom/i });

    await user.click(screen.getByRole('button', { name: /add heirloom/i }));
    expect(await screen.findByRole('heading', { name: /add item/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/item name/i), 'Grandmother Quilt');
    await user.click(screen.getByRole('button', { name: /create item/i }));

    expect(await screen.findByLabelText(/heirloom title/i)).toHaveValue('Grandmother Quilt');
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    expect(screen.getByRole('heading', { name: /timeline/i })).toBeInTheDocument();
  });

  test('quick-creates an event and routes to its detail page', async () => {
    const user = userEvent.setup();

    renderWithProviders('/');

    await loginAs(user);
    await screen.findByRole('button', { name: /add heirloom/i });

    await user.click(screen.getByRole('button', { name: /add event/i }));
    expect(await screen.findByLabelText(/event name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/event name/i), 'Moved into archive');
    await user.click(screen.getByRole('button', { name: /create event/i }));

    const eventHeader = await screen.findByTestId('event-detail-sticky-header');
    expect(within(eventHeader).getByLabelText(/event title/i)).toHaveValue('Moved into archive');
    expect(within(eventHeader).getByRole('button', { name: /^save$/i })).toBeDisabled();
  });
});
