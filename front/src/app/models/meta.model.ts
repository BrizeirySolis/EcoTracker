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
  progreso?: number;
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
    //{ metrica: 'costo_unitario', descripcion: 'Reducción del costo unitario', unidad: 'costo' },
    //{ metrica: 'promedio_movil', descripcion: 'Reducción del promedio móvil', unidad: 'm3' },
    //{ metrica: 'benchmark', descripcion: 'Consumo bajo benchmark regional', unidad: 'porcentaje' },
    //{ metrica: 'emisiones', descripcion: 'Reducción de emisiones CO2', unidad: 'co2' }
  ],
  'electricidad': [
    { metrica: 'consumo_total', descripcion: 'Reducción del consumo total', unidad: 'kwh' },
    //{ metrica: 'costo_unitario', descripcion: 'Reducción del costo unitario', unidad: 'costo' },
    //{ metrica: 'promedio_movil', descripcion: 'Reducción del promedio móvil', unidad: 'kwh' },
    //{ metrica: 'benchmark', descripcion: 'Consumo bajo benchmark regional', unidad: 'porcentaje' },
    //{ metrica: 'emisiones', descripcion: 'Reducción de emisiones CO2', unidad: 'co2' }
  ],
  'transporte': [
    //{ metrica: 'porcentaje_sostenible', descripcion: 'Incremento de transporte sostenible', unidad: 'porcentaje' },
    { metrica: 'reduccion_combustion', descripcion: 'Reducción km en vehículos combustión', unidad: 'km' },
    //{ metrica: 'km_bicicleta', descripcion: 'Incremento uso de bicicleta', unidad: 'km' },
    //{ metrica: 'uso_bicicleta', descripcion: 'Kilómetros en bicicleta', unidad: 'km' },
    //{ metrica: 'emisiones', descripcion: 'Reducción de emisiones CO2', unidad: 'co2' },
    //{ metrica: 'eficiencia', descripcion: 'Mejora de eficiencia (kg CO2/km)', unidad: 'co2' },
    //{ metrica: 'costo', descripcion: 'Reducción del costo de transporte', unidad: 'costo' }
  ],
  'combinada': [
    //{ metrica: 'huella_carbono', descripcion: 'Reducción de la huella de carbono total', unidad: 'co2' },
    //{ metrica: 'sostenibilidad', descripcion: 'Mejora del índice de sostenibilidad', unidad: 'porcentaje' },
    //{ metrica: 'ahorro_total', descripcion: 'Ahorro económico total', unidad: 'costo' }
  ],
  'otro': [
    //{ metrica: 'personalizada', descripcion: 'Métrica personalizada', unidad: 'unidad' }
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

  // NUEVO: Si el backend ya calculó el progreso, usarlo
  if (meta.progreso !== undefined && meta.progreso !== null) {
    return meta.progreso;
  }

  // Determinar si es una meta de reducción según tipo y métrica
  const esReduccion = determinarSiEsReduccion(meta);
  console.log(`Calculando progreso para meta tipo=${meta.tipo}, métrica=${meta.metrica}`);
  console.log(`valorInicial=${meta.valorInicial}, valorActual=${meta.valorActual}, valorObjetivo=${meta.valorObjetivo}`);
  console.log(`¿Es reducción? ${esReduccion}`);

  // SIMPLIFICADO: Lógica unificada para transporte
  if (meta.tipo === 'transporte') {
    if (meta.valorObjetivo <= 0) return 0;

    if (esReduccion) {
      // Para reducción: progreso = (valorActual / valorObjetivo) * 100
      // Ejemplo: Si el objetivo es máximo 250 km y llevas 50 km = 20% de progreso
      const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
      return Math.min(100, Math.max(0, porcentaje));
    } else {
      // Para incremento: igual cálculo
      const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
      return Math.min(100, Math.max(0, porcentaje));
    }
  }

  // Para agua y electricidad, mantener la lógica original
  // Para metas donde el valor inicial es demasiado pequeño, usamos una lógica simplificada
  if (!meta.valorInicial || meta.valorInicial <= 0.1) {
    if (esReduccion) {
      // Para metas de reducción, comparamos actual contra objetivo directamente
      if (meta.valorActual <= meta.valorObjetivo) {
        return 100; // Meta alcanzada
      }
      // Usamos una escala donde el 200% del objetivo es 0% de progreso
      // y el 100% del objetivo es 100% de progreso
      const proporcion = meta.valorActual / meta.valorObjetivo;
      const porcentaje = Math.max(0, 100 * (2 - proporcion));
      return Math.min(100, porcentaje);
    } else {
      // Para metas de incremento
      if (meta.valorObjetivo <= 0) return 0;
      const porcentaje = (meta.valorActual / meta.valorObjetivo) * 100;
      return Math.min(100, Math.max(0, porcentaje));
    }
  }

  // Para metas con valor inicial válido (agua y electricidad principalmente)
  if (esReduccion) {
    // Meta alcanzada
    if (meta.valorActual <= meta.valorObjetivo) {
      return 100;
    }

    // Calcular reducción objetivo y actual
    const reduccionTotal = meta.valorInicial - meta.valorObjetivo;
    const reduccionActual = Math.max(0, meta.valorInicial - meta.valorActual);

    // Evitar división por cero
    if (reduccionTotal <= 0) return 0;

    const porcentaje = (reduccionActual / reduccionTotal) * 100;
    return Math.min(100, Math.max(0, porcentaje));
  } else {
    // Para metas de incremento
    const incrementoTotal = meta.valorObjetivo - meta.valorInicial;
    const incrementoActual = Math.max(0, meta.valorActual - meta.valorInicial);

    if (incrementoTotal <= 0) return 0;

    const porcentaje = (incrementoActual / incrementoTotal) * 100;
    return Math.min(100, Math.max(0, porcentaje));
  }
}

/**
 * Determina si una meta es de reducción basándose en su tipo y valores
 * Ya que no tenemos acceso directo a la propiedad 'metrica'
 */
function determinarSiEsReduccion(meta: Meta): boolean {
  // Para agua y electricidad, normalmente son metas de reducción
  if (meta.tipo === 'agua' || meta.tipo === 'electricidad') {
    return true;
  }

  // Para transporte, depende de la métrica
  if (meta.tipo === 'transporte') {
    // Métricas de bicicleta y sostenibilidad son de incremento
    if (meta.metrica === 'km_bicicleta' ||
      meta.metrica === 'uso_bicicleta' ||
      meta.metrica === 'porcentaje_sostenible') {
      return false;
    }

    // Estas métricas son de reducción
    if (meta.metrica === 'reduccion_combustion' ||
      meta.metrica === 'emisiones' ||
      meta.metrica === 'costo') {
      return true;
    }

    // Si la métrica no está especificada o no reconocida,
    // verificar por la relación entre valor objetivo y actual
    return meta.valorObjetivo < meta.valorActual;
  }

  // Por defecto para otros tipos
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
