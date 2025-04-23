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
  {
    path: '**',
    redirectTo: '/home'
  }
]
