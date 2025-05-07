/**
 * Core model for environmental activity log entries
 * Represents activities with positive environmental impact
 */
export interface Bitacora {
  id?: number;
  titulo: string;
  descripcion?: string;
  fecha: Date;
  imagenUrl?: string;
  categoria: string;
  camposAdicionales?: Record<string, any>;
  createdAt?: Date;
}

/**
 * Request model for creating a new bitácora
 * Omits server-generated fields
 */
export interface BitacoraCreateRequest {
  titulo: string;
  descripcion?: string;
  fecha: Date;
  categoria: string;
  camposAdicionales?: Record<string, any>;
}

/**
 * Model for category information
 */
export interface Categoria {
  codigo: string;
  nombre: string;
}

/**
 * Category-specific additional fields configuration
 * Defines which fields should appear for each category
 */
export interface CampoAdicional {
  nombre: string;
  etiqueta: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'seleccion';
  opciones?: string[];
  requerido: boolean;
  placeholder?: string;
}

/**
 * Configuration for additional fields by category
 */
export const CAMPOS_ADICIONALES_POR_CATEGORIA: Record<string, CampoAdicional[]> = {
  'plantacion': [
    {
      nombre: 'especie',
      etiqueta: 'Especie de árbol',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Pino, Encino, Sauce'
    },
    {
      nombre: 'cantidad',
      etiqueta: 'Cantidad plantada',
      tipo: 'numero',
      requerido: true
    }
  ],
  'reciclaje': [
    {
      nombre: 'material',
      etiqueta: 'Tipo de material',
      tipo: 'seleccion',
      opciones: ['Plástico', 'Papel', 'Vidrio', 'Metal', 'Electrónicos', 'Otro'],
      requerido: true
    },
    {
      nombre: 'cantidad',
      etiqueta: 'Cantidad aproximada (kg)',
      tipo: 'numero',
      requerido: false
    }
  ],
  'limpieza': [
    {
      nombre: 'ubicacion',
      etiqueta: 'Lugar de limpieza',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Parque municipal, Playa, Río'
    },
    {
      nombre: 'area',
      etiqueta: 'Área cubierta (m²)',
      tipo: 'numero',
      requerido: false
    }
  ],
  'educacion': [
    {
      nombre: 'audiencia',
      etiqueta: 'Tipo de audiencia',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Estudiantes, Comunidad, Empleados'
    },
    {
      nombre: 'participantes',
      etiqueta: 'Número de participantes',
      tipo: 'numero',
      requerido: false
    }
  ]
};

/**
 * Map of category codes to their display names
 */
export const CATEGORIAS: Record<string, string> = {
  'plantacion': 'Plantación',
  'reciclaje': 'Reciclaje',
  'conservacion': 'Conservación',
  'educacion': 'Educación Ambiental',
  'ahorro': 'Ahorro Energético',
  'consumo': 'Consumo Responsable',
  'limpieza': 'Limpieza Ambiental',
  'otro': 'Otro'
};
