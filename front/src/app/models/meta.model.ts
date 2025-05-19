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
  valorActual: number;
  valorInicial?: number;
  unidad: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'en_progreso' | 'completada' | 'fallida';
  metrica?: string;
  tipoEvaluacion?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  // Si faltan valores necesarios, retornar 0
  if (!meta || meta.valorActual === undefined || meta.valorObjetivo === undefined) {
    return 0;
  }

  // Determinar si es una meta de reducción
  const esReduccion = (meta.tipo === 'agua' || meta.tipo === 'electricidad' ||
    (meta.tipo === 'transporte' &&
      (meta.unidad === 'co2' || meta.unidad === 'costo')));

  // Si es una meta de reducción (donde menos es mejor)
  if (esReduccion) {
    // Si ya alcanzamos o superamos el objetivo
    if (meta.valorActual <= meta.valorObjetivo) {
      return 100;
    }

    // Si tenemos valor inicial, usarlo para cálculo preciso
    if (meta.valorInicial && meta.valorInicial > 0) {
      // Cálculo basado en cuánto hemos reducido del total necesario
      const reduccionTotal = meta.valorInicial - meta.valorObjetivo;
      const reduccionActual = meta.valorInicial - meta.valorActual;

      // Evitar división por cero
      if (reduccionTotal <= 0) return 0;

      // Calcular porcentaje y redondear
      const porcentaje = (reduccionActual / reduccionTotal) * 100;
      return Math.round(Math.max(0, Math.min(100, porcentaje)));
    }

    // Si no tenemos valor inicial, usar estimación
    else {
      // Estimamos que el valor inicial sería 30% mayor que el objetivo
      const valorInicialEstimado = meta.valorObjetivo * 1.3;

      // Usamos esta estimación para calcular
      const reduccionTotal = valorInicialEstimado - meta.valorObjetivo;
      const reduccionActual = valorInicialEstimado - meta.valorActual;

      if (reduccionTotal <= 0) return 0;

      const porcentaje = (reduccionActual / reduccionTotal) * 100;
      return Math.round(Math.max(0, Math.min(100, porcentaje)));
    }
  }

  // Para metas de incremento (donde más es mejor)
  else {
    // Evitar división por cero
    if (meta.valorObjetivo <= 0) return 0;

    // El progreso es el porcentaje del objetivo que hemos alcanzado
    const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
    return Math.round(Math.max(0, Math.min(100, porcentaje)));
  }
}

/**
 * Determina si una meta es de reducción basándose en su tipo y valores
 * Ya que no tenemos acceso directo a la propiedad 'metrica'
 */
function determinarSiEsReduccion(meta: Meta): boolean {
  // Para agua y electricidad, son metas de reducción
  if (meta.tipo === 'agua' || meta.tipo === 'electricidad') {
    return true; // Asumimos que todas las metas de agua y electricidad son de reducción
  }

  // Para transporte, depende de la unidad y otros indicadores
  else if (meta.tipo === 'transporte') {
    // Si la unidad es km y el objetivo es menor que algún valor de referencia,
    // probablemente es una meta de reducción de km en vehículos
    if (meta.unidad === 'km' && meta.valorObjetivo < 100) {
      return true;
    }
    // Si la unidad es CO2 o costo, probablemente es reducción
    else if (meta.unidad === 'co2' || meta.unidad === 'costo') {
      return true;
    }
    // En otros casos, probablemente es de incremento (ej: aumentar % de transporte sostenible)
    return false;
  }

  // Para tipos combinados u otros, evaluamos por el valor objetivo vs actual
  return meta.valorObjetivo < meta.valorActual;
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
