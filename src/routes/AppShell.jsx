import React from 'react';
import { IonContent, IonPage, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useSelector } from 'react-redux';
import { AppNav } from '../components/Nav/AppNav';

export default function AppShell() {
  const user = useSelector((s) => s.auth.user);

  return (
    <IonPage>
      <AppNav />
      <IonContent fullscreen className="ion-padding">
        <div className="max-w-2xl mx-auto pt-4">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Authenticated shell</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className="text-neutral-700">
                Logged in as <strong>{user?.username}</strong> ({user?.email})
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Replace this view with feature routes. Data layer: <code>src/mockBackend</code> → same shape as a
                future real API.
              </p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
}
