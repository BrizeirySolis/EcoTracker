import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

/**
 * Application routes configuration
 * Defines the navigation paths for the EcoTracker application
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'habitos',
    loadComponent: () => import('./components/habits/habits.component').then(m => m.HabitsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'luz',
    loadComponent: () => import('./components/electricity-form/electricity-form.component').then(m => m.ElectricityFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'agua',
    loadComponent: () => import('./components/water-form/water-form.component').then(m => m.WaterFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transporte',
    loadComponent: () => import('./components/transport-form/transport-form.component').then(m => m.TransportFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  // Bitácoras routes
  {
    path: 'bitacoras',
    loadComponent: () => import('./components/bitacoras/bitacora-list/bitacora-list.component').then(m => m.BitacoraListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bitacoras/new',
    loadComponent: () => import('./components/bitacoras/bitacora-form/bitacora-form.component').then(m => m.BitacoraFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bitacoras/edit/:id',
    loadComponent: () => import('./components/bitacoras/bitacora-form/bitacora-form.component').then(m => m.BitacoraFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bitacoras/:id',
    loadComponent: () => import('./components/bitacoras/bitacora-detail/bitacora-detail.component').then(m => m.BitacoraDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bitacoras/timeline',
    loadComponent: () => import('./components/bitacoras/bitacora-timeline/bitacora-timeline.component').then(m => m.BitacoraTimelineComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
]
