import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupIonicReact } from '@ionic/react';
import { IonApp } from '@ionic/react';
import '@ionic/react/css/core.css';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { NativeProvider } from './utils/NativeContext';
import { AppRoutes } from './components/App';
import './index.css';

setupIonicReact();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <NativeProvider>
        <BrowserRouter>
          <IonApp>
            <AppRoutes />
            <Toaster position="top-center" />
          </IonApp>
        </BrowserRouter>
      </NativeProvider>
    </Provider>
  </React.StrictMode>
);
