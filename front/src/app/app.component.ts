import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component of the EcoTracker application
 * Acts as the main container for all other components
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>

    <footer>
      <p>&copy; 2025 EcoTracker - Proyecto educativo</p>
    </footer>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
    }

    footer {
      background-color: #333;
      color: white;
      text-align: center;
      padding: 16px;
      margin-top: 40px;
    }
  `
})
export class AppComponent {
  title = 'EcoTracker';
}
