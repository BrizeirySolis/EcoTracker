/**
 * Modelo principal para las metas ambientales de los usuarios
 * Representa objetivos personales para mejorar hábitos con impacto ambiental
 */
export interface Meta {
  id?: number;
  titulo: string;
  descripcion?: string;
  tipo: string;
  valorObjetivo: number;
  unidad: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'en_progreso' | 'completada' | 'fallida';
  valorActual: number;
  createdAt?: Date;
}

/**
 * Request model para crear una nueva meta
 * Omite campos generados por el servidor
 */
export interface MetaCreateRequest {
  titulo: string;
  descripcion?: string;
  tipo: string;
  valorObjetivo: number;
  unidad: string;
  fechaInicio: Date;
  fechaFin: Date;
}

/**
 * Mapa de tipos de meta a sus nombres de visualización
 */
export const TIPOS_META: Record<string, string> = {
  'agua': 'Agua',
  'electricidad': 'Electricidad',
  'transporte': 'Transporte',
  'combinada': 'Combinada',
  'otro': 'Otro'
};

/**
 * Mapa de unidades a sus nombres de visualización
 */
export const UNIDADES_META: Record<string, string> = {
  'm3': 'm³ (Metros cúbicos)',
  'kwh': 'kWh (Kilowatt-hora)',
  'km': 'km (Kilómetros)',
  'porcentaje': '% (Porcentaje)',
  'co2': 'kg CO₂ (Emisiones)',
  'costo': 'MXN (Costo)',
  'unidad': 'uds (Unidades)'
};

/**
 * Estructura para los tipos de evaluación de metas
 */
export type TipoEvaluacion = 'automatica' | 'manual';

/**
 * Configuración de métricas disponibles por tipo de meta
 */
export const METRICAS_POR_TIPO: Record<string, {
  metrica: string;
  descripcion: string;
  unidad: string;
}[]> = {
  'agua': [
    { metrica: 'consumo_total', descripcion: 'Reducción del consumo total', unidad: 'm3' },
    { metrica: 'costo_unitario', descripcion: 'Reducción del costo unitario', unidad: 'costo' },
    { metrica: 'promedio_movil', descripcion: 'Reducción del promedio móvil', unidad: 'm3' },
    { metrica: 'benchmark', descripcion: 'Consumo bajo benchmark regional', unidad: 'porcentaje' },
    { metrica: 'emisiones', descripcion: 'Reducción de emisiones CO2', unidad: 'co2' }
  ],
  'electricidad': [
    { metrica: 'consumo_total', descripcion: 'Reducción del consumo total', unidad: 'kwh' },
    { metrica: 'costo_unitario', descripcion: 'Reducción del costo unitario', unidad: 'costo' },
    { metrica: 'promedio_movil', descripcion: 'Reducción del promedio móvil', unidad: 'kwh' },
    { metrica: 'benchmark', descripcion: 'Consumo bajo benchmark regional', unidad: 'porcentaje' },
    { metrica: 'emisiones', descripcion: 'Reducción de emisiones CO2', unidad: 'co2' }
  ],
  'transporte': [
    { metrica: 'porcentaje_sostenible', descripcion: 'Incremento de transporte sostenible', unidad: 'porcentaje' },
    { metrica: 'reduccion_combustion', descripcion: 'Reducción km en vehículos combustión', unidad: 'km' },
    { metrica: 'emisiones', descripcion: 'Reducción de emisiones CO2', unidad: 'co2' },
    { metrica: 'eficiencia', descripcion: 'Mejora de eficiencia (kg CO2/km)', unidad: 'co2' },
    { metrica: 'costo', descripcion: 'Reducción del costo de transporte', unidad: 'costo' }
  ],
  'combinada': [
    { metrica: 'huella_carbono', descripcion: 'Reducción de la huella de carbono total', unidad: 'co2' },
    { metrica: 'sostenibilidad', descripcion: 'Mejora del índice de sostenibilidad', unidad: 'porcentaje' },
    { metrica: 'ahorro_total', descripcion: 'Ahorro económico total', unidad: 'costo' }
  ],
  'otro': [
    { metrica: 'personalizada', descripcion: 'Métrica personalizada', unidad: 'unidad' }
  ]
};

/**
 * Función para calcular el porcentaje de progreso de una meta
 * @param meta Objeto de meta
 * @returns Porcentaje de progreso (0-100)
 */
export function calcularPorcentajeMeta(meta: Meta): number {
  // Para metas de reducción, el progreso es inverso
  const esReduccion = meta.tipo !== 'transporte' &&
    meta.valorObjetivo < meta.valorActual;

  if (esReduccion) {
    // Para metas de reducción, calculamos cuánto ha reducido del objetivo
    const valorInicial = meta.valorActual * 2 - meta.valorObjetivo; // Estimación del valor inicial
    const reduccionActual = valorInicial - meta.valorActual;
    const reduccionObjetivo = valorInicial - meta.valorObjetivo;

    return Math.min(100, Math.max(0, (reduccionActual / reduccionObjetivo) * 100));
  } else {
    // Para metas de incremento o valores absolutos
    return Math.min(100, Math.max(0, (meta.valorActual / meta.valorObjetivo) * 100));
  }
}

/**
 * Obtener estado visual de una meta según su progreso y fechas
 * @param meta Objeto de meta
 * @returns Estado de la meta para visualización
 */
export function obtenerEstadoMeta(meta: Meta): 'success' | 'warning' | 'danger' | 'info' {
  const hoy = new Date();
  const fechaFin = new Date(meta.fechaFin);
  const porcentaje = calcularPorcentajeMeta(meta);

  // Meta completada
  if (porcentaje >= 100) {
    return 'success';
  }

  // Meta vencida
  if (fechaFin < hoy) {
    return 'danger';
  }

  // Calcular el tiempo transcurrido y el progreso esperado
  const fechaInicio = new Date(meta.fechaInicio);
  const duracionTotal = fechaFin.getTime() - fechaInicio.getTime();
  const transcurrido = hoy.getTime() - fechaInicio.getTime();
  const porcentajeTiempo = Math.min(100, Math.max(0, (transcurrido / duracionTotal) * 100));

  // Si el progreso está retrasado respecto al tiempo
  if (porcentaje < porcentajeTiempo - 10) {
    return 'warning';
  }

  return 'info';
}
