import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from './Loading/LoadingSpinner';
import { PrivateRoute } from './Auth/PrivateRoute';

const Home = lazy(() => import('../routes/Home'));
const Login = lazy(() => import('../routes/Login'));
const AppShell = lazy(() => import('../routes/AppShell'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading route…" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
