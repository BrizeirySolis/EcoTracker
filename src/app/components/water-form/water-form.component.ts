import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConsumptionService } from '../../services/consumption.service';
import { WaterConsumption } from '../../models/consumption.model';

/**
 * Component for recording water consumption data
 */
@Component({
  selector: 'app-water-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="form-container">
        <h2>Agua</h2>

        <div class="form-group">
          <label for="consumption">Agua consumida (m3)</label>
          <input
            type="number"
            id="consumption"
            name="consumption"
            [(ngModel)]="consumption.liters"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            [(ngModel)]="consumptionDate"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="cost">Costo</label>
          <input
            type="number"
            id="cost"
            name="cost"
            [(ngModel)]="consumption.cost"
            class="form-control"
            required
          >
        </div>

        <div class="button-group">
          <button (click)="saveConsumption()" class="btn-save">Guardar</button>
          <button (click)="cancel()" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-container {
      background-color: #8AE68A;
      border-radius: 12px;
      padding: 30px;
      margin-top: 30px;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 24px;
      background-color: #fff;
      font-size: 1rem;
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }

    .btn-save, .btn-cancel {
      padding: 12px 40px;
      border: none;
      border-radius: 24px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-save {
      background-color: #00833c;
      color: white;
    }

    .btn-cancel {
      background-color: #e53935;
      color: white;
    }

    .btn-save:hover {
      background-color: #006c32;
    }

    .btn-cancel:hover {
      background-color: #c62828;
    }
  `
})
export class WaterFormComponent {
  consumption: WaterConsumption = {
    liters: 0,
    date: new Date(),
    cost: 0
  };

  consumptionDate: string = this.formatDate(new Date());

  constructor(
    private consumptionService: ConsumptionService,
    private router: Router
  ) {}

  /**
   * Save the water consumption data
   */
  saveConsumption(): void {
    // Update the date from the input field
    this.consumption.date = new Date(this.consumptionDate);

    this.consumptionService.saveWaterConsumption(this.consumption)
      .subscribe({
        next: () => {
          // Navigate back to habits page after successful save
          this.router.navigate(['/habitos']);
        },
        error: (error) => {
          console.error('Error saving consumption:', error);
          // In a real app, show an error message to the user
        }
      });
  }

  /**
   * Cancel the form submission and return to habits page
   */
  cancel(): void {
    this.router.navigate(['/habitos']);
  }

  /**
   * Format a date for the date input field
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
