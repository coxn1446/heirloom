import React from 'react';
import { IonSpinner } from '@ionic/react';

export function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-neutral-600">
      <IonSpinner name="crescent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
