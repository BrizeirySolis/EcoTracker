// front/src/app/components/education/education-home/education-home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EducationService } from '../../../services/education.service';
import { ArticleCardComponent } from '../article-card/article-card.component';
import {
  EducationArticle,
  EducationCategory,
  CategoryInfo,
  EDUCATION_CATEGORIES
} from '../../../models/education.model';

/**
 * Componente principal del módulo educativo
 * Muestra las categorías disponibles y artículos destacados
 */
@Component({
  selector: 'app-education-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ArticleCardComponent],
  templateUrl: './education-home.component.html',
  styleUrls: ['./education-home.component.scss']
})
export class EducationHomeComponent implements OnInit {

  /** Categorías educativas disponibles */
  categories: CategoryInfo[] = [];

  /** Artículos destacados por categoría */
  featuredArticles: EducationArticle[] = [];

  /** Artículos más populares */
  popularArticles: EducationArticle[] = [];

  /** Estado de carga */
  isLoading = true;

  /** Error al cargar datos */
  error: string | null = null;

  constructor(
    private educationService: EducationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEducationData();
  }

  /**
   * Carga los datos iniciales del módulo educativo
   */
  private async loadEducationData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Cargar categorías
      this.categories = Object.values(EDUCATION_CATEGORIES);

      // Cargar artículos destacados
      this.featuredArticles = await this.educationService.getFeaturedArticles();

      // Cargar artículos populares (basado en estadísticas locales)
      this.popularArticles = await this.educationService.getPopularArticles(3);

    } catch (error) {
      console.error('Error loading education data:', error);
      this.error = 'Error al cargar el contenido educativo. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navega a los artículos de una categoría específica
   * @param category - Categoría seleccionada
   */
  navigateToCategory(category: EducationCategory): void {
    this.router.navigate(['/educacion', 'categoria', category]);
  }

  /**
   * Navega a un artículo específico
   * @param article - Artículo seleccionado
   */
  navigateToArticle(article: EducationArticle): void {
    // Registrar vista del artículo para estadísticas
    this.educationService.recordArticleView(article.id);

    this.router.navigate(['/educacion', article.category, article.slug]);
  }

  /**
   * Obtiene el ícono para una categoría
   * @param categoryId - ID de la categoría
   * @returns Nombre del ícono
   */
  getCategoryIcon(categoryId: EducationCategory): string {
    const icons = {
      'agua': 'droplets',
      'electricidad': 'zap',
      'transporte': 'car'
    };
    return icons[categoryId] || 'book';
  }

  /**
   * Obtiene artículos destacados por categoría
   * @param category - Categoría
   * @returns Artículos de la categoría
   */
  getArticlesByCategory(category: EducationCategory): EducationArticle[] {
    return this.featuredArticles.filter(article => article.category === category);
  }

  /**
   * Formatea el tiempo de lectura
   * @param minutes - Minutos de lectura
   * @returns Texto formateado
   */
  formatReadingTime(minutes: number): string {
    return minutes === 1 ? '1 min de lectura' : `${minutes} min de lectura`;
  }

  /**
   * Recarga los datos del módulo
   */
  refresh(): void {
    this.loadEducationData();
  }
}
