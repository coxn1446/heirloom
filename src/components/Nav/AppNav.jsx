import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../../store/auth.reducer';
import { logout as logoutHelper } from '../../helpers/authHelpers';

export function AppNav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appName = useSelector((s) => s.global.appName);

  async function handleLogout() {
    await logoutHelper();
    dispatch(clearAuth());
    navigate('/login', { replace: true });
  }

  return (
    <IonHeader className="border-b border-neutral-200">
      <IonToolbar color="light">
        <IonTitle className="text-left">
          <Link to="/" className="text-inherit no-underline font-semibold">
            {appName}
          </Link>
        </IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={() => navigate('/app')}>Shell</IonButton>
          <IonButton onClick={handleLogout}>Sign out</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}
