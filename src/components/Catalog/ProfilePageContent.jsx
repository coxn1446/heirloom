import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/auth.reducer';
import { resetCatalog } from '../../store/catalog.reducer';
import { resetFamilies } from '../../store/family.reducer';
import { logout as logoutHelper } from '../../helpers/authHelpers';

export function ProfilePageContent({ viewer, profileUser, profileFamilies, profileItems, profileEvents, isOwnProfile }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileInitial = profileUser?.username?.charAt(0)?.toUpperCase() || 'P';

  async function handleLogout() {
    await logoutHelper();
    dispatch(clearAuth());
    dispatch(resetCatalog());
    dispatch(resetFamilies());
    navigate('/', { replace: true });
  }

  if (!profileUser) {
    return (
      <section className="heirloom-panel">
        <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Profile detail</p>
        <h2 className="mt-3 text-2xl font-semibold text-heirloom-earthy">Profile not found</h2>
        <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
          Choose a visible user from a family, item, or event to open their archive profile.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="heirloom-panel">
        <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)] xl:items-start">
          <div className="order-2 xl:order-1">
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Profile detail</p>
            <h1 className="mt-2 text-2xl font-semibold text-heirloom-earthy sm:text-3xl">{profileUser.username}</h1>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="flex-1 text-sm leading-7 text-heirloom-earthy/80">
                {isOwnProfile
                  ? 'Your profile collects the heirlooms you currently own and the timeline entries attached to those objects.'
                  : `${profileUser.username}'s profile collects the heirlooms they currently own and the timeline entries attached to those objects.`}
              </p>
              {isOwnProfile ? (
                <button type="button" onClick={handleLogout} className="heirloom-button shrink-0">
                  Sign out
                </button>
              ) : (
                <Link to={`/profile/${viewer?.user_id || ''}`} className="heirloom-button heirloom-button-secondary shrink-0">
                  View your profile
                </Link>
              )}
            </div>
          </div>
          <div className="order-1 w-full rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40 p-8 xl:order-2">
            <div
              aria-label={`${profileUser.username} profile picture`}
              className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-heirloom-soft-yellow text-6xl font-semibold text-heirloom-tomato"
            >
              {profileInitial}
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-heirloom-earthy/10 bg-white p-3 sm:p-4">
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Families</p>
            <p className="mt-2 text-lg font-semibold text-heirloom-earthy sm:text-xl">{profileFamilies.length}</p>
          </div>
          <div className="rounded-2xl border border-heirloom-earthy/10 bg-white p-3 sm:p-4">
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Owned items</p>
            <p className="mt-2 text-lg font-semibold text-heirloom-earthy sm:text-xl">{profileItems.length}</p>
          </div>
          <div className="rounded-2xl border border-heirloom-earthy/10 bg-white p-3 sm:p-4">
            <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Item events</p>
            <p className="mt-2 text-lg font-semibold text-heirloom-earthy sm:text-xl">{profileEvents.length}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="heirloom-panel">
          <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Families</p>
          <div className="mt-4 space-y-3">
            {profileFamilies.length ? (
              profileFamilies.map((family) => (
              <Link
                key={family.family_id}
                to={`/families/${family.family_id}`}
                className="block rounded-2xl border border-heirloom-earthy/10 bg-white p-4 hover:border-heirloom-sage"
              >
                  <p className="font-semibold text-heirloom-earthy">{family.name}</p>
                  <p className="mt-1 text-sm text-heirloom-earthy/70">
                    {family.members.length} members
                    {family.my_role ? ` · Your role ${family.my_role}` : ''}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl bg-heirloom-beige p-4 text-sm leading-6 text-heirloom-earthy/75">No visible families for this profile yet.</p>
            )}
          </div>
        </section>

        <section className="heirloom-panel">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Owned items</p>
              <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">Objects in this profile</h2>
            </div>
            <span className="shrink-0 rounded-full bg-heirloom-sage/20 px-3 py-1 text-xs font-semibold uppercase text-heirloom-earthy">
              {profileItems.length} items
            </span>
          </div>

          {profileItems.length ? (
            <div className="mt-5 space-y-3">
              {profileItems.map((item) => (
                <Link key={item.item_id} to={`/items/${item.item_id}`} className="block rounded-2xl border border-heirloom-earthy/10 bg-white p-4">
                  <p className="font-semibold text-heirloom-earthy">{item.title}</p>
                  <p className="mt-1 text-sm text-heirloom-earthy/70">{item.type || 'Uncategorized'}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-heirloom-earthy/75">
              {isOwnProfile ? 'No owned items yet.' : 'No visible owned items for this profile yet.'}
            </p>
          )}
        </section>

        <section className="heirloom-panel">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Profile timeline</p>
              <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">Recent events</h2>
            </div>
            <span className="shrink-0 rounded-full bg-heirloom-sage/20 px-3 py-1 text-xs font-semibold uppercase text-heirloom-earthy">
              {profileEvents.length} events
            </span>
          </div>

          {profileEvents.length ? (
            <div className="mt-5 space-y-3">
              {profileEvents.map((entry) => (
                <Link
                  key={`${entry.item_id}-${entry.item_event_id}`}
                  to={`/events/${entry.item_event_id}`}
                  className="block rounded-2xl border border-heirloom-earthy/10 bg-white p-4"
                >
                  <p className="font-semibold text-heirloom-earthy">{entry.title}</p>
                  <p className="mt-1 text-sm text-heirloom-earthy/70">
                    {entry.item_title} · {entry.occurred_on}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-heirloom-earthy/75">
              {isOwnProfile ? 'No events tied to your items yet.' : 'No visible events tied to this profile yet.'}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
