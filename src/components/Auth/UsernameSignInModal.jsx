import React from 'react';

export function UsernameSignInModal({ isOpen, username, onClose, onSubmit, onUsernameChange }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heirloom-earthy/40 px-4 py-8">
      <div role="dialog" aria-modal="true" aria-labelledby="username-sign-in-title" className="heirloom-panel w-full max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Enter the archive</p>
            <h2 id="username-sign-in-title" className="mt-2 text-2xl font-semibold text-heirloom-earthy">
              Sign in with a username
            </h2>
            <p className="mt-3 text-sm leading-6 text-heirloom-earthy/80">
              This mock shell creates a username-only account in the browser so you can explore the catalog flow without passwords.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-heirloom-earthy/70">
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-heirloom-earthy">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              autoComplete="username"
              autoFocus
              placeholder="e.g. william"
              onChange={(event) => onUsernameChange(event.target.value)}
              className="heirloom-input mt-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="heirloom-button heirloom-button-secondary">
              Cancel
            </button>
            <button type="submit" className="heirloom-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
