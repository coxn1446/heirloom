import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

export function FamiliesPageContent({ families }) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeSearchValue(searchTerm);
  const filteredFamilies = useMemo(() => {
    if (!normalizedSearchTerm) {
      return families;
    }

    return families.filter((family) =>
      [family.name, family.description].some((value) => normalizeSearchValue(value).includes(normalizedSearchTerm))
    );
  }, [families, normalizedSearchTerm]);

  return (
    <section className="space-y-6">
      <div className="heirloom-panel">
        <label htmlFor="families-search" className="block text-sm font-medium text-heirloom-earthy">
          Search families
        </label>
        <input
          id="families-search"
          type="search"
          className="heirloom-input mt-2"
          placeholder="Search by family name or description"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {families.length ? (
        <div className="space-y-4">
          {filteredFamilies.length ? (
            filteredFamilies.map((family) => (
              <Link key={family.family_id} to={`/families/${family.family_id}`} className="block heirloom-panel">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-widest text-heirloom-earthy/60">Family</p>
                    <h2 className="mt-2 text-2xl font-semibold text-heirloom-earthy">{family.name}</h2>
                    <p className="mt-2 text-sm text-heirloom-earthy/70">
                      {family.member_count} members · Your role: {family.my_role || 'member'}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-heirloom-earthy/75">
                      {family.description || 'Open this family to add a description, an image, and manage who belongs to it.'}
                    </p>
                  </div>
                  <div className="ml-auto h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-heirloom-earthy/10 bg-heirloom-beige/40">
                    {family.photo_url ? (
                      <img src={family.photo_url} alt={family.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-heirloom-earthy/60">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="heirloom-panel">
              <p className="text-lg font-semibold text-heirloom-earthy">No matching families</p>
              <p className="mt-2 text-sm leading-6 text-heirloom-earthy/75">
                Try a different search term for the family name or description.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="heirloom-panel">
          <p className="text-lg font-semibold text-heirloom-earthy">No families yet</p>
          <p className="mt-2 text-sm leading-6 text-heirloom-earthy/75">
            Create your first family to start organizing who should see which heirlooms.
          </p>
        </div>
      )}
    </section>
  );
}
