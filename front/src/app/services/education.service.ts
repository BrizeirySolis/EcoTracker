// front/src/app/services/education.service.ts

import { Injectable } from '@angular/core';
import {
  EducationArticle,
  EducationCategory,
  ArticleFilter,
  ArticlesResponse,
  ArticleNavigation,
  ArticleStats,
  EDUCATION_CATEGORIES
} from '../models/education.model';

// Importar artículos de datos estáticos
import { waterEducationArticles } from '../data/water-education-article';
import { electricityEducationArticles } from '../data/electricity-education-articles';
import { transportEducationArticles } from '../data/transport-education-articles';

/**
 * Servicio para gestionar el contenido educativo
 * Maneja artículos, estadísticas de lectura y navegación
 */
@Injectable({
  providedIn: 'root'
})
export class EducationService {

  /** Clave para almacenar estadísticas en localStorage */
  private readonly STATS_STORAGE_KEY = 'ecotracker_education_stats';

  /** Clave para almacenar artículos completados */
  private readonly COMPLETED_STORAGE_KEY = 'ecotracker_completed_articles';

  /** Cache de artículos por categoría */
  private articlesCache: Map<EducationCategory, EducationArticle[]> = new Map();

  constructor() {
    this.initializeArticlesCache();
  }

  /**
   * Inicializa el cache de artículos por categoría
   */
  private initializeArticlesCache(): void {
    // Cargar artículos de agua
    this.articlesCache.set('agua', waterEducationArticles);

    // Cargar artículos de electricidad
    this.articlesCache.set('electricidad', electricityEducationArticles);

    // Cargar artículos de transporte
    this.articlesCache.set('transporte', transportEducationArticles);

    // Actualizar contadores de artículos en EDUCATION_CATEGORIES
    this.updateCategoryArticleCounts();
  }

  /**
   * Actualiza el conteo de artículos por categoría
   */
  private updateCategoryArticleCounts(): void {
    Object.keys(EDUCATION_CATEGORIES).forEach(categoryKey => {
      const category = categoryKey as EducationCategory;
      const articles = this.articlesCache.get(category) || [];
      // Note: EDUCATION_CATEGORIES es readonly, pero podemos usar type assertion para actualizar
      (EDUCATION_CATEGORIES[category] as any).articleCount = articles.length;
    });
  }

  /**
   * Obtiene todos los artículos de una categoría
   * @param category - Categoría de artículos
   * @returns Promise con array de artículos
   */
  async getArticlesByCategory(category: EducationCategory): Promise<EducationArticle[]> {
    const articles = this.articlesCache.get(category) || [];
    return Promise.resolve([...articles]);
  }

  /**
   * Obtiene un artículo específico por categoría y slug
   * @param category - Categoría del artículo
   * @param slug - Slug del artículo
   * @returns Promise con el artículo o null si no existe
   */
  async getArticleBySlug(category: EducationCategory, slug: string): Promise<EducationArticle | null> {
    const articles = await this.getArticlesByCategory(category);
    const article = articles.find(a => a.slug === slug);
    return Promise.resolve(article || null);
  }

  /**
   * Obtiene artículos destacados de todas las categorías
   * @param limit - Número máximo de artículos a retornar
   * @returns Promise con array de artículos destacados
   */
  async getFeaturedArticles(limit: number = 6): Promise<EducationArticle[]> {
    const allArticles: EducationArticle[] = [];

    // Recopilar artículos de todas las categorías
    for (const category of Object.keys(EDUCATION_CATEGORIES) as EducationCategory[]) {
      const categoryArticles = await this.getArticlesByCategory(category);
      allArticles.push(...categoryArticles);
    }

    // Filtrar por destacados y limitar
    const featuredArticles = allArticles
      .filter(article => article.featured)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, limit);

    return Promise.resolve(featuredArticles);
  }

  /**
   * Obtiene artículos populares basado en estadísticas de lectura
   * @param limit - Número máximo de artículos a retornar
   * @returns Promise con array de artículos populares
   */
  async getPopularArticles(limit: number = 5): Promise<EducationArticle[]> {
    const allArticles: EducationArticle[] = [];
    const stats = this.getArticleStats();

    // Recopilar artículos de todas las categorías
    for (const category of Object.keys(EDUCATION_CATEGORIES) as EducationCategory[]) {
      const categoryArticles = await this.getArticlesByCategory(category);
      allArticles.push(...categoryArticles);
    }

    // Ordenar por popularidad (número de vistas)
    const popularArticles = allArticles
      .map(article => ({
        article,
        views: stats[article.id]?.views || 0,
        lastViewed: stats[article.id]?.lastViewed || new Date(0)
      }))
      .sort((a, b) => {
        // Primero por vistas, luego por fecha de última vista
        if (a.views !== b.views) {
          return b.views - a.views;
        }
        return b.lastViewed.getTime() - a.lastViewed.getTime();
      })
      .slice(0, limit)
      .map(item => item.article);

    return Promise.resolve(popularArticles);
  }

  /**
   * Obtiene artículos con filtros específicos
   * @param filter - Filtros a aplicar
   * @returns Promise con respuesta que incluye artículos y metadatos
   */
  async getArticles(filter: ArticleFilter = {}): Promise<ArticlesResponse> {
    let articles: EducationArticle[] = [];

    if (filter.category) {
      articles = await this.getArticlesByCategory(filter.category);
    } else {
      // Obtener artículos de todas las categorías
      for (const category of Object.keys(EDUCATION_CATEGORIES) as EducationCategory[]) {
        const categoryArticles = await this.getArticlesByCategory(category);
        articles.push(...categoryArticles);
      }
    }

    // Aplicar filtros adicionales
    if (filter.featured !== undefined) {
      articles = articles.filter(article => article.featured === filter.featured);
    }

    if (filter.tags && filter.tags.length > 0) {
      articles = articles.filter(article =>
        filter.tags!.some(tag => article.tags.includes(tag))
      );
    }

    // Ordenar por fecha de publicación (más recientes primero)
    articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    // Aplicar límite
    if (filter.limit && filter.limit > 0) {
      articles = articles.slice(0, filter.limit);
    }

    return Promise.resolve({
      articles,
      totalCount: articles.length,
      categories: Object.values(EDUCATION_CATEGORIES)
    });
  }

  /**
   * Obtiene la navegación para un artículo específico
   * @param articleId - ID del artículo actual
   * @returns Promise con información de navegación
   */
  async getArticleNavigation(articleId: string): Promise<ArticleNavigation | null> {
    // Encontrar el artículo actual
    let currentArticle: EducationArticle | null = null;
    let currentCategory: EducationCategory | null = null;

    for (const category of Object.keys(EDUCATION_CATEGORIES) as EducationCategory[]) {
      const articles = await this.getArticlesByCategory(category);
      const found = articles.find(a => a.id === articleId);
      if (found) {
        currentArticle = found;
        currentCategory = category;
        break;
      }
    }

    if (!currentArticle || !currentCategory) {
      return Promise.resolve(null);
    }

    // Obtener artículos de la misma categoría
    const categoryArticles = await this.getArticlesByCategory(currentCategory);
    const currentIndex = categoryArticles.findIndex(a => a.id === articleId);

    // Artículo anterior y siguiente en la misma categoría
    const previous = currentIndex > 0 ? categoryArticles[currentIndex - 1] : undefined;
    const next = currentIndex < categoryArticles.length - 1 ? categoryArticles[currentIndex + 1] : undefined;

    // Artículos relacionados (misma categoría, excluyendo el actual)
    const relatedArticles = categoryArticles
      .filter(a => a.id !== articleId)
      .slice(0, 3);

    return Promise.resolve({
      current: currentArticle,
      previous,
      next,
      relatedArticles
    });
  }

  /**
   * Registra una vista de artículo
   * @param articleId - ID del artículo
   */
  recordArticleView(articleId: string): void {
    const stats = this.getArticleStats();

    if (!stats[articleId]) {
      stats[articleId] = {
        articleId,
        views: 0,
        lastViewed: new Date(),
        timeSpent: 0,
        completed: false
      };
    }

    stats[articleId].views += 1;
    stats[articleId].lastViewed = new Date();

    this.saveArticleStats(stats);
  }

  /**
   * Registra tiempo de lectura de un artículo
   * @param articleId - ID del artículo
   * @param timeSpent - Tiempo en segundos
   * @param completed - Si el artículo fue completado
   */
  recordReadingTime(articleId: string, timeSpent: number, completed: boolean = false): void {
    const stats = this.getArticleStats();

    if (!stats[articleId]) {
      stats[articleId] = {
        articleId,
        views: 0,
        lastViewed: new Date(),
        timeSpent: 0,
        completed: false
      };
    }

    stats[articleId].timeSpent += timeSpent;

    if (completed) {
      stats[articleId].completed = true;
    }

    this.saveArticleStats(stats);
  }

  /**
   * Marca un artículo como completado
   * @param articleId - ID del artículo
   */
  markArticleAsCompleted(articleId: string): void {
    const stats = this.getArticleStats();

    if (stats[articleId]) {
      stats[articleId].completed = true;
      this.saveArticleStats(stats);
    }

    // También mantener una lista separada de artículos completados
    const completed = this.getCompletedArticles();
    if (!completed.includes(articleId)) {
      completed.push(articleId);
      this.saveCompletedArticles(completed);
    }
  }

  /**
   * Obtiene las estadísticas de artículos desde localStorage
   * @returns Record con estadísticas por artículo
   */
  private getArticleStats(): Record<string, ArticleStats> {
    try {
      const stored = localStorage.getItem(this.STATS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas de string a Date
        Object.values(parsed).forEach((stat: any) => {
          stat.lastViewed = new Date(stat.lastViewed);
        });
        return parsed;
      }
    } catch (error) {
      console.warn('Error loading article stats from localStorage:', error);
    }
    return {};
  }

  /**
   * Guarda las estadísticas de artículos en localStorage
   * @param stats - Estadísticas a guardar
   */
  private saveArticleStats(stats: Record<string, ArticleStats>): void {
    try {
      localStorage.setItem(this.STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Error saving article stats to localStorage:', error);
    }
  }

  /**
   * Obtiene la lista de artículos completados
   * @returns Array de IDs de artículos completados
   */
  private getCompletedArticles(): string[] {
    try {
      const stored = localStorage.getItem(this.COMPLETED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error loading completed articles from localStorage:', error);
      return [];
    }
  }

  /**
   * Guarda la lista de artículos completados
   * @param completed - Array de IDs de artículos completados
   */
  private saveCompletedArticles(completed: string[]): void {
    try {
      localStorage.setItem(this.COMPLETED_STORAGE_KEY, JSON.stringify(completed));
    } catch (error) {
      console.warn('Error saving completed articles to localStorage:', error);
    }
  }

  /**
   * Verifica si un artículo está completado
   * @param articleId - ID del artículo
   * @returns True si el artículo está completado
   */
  isArticleCompleted(articleId: string): boolean {
    const completed = this.getCompletedArticles();
    return completed.includes(articleId);
  }

  /**
   * Obtiene estadísticas generales de lectura del usuario
   * @returns Objeto con estadísticas generales
   */
  getReadingStatistics(): {
    totalArticlesRead: number;
    totalTimeSpent: number;
    completedArticles: number;
    favoriteCategory: EducationCategory | null;
    categoryStats: Record<EducationCategory, { read: number; completed: number }>;
  } {
    const stats = this.getArticleStats();
    const completed = this.getCompletedArticles();

    const totalArticlesRead = Object.keys(stats).length;
    const totalTimeSpent = Object.values(stats).reduce((sum, stat) => sum + stat.timeSpent, 0);
    const completedArticles = completed.length;

    // Determinar categoría favorita y estadísticas por categoría
    const categoryStats: Record<EducationCategory, { read: number; completed: number }> = {
      agua: { read: 0, completed: 0 },
      electricidad: { read: 0, completed: 0 },
      transporte: { read: 0, completed: 0 }
    };

    // Contar artículos leídos y completados por categoría
    for (const [articleId, articleStat] of Object.entries(stats)) {
      const category = this.getArticleCategoryById(articleId);
      if (category) {
        categoryStats[category].read++;
        if (articleStat.completed) {
          categoryStats[category].completed++;
        }
      }
    }

    // Determinar categoría favorita basada en artículos leídos
    let favoriteCategory: EducationCategory | null = null;
    let maxRead = 0;

    Object.entries(categoryStats).forEach(([category, stat]) => {
      if (stat.read > maxRead) {
        maxRead = stat.read;
        favoriteCategory = category as EducationCategory;
      }
    });

    return {
      totalArticlesRead,
      totalTimeSpent,
      completedArticles,
      favoriteCategory,
      categoryStats
    };
  }

  /**
   * Obtiene la categoría de un artículo por su ID
   * @param articleId - ID del artículo
   * @returns Categoría del artículo o null si no se encuentra
   */
  private getArticleCategoryById(articleId: string): EducationCategory | null {
    for (const [category, articles] of this.articlesCache.entries()) {
      if (articles.find(article => article.id === articleId)) {
        return category;
      }
    }
    return null;
  }

  /**
   * Busca artículos por texto en título, resumen o tags
   * @param query - Texto a buscar
   * @param category - Categoría específica (opcional)
   * @returns Promise con artículos que coinciden con la búsqueda
   */
  async searchArticles(query: string, category?: EducationCategory): Promise<EducationArticle[]> {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    let articlesToSearch: EducationArticle[] = [];

    if (category) {
      articlesToSearch = await this.getArticlesByCategory(category);
    } else {
      // Buscar en todas las categorías
      for (const cat of Object.keys(EDUCATION_CATEGORIES) as EducationCategory[]) {
        const categoryArticles = await this.getArticlesByCategory(cat);
        articlesToSearch.push(...categoryArticles);
      }
    }

    return articlesToSearch.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(searchTerm);
      const summaryMatch = article.summary.toLowerCase().includes(searchTerm);
      const tagsMatch = article.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      return titleMatch || summaryMatch || tagsMatch;
    });
  }

  /**
   * Obtiene artículos recomendados basados en el historial de lectura
   * @param limit - Número máximo de artículos a retornar
   * @returns Promise con artículos recomendados
   */
  async getRecommendedArticles(limit: number = 5): Promise<EducationArticle[]> {
    const stats = this.getArticleStats();
    const readingStats = this.getReadingStatistics();

    // Si no hay historial, retornar artículos destacados
    if (readingStats.totalArticlesRead === 0) {
      return this.getFeaturedArticles(limit);
    }

    let allArticles: EducationArticle[] = [];

    // Recopilar artículos de todas las categorías
    for (const category of Object.keys(EDUCATION_CATEGORIES) as EducationCategory[]) {
      const categoryArticles = await this.getArticlesByCategory(category);
      allArticles.push(...categoryArticles);
    }

    // Filtrar artículos no leídos
    const unreadArticles = allArticles.filter(article => !stats[article.id]);

    // Si hay categoría favorita, priorizar artículos de esa categoría
    let recommendations: EducationArticle[] = [];

    if (readingStats.favoriteCategory) {
      const favoriteUnread = unreadArticles.filter(
        article => article.category === readingStats.favoriteCategory
      );
      recommendations.push(...favoriteUnread.slice(0, Math.ceil(limit * 0.6)));
    }

    // Completar con artículos de otras categorías
    const remainingSlots = limit - recommendations.length;
    if (remainingSlots > 0) {
      const otherUnread = unreadArticles.filter(
        article => !recommendations.includes(article)
      );
      recommendations.push(...otherUnread.slice(0, remainingSlots));
    }

    return recommendations;
  }

  /**
   * Obtiene el progreso de lectura por categoría
   * @returns Record con progreso por categoría
   */
  getCategoryProgress(): Record<EducationCategory, { read: number; total: number; percentage: number }> {
    const readingStats = this.getReadingStatistics();
    const progress: Record<EducationCategory, { read: number; total: number; percentage: number }> = {
      agua: { read: 0, total: 0, percentage: 0 },
      electricidad: { read: 0, total: 0, percentage: 0 },
      transporte: { read: 0, total: 0, percentage: 0 }
    };

    Object.keys(EDUCATION_CATEGORIES).forEach(categoryKey => {
      const category = categoryKey as EducationCategory;
      const articles = this.articlesCache.get(category) || [];
      const categoryReadStats = readingStats.categoryStats[category];

      progress[category] = {
        read: categoryReadStats.read,
        total: articles.length,
        percentage: articles.length > 0 ? Math.round((categoryReadStats.read / articles.length) * 100) : 0
      };
    });

    return progress;
  }

  /**
   * Exporta las estadísticas de lectura para backup
   * @returns Objeto con todas las estadísticas
   */
  exportReadingData(): {
    stats: Record<string, ArticleStats>;
    completed: string[];
    exportDate: string;
  } {
    return {
      stats: this.getArticleStats(),
      completed: this.getCompletedArticles(),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Importa estadísticas de lectura desde backup
   * @param data - Datos exportados previamente
   * @returns True si la importación fue exitosa
   */
  importReadingData(data: {
    stats: Record<string, ArticleStats>;
    completed: string[];
  }): boolean {
    try {
      // Validar estructura de datos
      if (!data.stats || !data.completed || !Array.isArray(data.completed)) {
        throw new Error('Formato de datos inválido');
      }

      // Importar estadísticas
      this.saveArticleStats(data.stats);
      this.saveCompletedArticles(data.completed);

      return true;
    } catch (error) {
      console.error('Error importing reading data:', error);
      return false;
    }
  }

  /**
   * Limpia todas las estadísticas de lectura
   */
  clearAllStats(): void {
    try {
      localStorage.removeItem(this.STATS_STORAGE_KEY);
      localStorage.removeItem(this.COMPLETED_STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing article stats:', error);
    }
  }
}
