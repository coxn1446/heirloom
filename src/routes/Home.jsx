import React from 'react';
import { Link } from 'react-router-dom';
import { IonContent, IonPage, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

export default function Home() {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="max-w-lg mx-auto pt-10">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Heirloom</h1>
          <p className="text-neutral-600 mb-6">
            Frontend-only shell for Surge. The mock backend in <code className="text-sm bg-neutral-100 px-1 rounded">src/mockBackend</code>{' '}
            mimics Express + PostgreSQL for local UX.
          </p>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Get started</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="flex flex-col gap-3">
              <Link to="/login" className="text-blue-600 underline">
                Sign in (demo user: <strong>demo</strong>)
              </Link>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
}
