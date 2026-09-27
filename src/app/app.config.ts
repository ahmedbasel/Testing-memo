import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

import { provideRouter } from '@angular/router';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './firebase.config';
import { routes } from './app.routes';

initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    {
      provide: 'FIREBASE_AUTH',
      useFactory: () => getAuth(),
    },

    {
      provide: 'FIRESTORE',
      useFactory: () => getFirestore(),
    },
  ],
};