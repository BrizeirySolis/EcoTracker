import { Injectable } from '@angular/core';

/**
 * Service for generating SVG data visualizations
 */
@Injectable({
  providedIn: 'root'
})
export class SparklineService {

  /**
   * Generate a sparkline path for a data series
   * @param values Array of numeric values to visualize
   * @returns SVG path string
   */
  generateSparklinePath(values: number[]): string {
    if (values.length === 0) return '';

    // Normalize values to fit in the viewport (0-100 x, 5-35 y)
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // Avoid division by zero

    // Calculate points
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100;
      // Invert Y axis (SVG coordinates are top-left origin)
      const y = 35 - ((value - min) / range * 30 + 5);
      return `${x},${y}`;
    });

    // Create path
    return `M ${points.join(' L ')}`;
  }

  /**
   * Calculate endpoint coordinates for a sparkline
   * @param values Array of numeric values
   * @returns Object with x,y coordinates
   */
  getSparklineEndPoint(values: number[]): { x: number, y: number } | undefined {
    if (values.length === 0) return undefined;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const lastValue = values[values.length - 1];
    return {
      x: 100,
      y: 35 - ((lastValue - min) / range * 30 + 5)
    };
  }
}
