import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth'; 

export const authGuard = () => {

  const router = inject(Router);
  const authService = inject(AuthService);

  return new Promise<boolean>((resolve) => {

    const unsubscribe = authService.onAuthStateChanged((user) => {

      unsubscribe();

      if (user) {

        resolve(true);

      } else {

        router.navigate(['/login']);
        resolve(false);

      }

    });

  });

};