import type { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'departure',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/departure/departure.component').then((m) => m.DepartureComponent),
  },
  {
    path: 'voting',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/voting/voting.component').then((m) => m.VotingComponent),
  },
  {
    path: 'ordering',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ordering/ordering.component').then((m) => m.OrderingComponent),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
  },
  {
    path: 'admin/menu',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/menu-management/menu-management.component').then(
        (m) => m.MenuManagementComponent
      ),
  },
  {
    path: 'admin/settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  { path: '', canActivate: [() => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return router.createUrlTree([auth.isAdmin() ? '/admin/dashboard' : '/departure']);
  }], component: class {} },
  { path: '**', canActivate: [() => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return router.createUrlTree([auth.isAdmin() ? '/admin/dashboard' : '/departure']);
  }], component: class {} },
];
