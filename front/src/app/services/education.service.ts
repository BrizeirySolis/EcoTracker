// front/src/app/services/education.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  EducationArticle,
  EducationCategory,
  CategoryInfo,
  EDUCATION_CATEGORIES,
  ArticleFilter,
  ArticlesResponse,
  ArticleNavigation,
  ArticleStats
} from '../models/education.model';
import { waterEducationArticles } from '../data/water-education-article';

/**
 * Service for managing educational articles and related functionality
 * Handles article retrieval, statistics, and navigation
 */
@Injectable({
  providedIn: 'root'
})
export class EducationService {
  // Para futuras expansiones con electricidad y transporte
  private allArticles: EducationArticle[] = [
    ...waterEducationArticles
    // Aquí agregaremos los artículos de electricidad y transporte
  ];

  // BehaviorSubject para tracking de estadísticas
  private articlesStatsSubject = new BehaviorSubject<ArticleStats[]>(this.loadStatsFromStorage());
  public articlesStats$ = this.articlesStatsSubject.asObservable();

  constructor() {
    // Cargar estadísticas guardadas al inicializar el servicio
    this.loadStatsFromStorage();
  }

  /**
   * Obtener todas las categorías disponibles con información
   * @returns Observable con información de categorías
   */
  getCategories(): Observable<CategoryInfo[]> {
    const categories = Object.values(EDUCATION_CATEGORIES).map(category => ({
      ...category,
      articleCount: this.allArticles.filter(article => article.category === category.id).length
    }));

    return of(categories);
  }

  /**
   * Obtener artículos con filtros opcionales
   * @param filter Filtros para aplicar a los artículos
   * @returns Observable con artículos filtrados
   */
  getArticles(filter?: ArticleFilter): Observable<ArticlesResponse> {
    let filteredArticles = [...this.allArticles];

    // Aplicar filtros
    if (filter?.category) {
      filteredArticles = filteredArticles.filter(article => article.category === filter.category);
    }

    if (filter?.featured !== undefined) {
      filteredArticles = filteredArticles.filter(article => article.featured === filter.featured);
    }

    if (filter?.tags && filter.tags.length > 0) {
      filteredArticles = filteredArticles.filter(article =>
        filter.tags!.some(tag => article.tags.includes(tag))
      );
    }

    // Ordenar por fecha de publicación (más recientes primero)
    filteredArticles.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

    // Aplicar límite si se especifica
    if (filter?.limit) {
      filteredArticles = filteredArticles.slice(0, filter.limit);
    }

    return of({
      articles: filteredArticles,
      totalCount: filteredArticles.length,
      categories: Object.values(EDUCATION_CATEGORIES)
    });
  }

  /**
   * Obtener un artículo específico por slug
   * @param slug Slug del artículo
   * @returns Observable con el artículo encontrado
   */
  getArticleBySlug(slug: string): Observable<EducationArticle | null> {
    const article = this.allArticles.find(article => article.slug === slug);

    if (article) {
      // Registrar vista del artículo
      this.recordArticleView(article.id);
    }

    return of(article || null);
  }

  /**
   * Obtener navegación para un artículo (anterior, siguiente, relacionados)
   * @param currentArticle Artículo actual
   * @returns Observable con información de navegación
   */
  getArticleNavigation(currentArticle: EducationArticle): Observable<ArticleNavigation> {
    // Obtener artículos de la misma categoría
    const categoryArticles = this.allArticles
      .filter(article => article.category === currentArticle.category)
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

    const currentIndex = categoryArticles.findIndex(article => article.id === currentArticle.id);

    const navigation: ArticleNavigation = {
      current: currentArticle,
      previous: currentIndex > 0 ? categoryArticles[currentIndex - 1] : undefined,
      next: currentIndex < categoryArticles.length - 1 ? categoryArticles[currentIndex + 1] : undefined,
      relatedArticles: this.getRelatedArticles(currentArticle, 3)
    };

    return of(navigation);
  }

  /**
   * Obtener artículos relacionados basados en tags y categoría
   * @param article Artículo base
   * @param limit Número máximo de artículos relacionados
   * @returns Array de artículos relacionados
   */
  private getRelatedArticles(article: EducationArticle, limit: number = 3): EducationArticle[] {
    return this.allArticles
      .filter(a => a.id !== article.id) // Excluir el artículo actual
      .filter(a => a.category === article.category || // Misma categoría
        a.tags.some(tag => article.tags.includes(tag))) // Tags en común
      .sort((a, b) => {
        // Priorizar por número de tags coincidentes
        const aMatches = a.tags.filter(tag => article.tags.includes(tag)).length;
        const bMatches = b.tags.filter(tag => article.tags.includes(tag)).length;
        return bMatches - aMatches;
      })
      .slice(0, limit);
  }

  /**
   * Registrar vista de un artículo
   * @param articleId ID del artículo
   */
  recordArticleView(articleId: string): void {
    const currentStats = this.articlesStatsSubject.value;
    const existingStatIndex = currentStats.findIndex(stat => stat.articleId === articleId);

    if (existingStatIndex >= 0) {
      // Actualizar estadística existente
      currentStats[existingStatIndex] = {
        ...currentStats[existingStatIndex],
        views: currentStats[existingStatIndex].views + 1,
        lastViewed: new Date()
      };
    } else {
      // Crear nueva estadística
      currentStats.push({
        articleId,
        views: 1,
        lastViewed: new Date(),
        timeSpent: 0,
        completed: false
      });
    }

    // Actualizar BehaviorSubject y localStorage
    this.articlesStatsSubject.next(currentStats);
    this.saveStatsToStorage(currentStats);
  }

  /**
   * Marcar artículo como completado
   * @param articleId ID del artículo
   * @param timeSpent Tiempo gastado leyendo (en segundos)
   */
  markArticleCompleted(articleId: string, timeSpent: number): void {
    const currentStats = this.articlesStatsSubject.value;
    const existingStatIndex = currentStats.findIndex(stat => stat.articleId === articleId);

    if (existingStatIndex >= 0) {
      currentStats[existingStatIndex] = {
        ...currentStats[existingStatIndex],
        completed: true,
        timeSpent: Math.max(currentStats[existingStatIndex].timeSpent, timeSpent)
      };
    } else {
      currentStats.push({
        articleId,
        views: 1,
        lastViewed: new Date(),
        timeSpent,
        completed: true
      });
    }

    this.articlesStatsSubject.next(currentStats);
    this.saveStatsToStorage(currentStats);
  }

  /**
   * Obtener estadísticas de un artículo específico
   * @param articleId ID del artículo
   * @returns Estadísticas del artículo o null si no existen
   */
  getArticleStats(articleId: string): ArticleStats | null {
    const currentStats = this.articlesStatsSubject.value;
    return currentStats.find(stat => stat.articleId === articleId) || null;
  }

  /**
   * Obtener artículos más leídos
   * @param limit Número de artículos a retornar
   * @returns Observable con artículos más populares
   */
  getMostReadArticles(limit: number = 5): Observable<EducationArticle[]> {
    const currentStats = this.articlesStatsSubject.value;

    // Ordenar por número de vistas
    const sortedStats = currentStats
      .filter(stat => stat.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    // Obtener artículos correspondientes
    const popularArticles = sortedStats
      .map(stat => this.allArticles.find(article => article.id === stat.articleId))
      .filter(article => article !== undefined) as EducationArticle[];

    return of(popularArticles);
  }

  /**
   * Buscar artículos por texto
   * @param query Término de búsqueda
   * @returns Observable con artículos que coinciden con la búsqueda
   */
  searchArticles(query: string): Observable<EducationArticle[]> {
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return of([]);
    }

    const results = this.allArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      article.content.toLowerCase().includes(searchTerm)
    );

    return of(results);
  }

  /**
   * Cargar estadísticas desde localStorage
   * @returns Array de estadísticas o array vacío
   */
  private loadStatsFromStorage(): ArticleStats[] {
    try {
      const stored = localStorage.getItem('ecotracker_education_stats');
      if (stored) {
        const stats = JSON.parse(stored);
        // Convertir fechas de string a Date
        return stats.map((stat: any) => ({
          ...stat,
          lastViewed: new Date(stat.lastViewed)
        }));
      }
    } catch (error) {
      console.warn('Error loading education stats from localStorage:', error);
    }
    return [];
  }

  /**
   * Guardar estadísticas en localStorage
   * @param stats Estadísticas a guardar
   */
  private saveStatsToStorage(stats: ArticleStats[]): void {
    try {
      localStorage.setItem('ecotracker_education_stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('Error saving education stats to localStorage:', error);
    }
  }

  /**
   * Limpiar todas las estadísticas (para desarrollo/testing)
   */
  clearAllStats(): void {
    this.articlesStatsSubject.next([]);
    localStorage.removeItem('ecotracker_education_stats');
  }
}
