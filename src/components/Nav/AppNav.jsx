import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NAV_ITEMS = [
  { key: 'home', to: '/', label: 'Home', icon: 'home' },
  { key: 'families', to: '/families', label: 'Families', icon: 'families' },
  { key: 'items', to: '/items', label: 'Items', icon: 'items' },
  { key: 'events', to: '/events', label: 'Events', icon: 'events' },
  { key: 'profile', to: '/profile', label: 'Profile', icon: 'profile' },
];

function NavIcon({ name, className = 'h-5 w-5' }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 4l7.5 6.5v8a1 1 0 0 1-1 1h-4.5v-6h-4v6H5.5a1 1 0 0 1-1-1v-8Z" />
      </svg>
    );
  }

  if (name === 'families') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm8 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4.5 18a3.5 3.5 0 0 1 7 0m1 0a3.5 3.5 0 0 1 7 0" />
      </svg>
    );
  }

  if (name === 'items') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 17 19.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    );
  }

  if (name === 'events') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.5h12M6 12h7m-7 5.5h12" />
        <circle cx="17" cy="12" r="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 18a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

export function AppNav({ activeSection = 'home' }) {
  const user = useSelector((s) => s.auth.user);
  const logoSrc = `${process.env.PUBLIC_URL || ''}/heirloom-header-logo.png`;
  const username = user?.username || 'Profile';
  const profileInitial = username.charAt(0).toUpperCase();

  return (
    <>
      <div className="sticky top-0 z-50 hidden border-b border-heirloom-earthy/15 bg-white shadow-sm lg:block">
        <div className="shell-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3 text-heirloom-earthy no-underline">
            <img src={logoSrc} alt="Heirloom" className="h-14 w-auto" />
            <span className="text-lg text-heirloom-earthy/60">|</span>
            <span className="text-2xl font-semibold text-heirloom-earthy">Heirloom</span>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1">
            <nav aria-label="Desktop navigation" className="flex flex-wrap items-center gap-3 lg:ml-auto">
              {NAV_ITEMS.filter((item) => item.key !== 'home').map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  aria-label={link.key === 'profile' ? `${username} profile` : link.label}
                  className={({ isActive }) =>
                    `inline-flex items-center rounded-full px-3 py-3 text-2xl font-semibold leading-none transition ${
                      isActive
                        ? 'text-heirloom-tomato'
                        : 'text-heirloom-earthy hover:bg-heirloom-beige hover:text-heirloom-tomato'
                    }`
                  }
                >
                  {link.key === 'profile' ? (
                    <span className="flex items-center gap-3">
                      <span>{username}</span>
                      <span className="text-current/70">|</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-heirloom-soft-yellow text-base font-semibold text-heirloom-tomato">
                        {profileInitial}
                      </span>
                    </span>
                  ) : (
                    link.label
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <nav aria-label="Mobile navigation" className="shell-mobile-nav lg:hidden">
        <div className="shell-container grid grid-cols-5 gap-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;

            return (
              <Link
                key={item.key}
                to={item.to}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-heirloom-soft-yellow/60 text-heirloom-tomato'
                    : 'text-heirloom-earthy/70 hover:bg-heirloom-beige hover:text-heirloom-tomato'
                }`}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
