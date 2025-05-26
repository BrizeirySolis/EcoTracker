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
    path: 'metas',
    loadComponent: () => import('./components/metas/meta-list/meta-list.component').then(m => m.MetaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'metas/new',
    loadComponent: () => import('./components/metas/meta-form/meta-form.component').then(m => m.MetaFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'metas/edit/:id',
    loadComponent: () => import('./components/metas/meta-form/meta-form.component').then(m => m.MetaFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'metas/:id',
    loadComponent: () => import('./components/metas/meta-detail/meta-detail.component').then(m => m.MetaDetailComponent),
    canActivate: [AuthGuard]
  },

  // ========================================
  // RUTAS DEL MÓDULO DE EDUCACIÓN
  // ========================================

  // Página principal del módulo educativo
  {
    path: 'educacion',
    loadComponent: () => import('./components/education/education-home/education-home.component')
      .then(m => m.EducationHomeComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Centro Educativo',
      description: 'Aprende técnicas para reducir tu impacto ambiental'
    }
  },

  // IMPORTANTE: Rutas específicas por categoría para mejor SEO (DEBEN IR ANTES de las rutas generales)
  {
    path: 'educacion/agua',
    redirectTo: 'educacion/categoria/agua',
    pathMatch: 'full'
  },
  {
    path: 'educacion/electricidad',
    redirectTo: 'educacion/categoria/electricidad',
    pathMatch: 'full'
  },
  {
    path: 'educacion/transporte',
    redirectTo: 'educacion/categoria/transporte',
    pathMatch: 'full'
  },

  // Vista para categorías específicas (DEBE IR ANTES que la ruta de artículos)
  {
    path: 'educacion/categoria/:categoria',
    loadComponent: () => import('./components/education/category-view/category-view.component')
      .then(m => m.CategoryViewComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Categoría Educativa',
      description: 'Artículos de una categoría específica'
    }
  },

  // Visualizador de artículos específicos (DEBE IR DESPUÉS de la ruta de categorías)
  {
    path: 'educacion/:tipo/:slug',
    loadComponent: () => import('./components/education/article-viewer/article-viewer.component')
      .then(m => m.ArticleViewerComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Artículo Educativo',
      description: 'Contenido educativo sobre sostenibilidad'
    }
  },

  // ========================================
  // FIN RUTAS DEL MÓDULO DE EDUCACIÓN
  // ========================================

  {
    path: '**',
    redirectTo: '/home'
  }
];
