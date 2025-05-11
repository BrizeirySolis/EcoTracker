import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ElectricityConsumption, WaterConsumption, TransportUsage, ConsumptionSummary } from '../models/consumption.model';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsumptionService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Private method to handle HTTP errors
   * Automatically redirects to login on authentication errors
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Error en la solicitud HTTP:', error);

    // Si es un error 401 (Unauthorized), redirigir al login
    if (error.status === 401) {
      console.log('Error de autenticación. Redirigiendo al login...');
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
          authError: 'Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.'
        }
      });
    }

    return throwError(() => error);
  }

  /**
   * Get summary of all consumption data for charts
   * @returns Observable of consumption summary data
   */
  getConsumptionSummary(): Observable<ConsumptionSummary[]> {
    return this.http.get<ConsumptionSummary[]>(`${this.API_URL}/summary`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Save electricity consumption data
   * @param data The electricity consumption data to save
   * @returns Observable of the saved data with generated ID
   */
  saveElectricityConsumption(data: ElectricityConsumption): Observable<ElectricityConsumption> {
    return this.http.post<ElectricityConsumption>(`${this.API_URL}/electricity`, data)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get all electricity consumption entries
   * @returns Observable of electricity consumption array
   */
  getElectricityConsumption(): Observable<ElectricityConsumption[]> {
    return this.http.get<ElectricityConsumption[]>(`${this.API_URL}/electricity`)
      .pipe(
        map(items => items.map(item => ({
          ...item,
          date: new Date(item.date)
        }))),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Save water consumption data
   * @param data The water consumption data to save
   * @returns Observable of the saved data with generated ID
   */
  saveWaterConsumption(data: WaterConsumption): Observable<WaterConsumption> {
    return this.http.post<WaterConsumption>(`${this.API_URL}/water`, data)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get all water consumption entries
   * @returns Observable of water consumption array
   */
  getWaterConsumption(): Observable<WaterConsumption[]> {
    return this.http.get<WaterConsumption[]>(`${this.API_URL}/water`)
      .pipe(
        map(items => items.map(item => ({
          ...item,
          date: new Date(item.date)
        }))),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Save transport usage data
   * @param data The transport usage data to save
   * @returns Observable of the saved data with generated ID
   */
  saveTransportUsage(data: TransportUsage): Observable<TransportUsage> {
    return this.http.post<TransportUsage>(`${this.API_URL}/transport`, data)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get all transport usage entries
   * @returns Observable of transport usage array
   */
  getTransportUsage(): Observable<TransportUsage[]> {
    return this.http.get<TransportUsage[]>(`${this.API_URL}/transport`)
      .pipe(
        map(items => items.map(item => ({
          ...item,
          date: new Date(item.date)
        }))),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get mock data if API fails or for development
   * @returns Array of mock consumption data
   */
  getMockWaterData(): WaterConsumption[] {
    return [
      { id: 1, liters: 5.2, date: new Date(2025, 2, 10), cost: 120 },
      { id: 2, liters: 8.0, date: new Date(2025, 2, 17), cost: 190 },
      { id: 3, liters: 6.1, date: new Date(2025, 2, 24), cost: 135 },
      { id: 4, liters: 7.2, date: new Date(2025, 3, 1), cost: 150 },
      { id: 5, liters: 4.0, date: new Date(2025, 3, 8), cost: 100 }
    ];
  }

  /**
   * Get mock electricity data for development
   * @returns Array of mock electricity data
   */
  getMockElectricityData(): ElectricityConsumption[] {
    return [
      { id: 1, kilowatts: 120, date: new Date(2025, 2, 10), cost: 240 },
      { id: 2, kilowatts: 150, date: new Date(2025, 2, 17), cost: 300 },
      { id: 3, kilowatts: 130, date: new Date(2025, 2, 24), cost: 260 },
      { id: 4, kilowatts: 140, date: new Date(2025, 3, 1), cost: 280 },
      { id: 5, kilowatts: 110, date: new Date(2025, 3, 8), cost: 220 }
    ];
  }

  /**
   * Get mock transport data for development
   * @returns Array of mock transport data
   */
  getMockTransportData(): TransportUsage[] {
    return [
      { id: 1, kilometers: 20, transportType: 'car', date: new Date(2025, 2, 10), cost: 50 },
      { id: 2, kilometers: 15, transportType: 'bus', date: new Date(2025, 2, 17), cost: 30 },
      { id: 3, kilometers: 25, transportType: 'car', date: new Date(2025, 2, 24), cost: 60 },
      { id: 4, kilometers: 18, transportType: 'car', date: new Date(2025, 3, 1), cost: 45 },
      { id: 5, kilometers: 12, transportType: 'bicycle', date: new Date(2025, 3, 8), cost: 0 }
    ];
  }

  /**
   * Get mock summary data for development
   * @returns Array of mock summary data
   */
  getMockSummaryData(): ConsumptionSummary[] {
    return [
      { label: 'Agua', value: 100, percentage: 30 },
      { label: 'Electricidad', value: 150, percentage: 45 },
      { label: 'Transporte', value: 80, percentage: 25 }
    ];
  }
}
