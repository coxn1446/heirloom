import React from 'react';
import familyIcon from '../../resources/family.png';
import heirloomIcon from '../../resources/heirloom.png';
import timelineIcon from '../../resources/timeline.png';

export function HomePageContent({ onOpenCreate }) {
  const quickActions = [
    {
      key: 'item',
      label: 'Add Heirloom',
      imageSrc: heirloomIcon,
      imageAlt: 'Add heirloom',
    },
    {
      key: 'family',
      label: 'Add Family',
      imageSrc: familyIcon,
      imageAlt: 'Add family',
    },
    {
      key: 'event',
      label: 'Add Event',
      imageSrc: timelineIcon,
      imageAlt: 'Add event',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => onOpenCreate(action.key)}
            className={`heirloom-panel flex h-full flex-col gap-4 text-left transition hover:border-heirloom-sage ${
              action.key === 'item' ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <h2 className="text-xl font-semibold text-heirloom-earthy sm:text-2xl">{action.label}</h2>
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-white p-4">
              <img src={action.imageSrc} alt={action.imageAlt} className="h-28 w-full object-contain sm:h-32 lg:h-40" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
