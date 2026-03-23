import type { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard, adminGuard, AuthService } from '@office-lunch/auth';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@office-lunch/feature-login').then((m) => m.LoginComponent),
  },
  {
    path: 'departure',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@office-lunch/feature-departure').then((m) => m.DepartureComponent),
  },
  {
    path: 'voting',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@office-lunch/feature-voting').then((m) => m.VotingComponent),
  },
  {
    path: 'ordering',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@office-lunch/feature-ordering').then((m) => m.OrderingComponent),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('@office-lunch/feature-admin').then((m) => m.UserManagementComponent),
  },
  {
    path: 'admin/menu',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('@office-lunch/feature-admin').then((m) => m.MenuManagementComponent),
  },
  {
    path: 'admin/settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('@office-lunch/feature-admin').then((m) => m.SettingsComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('@office-lunch/feature-admin').then((m) => m.DashboardComponent),
  },
  {
    path: '',
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      return router.createUrlTree([auth.isAdmin() ? '/admin/dashboard' : '/departure']);
    }],
    component: class {},
  },
  {
    path: '**',
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      return router.createUrlTree([auth.isAdmin() ? '/admin/dashboard' : '/departure']);
    }],
    component: class {},
  },
];
