// front/src/app/models/education.model.ts

/**
 * Modelo principal para artículos educativos
 * Representa contenido educativo sobre temas ambientales
 */
export interface EducationArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string; // HTML content
  category: EducationCategory;
  imageUrl?: string;
  readingTime: number; // en minutos
  tags: string[];
  publishDate: Date;
  featured: boolean;
}

/**
 * Tipos de categorías educativas disponibles
 */
export type EducationCategory = 'agua' | 'electricidad' | 'transporte';

/**
 * Información sobre una categoría educativa
 */
export interface CategoryInfo {
  id: EducationCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
  darkColor: string;
  articleCount: number;
}

/**
 * Estadísticas de lectura de artículos (usando localStorage)
 */
export interface ArticleStats {
  articleId: string;
  views: number;
  lastViewed: Date;
  timeSpent: number; // en segundos
  completed: boolean;
}

/**
 * Configuración de categorías con su información de diseño
 */
export const EDUCATION_CATEGORIES: Record<EducationCategory, CategoryInfo> = {
  'agua': {
    id: 'agua',
    name: 'Conservación del Agua',
    description: 'Aprende técnicas efectivas para reducir tu consumo de agua y proteger este recurso vital.',
    icon: 'droplet',
    color: 'var(--color-agua-primary, #0288D1)',
    lightColor: 'var(--color-agua-light, #B3E5FC)',
    darkColor: 'var(--color-agua-dark, #01579B)',
    articleCount: 3
  },
  'electricidad': {
    id: 'electricidad',
    name: 'Eficiencia Energética',
    description: 'Descubre cómo optimizar tu consumo eléctrico y adoptar tecnologías más eficientes.',
    icon: 'zap',
    color: 'var(--color-electricidad-primary, #FFB300)',
    lightColor: 'var(--color-electricidad-light, #FFECB3)',
    darkColor: 'var(--color-electricidad-dark, #FF8F00)',
    articleCount: 3
  },
  'transporte': {
    id: 'transporte',
    name: 'Movilidad Sostenible',
    description: 'Explora alternativas de transporte ecológicas que reducen tu huella de carbono.',
    icon: 'car',
    color: 'var(--color-transporte-primary, #43A047)',
    lightColor: 'var(--color-transporte-light, #C8E6C9)',
    darkColor: 'var(--color-transporte-dark, #2E7D32)',
    articleCount: 3
  }
};

/**
 * Request para obtener artículos con filtros
 */
export interface ArticleFilter {
  category?: EducationCategory;
  featured?: boolean;
  tags?: string[];
  limit?: number;
}

/**
 * Respuesta con artículos y metadatos
 */
export interface ArticlesResponse {
  articles: EducationArticle[];
  totalCount: number;
  categories: CategoryInfo[];
}

/**
 * Resultado de búsqueda de artículos
 */
export interface ArticleSearchResult {
  articles: EducationArticle[];
  query: string;
  totalResults: number;
}

/**
 * Configuración para el componente de artículos
 */
export interface ArticleDisplayConfig {
  showReadingTime: boolean;
  showTags: boolean;
  showPublishDate: boolean;
  showSummary: boolean;
  maxSummaryLength: number;
}

/**
 * Datos para navegación entre artículos
 */
export interface ArticleNavigation {
  current: EducationArticle;
  previous?: EducationArticle;
  next?: EducationArticle;
  relatedArticles: EducationArticle[];
}
