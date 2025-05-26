// front/src/app/components/education/category-view/category-view.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { EducationService } from '../../../services/education.service';
import { ArticleCardComponent } from '../article-card/article-card.component';
import {
  EducationArticle,
  EducationCategory,
  CategoryInfo,
  EDUCATION_CATEGORIES
} from '../../../models/education.model';

/**
 * Componente para mostrar artículos de una categoría específica
 * Maneja las rutas /educacion/categoria/:categoria
 */
@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ArticleCardComponent],
  templateUrl: './category-view.component.html',
  styleUrls: ['./category-view.component.scss']
})
export class CategoryViewComponent implements OnInit, OnDestroy {

  /** Categoría actual */
  currentCategory: EducationCategory | null = null;

  /** Información de la categoría */
  categoryInfo: CategoryInfo | null = null;

  /** Artículos de la categoría */
  articles: EducationArticle[] = [];

  /** Artículos destacados de la categoría */
  featuredArticles: EducationArticle[] = [];

  /** Todos los artículos de la categoría */
  allArticles: EducationArticle[] = [];

  /** Estado de carga */
  isLoading = true;

  /** Error al cargar */
  error: string | null = null;

  /** Filtro de búsqueda */
  searchQuery = '';

  /** Artículos filtrados */
  filteredArticles: EducationArticle[] = [];

  /** Observable para cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private educationService: EducationService
  ) {}

  ngOnInit(): void {
    this.subscribeToRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Suscribe a los cambios de ruta para cargar categorías
   */
  private subscribeToRouteChanges(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const categoria = params['categoria'] as EducationCategory;

        if (categoria && this.isValidCategory(categoria)) {
          this.loadCategory(categoria);
        } else {
          this.error = 'Categoría no encontrada';
          this.isLoading = false;
        }
      });
  }

  /**
   * Verifica si la categoría es válida
   * @param categoria - Categoría a verificar
   * @returns True si es válida
   */
  private isValidCategory(categoria: string): categoria is EducationCategory {
    return Object.keys(EDUCATION_CATEGORIES).includes(categoria);
  }

  /**
   * Carga los artículos de una categoría específica
   * @param categoria - Categoría a cargar
   */
  private async loadCategory(categoria: EducationCategory): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.currentCategory = categoria;
      this.categoryInfo = EDUCATION_CATEGORIES[categoria];

      // Cargar artículos de la categoría
      this.allArticles = await this.educationService.getArticlesByCategory(categoria);

      if (this.allArticles.length === 0) {
        this.error = `No hay artículos disponibles para la categoría ${this.categoryInfo.name}`;
        return;
      }

      // Separar artículos destacados
      this.featuredArticles = this.allArticles.filter(article => article.featured);
      this.articles = this.allArticles;

      // Inicializar filtros
      this.filteredArticles = [...this.allArticles];

    } catch (error) {
      console.error('Error loading category:', error);
      this.error = 'Error al cargar los artículos de la categoría. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Filtra artículos por búsqueda
   */
  filterArticles(): void {
    if (!this.searchQuery.trim()) {
      this.filteredArticles = [...this.allArticles];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredArticles = this.allArticles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(query);
      const summaryMatch = article.summary.toLowerCase().includes(query);
      const tagsMatch = article.tags.some(tag => tag.toLowerCase().includes(query));

      return titleMatch || summaryMatch || tagsMatch;
    });
  }

  /**
   * Navega a un artículo específico
   * @param article - Artículo seleccionado
   */
  navigateToArticle(article: EducationArticle): void {
    // Registrar vista del artículo
    this.educationService.recordArticleView(article.id);

    this.router.navigate(['/educacion', article.category, article.slug]);
  }

  /**
   * Navega de regreso al home de educación
   */
  goBackToHome(): void {
    this.router.navigate(['/educacion']);
  }

  /**
   * Obtiene el ícono de la categoría
   * @returns Emoji del ícono
   */
  getCategoryIcon(): string {
    const icons = {
      'agua': '💧',
      'electricidad': '⚡',
      'transporte': '🚗'
    };
    return icons[this.currentCategory!] || '📖';
  }

  /**
   * Obtiene las clases CSS para el tema
   * @returns Clases CSS
   */
  getThemeClasses(): string {
    return this.currentCategory ? `theme-${this.currentCategory}` : '';
  }

  /**
   * Obtiene el color de la categoría
   * @returns Color CSS
   */
  getCategoryColor(): string {
    return this.categoryInfo?.color || '#3498db';
  }

  /**
   * Limpia el filtro de búsqueda
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.filterArticles();
  }

  /**
   * Obtiene estadísticas de la categoría
   * @returns Objeto con estadísticas
   */
  getCategoryStats(): { total: number; featured: number; avgReadingTime: number } {
    const total = this.allArticles.length;
    const featured = this.featuredArticles.length;
    const avgReadingTime = total > 0
      ? Math.round(this.allArticles.reduce((sum, article) => sum + article.readingTime, 0) / total)
      : 0;

    return { total, featured, avgReadingTime };
  }

  /**
   * Obtiene todos los tags únicos de la categoría
   * @returns Array de tags únicos
   */
  getCategoryTags(): string[] {
    const allTags = this.allArticles.flatMap(article => article.tags);
    return [...new Set(allTags)].sort();
  }

  /**
   * Filtra por tag específico
   * @param tag - Tag seleccionado
   */
  filterByTag(tag: string): void {
    this.searchQuery = tag;
    this.filterArticles();
  }

  /**
   * Ordena artículos según criterio
   * @param criteria - Criterio de ordenamiento
   */
  sortArticles(criteria: 'date' | 'title' | 'reading-time'): void {
    switch (criteria) {
      case 'date':
        this.filteredArticles.sort((a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
        break;
      case 'title':
        this.filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'reading-time':
        this.filteredArticles.sort((a, b) => a.readingTime - b.readingTime);
        break;
    }
  }

  /**
   * Recarga la categoría actual
   */
  refresh(): void {
    if (this.currentCategory) {
      this.loadCategory(this.currentCategory);
    }
  }
}
