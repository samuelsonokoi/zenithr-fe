import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(
        (c) => c.Dashboard
    )
  },
  {
    path: 'new-scenario',
    loadComponent: () =>
      import('./pages/new-scenario/new-scenario').then(
        (c) => c.NewScenario
    )
  },
  { path: '**', redirectTo: '' }
];
