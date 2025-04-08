import { Routes } from '@angular/router';

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
    path: 'habitos',
    loadComponent: () => import('./components/habits/habits.component').then(m => m.HabitsComponent)
  },
  {
    path: 'luz',
    loadComponent: () => import('./components/electricity-form/electricity-form.component').then(m => m.ElectricityFormComponent)
  },
  {
    path: 'agua',
    loadComponent: () => import('./components/water-form/water-form.component').then(m => m.WaterFormComponent)
  },
  {
    path: 'transporte',
    loadComponent: () => import('./components/transport-form/transport-form.component').then(m => m.TransportFormComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
]
