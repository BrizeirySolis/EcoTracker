import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import {ElectricityAnalyticsService} from './services/analytics/electricity-analytics.service';
import {TransportAnalyticsService} from './services/analytics/transport-analytics.service';
import {SparklineService} from './services/visualization/sparkline.service';

/**
 * Application configuration for EcoTracker
 * Provides application-wide services and configuration options
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Provide optimized change detection
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configure router with view transitions for smooth navigation
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: (transitionInfo) => {
          console.log('View transition created for:', transitionInfo.to.url);
        }
      })
    ),

    // Configure HTTP client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    ElectricityAnalyticsService,
    TransportAnalyticsService,
    SparklineService
  ]
};
