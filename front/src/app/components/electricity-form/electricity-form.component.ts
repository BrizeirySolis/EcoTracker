import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConsumptionService } from '../../services/consumption.service';
import { ElectricityConsumption } from '../../models/consumption.model';

/**
 * Component for recording electricity consumption data
 * Includes validation of required fields and positive decimal values for cost
 */
@Component({
  selector: 'app-electricity-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="form-container">
        <h2>Luz</h2>

        <form #electricityForm="ngForm" (ngSubmit)="saveConsumption(electricityForm)">
          <div class="form-group">
            <label for="consumption">Electricidad consumida <span class="required">*</span></label>
            <input
              type="number"
              id="consumption"
              name="consumption"
              [(ngModel)]="consumption.kilowatts"
              class="form-control"
              required
              min="0.01"
              [class.is-invalid]="isSubmitted && (consumptionInput.invalid || consumptionInput.value <= 0)"
              #consumptionInput="ngModel"
            >
            <div *ngIf="isSubmitted && (consumptionInput.invalid || consumptionInput.value <= 0)" class="error-message">
              <div *ngIf="consumptionInput.errors?.['required']">El consumo de electricidad es obligatorio</div>
              <div *ngIf="consumptionInput.value <= 0 && !consumptionInput.errors?.['required']">El consumo debe ser mayor que cero</div>
            </div>
          </div>

          <div class="form-group">
            <label for="date">Fecha <span class="required">*</span></label>
            <input
              type="date"
              id="date"
              name="date"
              [(ngModel)]="consumptionDate"
              class="form-control"
              required
              [class.is-invalid]="isSubmitted && dateInput.invalid"
              #dateInput="ngModel"
            >
            <div *ngIf="isSubmitted && dateInput.invalid" class="error-message">
              <div *ngIf="dateInput.errors?.['required']">La fecha es obligatoria</div>
            </div>
          </div>

          <div class="form-group">
            <label for="cost">Costo <span class="required">*</span></label>
            <input
              type="number"
              id="cost"
              name="cost"
              [(ngModel)]="consumption.cost"
              class="form-control"
              required
              min="0"
              step="0.01"
              [class.is-invalid]="isSubmitted && (costInput.invalid || costInput.value < 0)"
              #costInput="ngModel"
            >
            <div *ngIf="isSubmitted && (costInput.invalid || costInput.value < 0)" class="error-message">
              <div *ngIf="costInput.errors?.['required']">El costo es obligatorio</div>
              <div *ngIf="costInput.value < 0 && !costInput.errors?.['required']">El costo debe ser un valor positivo</div>
            </div>
          </div>

          <div class="button-group">
            <button type="submit" class="btn-save">Guardar</button>
            <button type="button" (click)="cancel()" class="btn-cancel">Cancelar</button>
          </div>
        </form>
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

    /* Nuevos estilos para validación */
    .required {
      color: #e53935;
    }

    .is-invalid {
      border: 1px solid #e53935 !important;
      background-color: #ffebee;
    }

    .error-message {
      color: #e53935;
      font-size: 0.875rem;
      margin-top: 4px;
      margin-left: 12px;
    }
  `
})
export class ElectricityFormComponent {
  @ViewChild('electricityForm') electricityForm!: NgForm;

  consumption: ElectricityConsumption = {
    kilowatts: 0,
    date: new Date(),
    cost: 0
  };

  consumptionDate: string = this.formatDate(new Date());
  isSubmitted = false;

  constructor(
    private consumptionService: ConsumptionService,
    private router: Router
  ) {}

  /**
   * Save the electricity consumption data after validation
   */
  saveConsumption(form: NgForm): void {
    this.isSubmitted = true;

    // Validar formulario
    if (form.invalid || this.consumption.kilowatts <= 0 || this.consumption.cost < 0) {
      return;
    }

    // Update the date from the input field
    this.consumption.date = new Date(this.consumptionDate);

    this.consumptionService.saveElectricityConsumption(this.consumption)
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
