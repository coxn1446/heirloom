import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingSpinner } from './Loading/LoadingSpinner';

const Home = lazy(() => import('../routes/Home'));
const AppShell = lazy(() => import('../routes/AppShell'));

function RootPage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <AppShell page="home" /> : <Home />;
}

function AuthenticatedPage({ page }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <AppShell page={page} /> : <Navigate to="/" replace />;
}

export function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const appShell = document.querySelector('ion-app');
    const ionContent = document.querySelector('ion-content');
    const firstButton = document.querySelector('button');
    const firstInput = document.querySelector('input');

    console.log('[font-debug] route', location.pathname);
    console.log('[font-debug] body', window.getComputedStyle(document.body).fontFamily);
    console.log('[font-debug] ion-app', appShell ? window.getComputedStyle(appShell).fontFamily : 'missing');
    console.log('[font-debug] ion-content', ionContent ? window.getComputedStyle(ionContent).fontFamily : 'missing');
    console.log('[font-debug] button', firstButton ? window.getComputedStyle(firstButton).fontFamily : 'missing');
    console.log('[font-debug] input', firstInput ? window.getComputedStyle(firstInput).fontFamily : 'missing');
  }, [location.pathname]);

  return (
    <Suspense fallback={<LoadingSpinner label="Loading route…" />}>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/families" element={<AuthenticatedPage page="families" />} />
        <Route path="/families/:familyId" element={<AuthenticatedPage page="familyDetail" />} />
        <Route path="/items" element={<AuthenticatedPage page="items" />} />
        <Route path="/items/:itemId" element={<AuthenticatedPage page="itemDetail" />} />
        <Route path="/events" element={<AuthenticatedPage page="events" />} />
        <Route path="/events/:eventId" element={<AuthenticatedPage page="eventDetail" />} />
        <Route path="/profile" element={<AuthenticatedPage page="profile" />} />
        <Route path="/profile/:userId" element={<AuthenticatedPage page="profile" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
