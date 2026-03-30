import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/react';
import toast from 'react-hot-toast';
import { setAuthFromMock } from '../store/auth.reducer';
import { loginWithUsername } from '../helpers/authHelpers';

export default function Login() {
  const [username, setUsername] = useState('demo');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await loginWithUsername(username.trim());
    if (!res.ok) {
      toast.error(res.body?.error || 'Login failed');
      return;
    }
    dispatch(
      setAuthFromMock({
        user: res.body.user,
        isProfileComplete: res.body.isProfileComplete,
      })
    );
    toast.success('Signed in (mock session)');
    navigate(from, { replace: true });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign in</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4 pt-8">
          <IonItem>
            <IonLabel position="stacked">Username</IonLabel>
            <IonInput
              value={username}
              onIonInput={(ev) => setUsername(ev.detail.value || '')}
              autocomplete="username"
            />
          </IonItem>
          <IonButton type="submit" expand="block">
            Continue (mock auth)
          </IonButton>
          <p className="text-sm text-neutral-500">
            No password in this shell — mock only. Try username <code>demo</code>.
          </p>
        </form>
      </IonContent>
    </IonPage>
  );
}
