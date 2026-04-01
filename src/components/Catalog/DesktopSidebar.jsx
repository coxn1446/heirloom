import React from 'react';
import { Link } from 'react-router-dom';

export function DesktopSidebar({ families, recentItems, selectedFamilyId, selectedItemId }) {
  return (
    <aside className="shell-app-sidebar hidden xl:block">
      <section className="heirloom-panel flex h-full flex-col overflow-hidden p-4">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <h2 className="text-lg font-semibold text-heirloom-earthy">Families</h2>

          <div className="mt-3 space-y-2">
            {families.map((family) => {
              const isSelected = String(selectedFamilyId) === String(family.family_id);

              return (
                <Link
                  key={family.family_id}
                  to={`/families/${family.family_id}`}
                  className={`block rounded-xl border px-3 py-2 transition ${
                    isSelected
                      ? 'border-heirloom-tomato bg-heirloom-soft-yellow/60'
                      : 'border-heirloom-earthy/10 bg-white hover:border-heirloom-sage'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-heirloom-earthy">{family.name}</p>
                      <p className="mt-1 text-xs text-heirloom-earthy/70">{family.member_count} members</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 border-t border-heirloom-earthy/10 pt-4">
            <h2 className="text-lg font-semibold text-heirloom-earthy">Latest Heirlooms</h2>

            <div className="mt-3 space-y-2">
              {recentItems.map((item) => {
                const isSelected = String(selectedItemId) === String(item.item_id);

                return (
                  <Link
                    key={item.item_id}
                    to={`/items/${item.item_id}`}
                    className={`block rounded-xl border px-3 py-2 transition ${
                      isSelected
                        ? 'border-heirloom-tomato bg-heirloom-soft-yellow/60'
                        : 'border-heirloom-earthy/10 bg-white hover:border-heirloom-sage'
                    }`}
                  >
                    <p className="text-sm font-semibold text-heirloom-earthy">{item.title}</p>
                    <p className="mt-1 text-xs text-heirloom-earthy/70">{item.type || 'Uncategorized'}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
