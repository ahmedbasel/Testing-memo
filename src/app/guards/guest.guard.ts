import { AuthService } from './../services/auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const guestGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return new Promise<boolean>((resolve) => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      unsubscribe();

      if (user) {
        router.navigate(['/dashboard']);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};