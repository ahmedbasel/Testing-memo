import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: 'login',
    title: 'Login | Quality Control',
    loadComponent: () =>
      import('./pages/login/login').then(
        (m) => m.Login
      ),
    canActivate: [guestGuard],
  },

  {
    path: 'signup',
    title: 'Create Account | Quality Control',
    loadComponent: () =>
      import('./pages/signup/signup').then(
        (m) => m.Signup
      ),
    canActivate: [guestGuard],
  },

  {
    path: 'dashboard',
    title: 'Dashboard | Quality Control',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(
        (m) => m.Dashboard
      ),
    canActivate: [authGuard],
  },

  {
    path: 'testing-memo',
    title: 'Testing Memo | Quality Control',
    loadComponent: () =>
      import('./pages/testing-memo/testing-memo').then(
        (m) => m.TestingMemo
      ),
    canActivate: [authGuard],
  },

  {
    path: 'quality-response',
    title: 'Quality Response | Quality Control',
    loadComponent: () =>
      import('./pages/quality-response/quality-response').then(
        (m) => m.QualityResponse
      ),
    canActivate: [authGuard],
  },

  {
    path: 'history',
    title: 'History | Quality Control',
    loadComponent: () =>
      import('./pages/history/history').then(
        (m) => m.History
      ),
    canActivate: [authGuard],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
