import { Injectable } from '@angular/core';
import { ElectricityConsumption, WaterConsumption, TransportUsage, ConsumptionSummary } from '../models/consumption.model';
import { Observable, of } from 'rxjs';

/**
 * Service to manage all consumption data
 * Uses localStorage for data persistence
 */
@Injectable({
  providedIn: 'root'
})
export class ConsumptionService {
  private readonly ELECTRICITY_KEY = 'ecotracker_electricity';
  private readonly WATER_KEY = 'ecotracker_water';
  private readonly TRANSPORT_KEY = 'ecotracker_transport';

  constructor() {
    // Initialize storage if empty
    if (!localStorage.getItem(this.ELECTRICITY_KEY)) {
      localStorage.setItem(this.ELECTRICITY_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.WATER_KEY)) {
      localStorage.setItem(this.WATER_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.TRANSPORT_KEY)) {
      localStorage.setItem(this.TRANSPORT_KEY, JSON.stringify([]));
    }
  }

  /**
   * Save electricity consumption data
   * @param data The electricity consumption data to save
   * @returns Observable of the saved data with generated ID
   */
  saveElectricityConsumption(data: ElectricityConsumption): Observable<ElectricityConsumption> {
    const items: ElectricityConsumption[] = JSON.parse(localStorage.getItem(this.ELECTRICITY_KEY) || '[]');

    // Generate ID (simple implementation)
    const newItem = {
      ...data,
      id: Date.now(),
      date: new Date(data.date)
    };

    items.push(newItem);
    localStorage.setItem(this.ELECTRICITY_KEY, JSON.stringify(items));

    return of(newItem);
  }

  /**
   * Get all electricity consumption entries
   * @returns Observable of electricity consumption array
   */
  getElectricityConsumption(): Observable<ElectricityConsumption[]> {
    const items: ElectricityConsumption[] = JSON.parse(localStorage.getItem(this.ELECTRICITY_KEY) || '[]');
    return of(items.map(item => ({
      ...item,
      date: new Date(item.date)
    })));
  }

  /**
   * Save water consumption data
   * @param data The water consumption data to save
   * @returns Observable of the saved data with generated ID
   */
  saveWaterConsumption(data: WaterConsumption): Observable<WaterConsumption> {
    const items: WaterConsumption[] = JSON.parse(localStorage.getItem(this.WATER_KEY) || '[]');

    const newItem = {
      ...data,
      id: Date.now(),
      date: new Date(data.date)
    };

    items.push(newItem);
    localStorage.setItem(this.WATER_KEY, JSON.stringify(items));

    return of(newItem);
  }

  /**
   * Get all water consumption entries
   * @returns Observable of water consumption array
   */
  getWaterConsumption(): Observable<WaterConsumption[]> {
    const items: WaterConsumption[] = JSON.parse(localStorage.getItem(this.WATER_KEY) || '[]');
    return of(items.map(item => ({
      ...item,
      date: new Date(item.date)
    })));
  }

  /**
   * Save transport usage data
   * @param data The transport usage data to save
   * @returns Observable of the saved data with generated ID
   */
  saveTransportUsage(data: TransportUsage): Observable<TransportUsage> {
    const items: TransportUsage[] = JSON.parse(localStorage.getItem(this.TRANSPORT_KEY) || '[]');

    const newItem = {
      ...data,
      id: Date.now(),
      date: new Date(data.date)
    };

    items.push(newItem);
    localStorage.setItem(this.TRANSPORT_KEY, JSON.stringify(items));

    return of(newItem);
  }

  /**
   * Get all transport usage entries
   * @returns Observable of transport usage array
   */
  getTransportUsage(): Observable<TransportUsage[]> {
    const items: TransportUsage[] = JSON.parse(localStorage.getItem(this.TRANSPORT_KEY) || '[]');
    return of(items.map(item => ({
      ...item,
      date: new Date(item.date)
    })));
  }

  /**
   * Get summary of all consumption data for charts
   * @returns Observable of consumption summary data
   */
  getConsumptionSummary(): Observable<ConsumptionSummary[]> {
    // Calculate total values for each category
    const electricityItems: ElectricityConsumption[] = JSON.parse(localStorage.getItem(this.ELECTRICITY_KEY) || '[]');
    const waterItems: WaterConsumption[] = JSON.parse(localStorage.getItem(this.WATER_KEY) || '[]');
    const transportItems: TransportUsage[] = JSON.parse(localStorage.getItem(this.TRANSPORT_KEY) || '[]');

    const electricityValue = electricityItems.reduce((sum, item) => sum + item.kilowatts, 0);
    const waterValue = waterItems.reduce((sum, item) => sum + item.liters, 0);
    const transportValue = transportItems.reduce((sum, item) => sum + item.kilometers, 0);

    // Create placeholder data if empty
    const summary: ConsumptionSummary[] = [];

    // If we have no data, return demo data
    if (electricityValue === 0 && waterValue === 0 && transportValue === 0) {
      return of([
        { label: 'Elemento 1', value: 100, percentage: 20 },
        { label: 'Elemento 2', value: 100, percentage: 20 },
        { label: 'Elemento 3', value: 100, percentage: 20 },
        { label: 'Elemento 4', value: 100, percentage: 20 },
        { label: 'Elemento 5', value: 100, percentage: 20 },
      ]);
    }

    const total = electricityValue + waterValue + transportValue;

    // Add actual data
    if (electricityValue > 0) {
      summary.push({
        label: 'Electricidad',
        value: electricityValue,
        percentage: Math.round((electricityValue / total) * 100)
      });
    }

    if (waterValue > 0) {
      summary.push({
        label: 'Agua',
        value: waterValue,
        percentage: Math.round((waterValue / total) * 100)
      });
    }

    if (transportValue > 0) {
      summary.push({
        label: 'Transporte',
        value: transportValue,
        percentage: Math.round((transportValue / total) * 100)
      });
    }

    return of(summary);
  }
}
