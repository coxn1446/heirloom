import '@testing-library/jest-dom';

jest.mock('@ionic/react', () => {
  const React = require('react');
  const passthrough = (tag = 'div') =>
    React.forwardRef(({ children, scrollY, ...props }, ref) =>
      React.createElement(tag, { ref, ...props }, children)
    );

  return {
    setupIonicReact: jest.fn(),
    IonApp: passthrough('div'),
    IonPage: passthrough('div'),
    IonContent: passthrough('div'),
    IonHeader: passthrough('header'),
    IonToolbar: passthrough('div'),
    IonTitle: passthrough('h2'),
    IonButtons: passthrough('div'),
    IonButton: passthrough('button'),
    IonItem: passthrough('div'),
    IonLabel: passthrough('label'),
    IonInput: passthrough('input'),
    IonCard: passthrough('section'),
    IonCardHeader: passthrough('div'),
    IonCardTitle: passthrough('h3'),
    IonCardContent: passthrough('div'),
    IonSpinner: passthrough('div'),
  };
});

Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});
