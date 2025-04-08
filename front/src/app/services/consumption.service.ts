import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectricityConsumption, WaterConsumption, TransportUsage, ConsumptionSummary } from '../models/consumption.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service to manage all consumption data
 * Communicates with Spring Boot backend API
 */
@Injectable({
  providedIn: 'root'
})
export class ConsumptionService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Save electricity consumption data
   * @param data The electricity consumption data to save
   * @returns Observable of the saved data with generated ID
   */
  saveElectricityConsumption(data: ElectricityConsumption): Observable<ElectricityConsumption> {
    return this.http.post<ElectricityConsumption>(`${this.API_URL}/electricity`, data);
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
        })))
      );
  }

  /**
   * Save water consumption data
   * @param data The water consumption data to save
   * @returns Observable of the saved data with generated ID
   */
  saveWaterConsumption(data: WaterConsumption): Observable<WaterConsumption> {
    return this.http.post<WaterConsumption>(`${this.API_URL}/water`, data);
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
        })))
      );
  }

  /**
   * Save transport usage data
   * @param data The transport usage data to save
   * @returns Observable of the saved data with generated ID
   */
  saveTransportUsage(data: TransportUsage): Observable<TransportUsage> {
    return this.http.post<TransportUsage>(`${this.API_URL}/transport`, data);
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
        })))
      );
  }

  /**
   * Get summary of all consumption data for charts
   * @returns Observable of consumption summary data
   */
  getConsumptionSummary(): Observable<ConsumptionSummary[]> {
    // Obtenemos los datos del resumen directamente de la API
    return this.http.get<ConsumptionSummary[]>(`${this.API_URL}/summary`);
  }
}
