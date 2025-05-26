// front/src/app/components/education/article-card/article-card.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EducationArticle, EDUCATION_CATEGORIES } from '../../../models/education.model';

/**
 * Componente reutilizable para mostrar tarjetas de artículos educativos
 * Muestra información resumida del artículo con diseño temático según la categoría
 */
@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent implements OnInit {

  /** Artículo a mostrar */
  @Input() article!: EducationArticle;

  /** Mostrar la categoría en la tarjeta */
  @Input() showCategory: boolean = true;

  /** Mostrar el tiempo de lectura */
  @Input() showReadingTime: boolean = true;

  /** Mostrar el resumen del artículo */
  @Input() showSummary: boolean = true;

  /** Mostrar fecha de publicación */
  @Input() showPublishDate: boolean = false;

  /** Mostrar tags del artículo */
  @Input() showTags: boolean = false;

  /** Marcar como artículo destacado */
  @Input() featured: boolean = false;

  /** Modo compacto para listas */
  @Input() compact: boolean = false;

  /** Evento emitido cuando se hace clic en el artículo */
  @Output() articleClick = new EventEmitter<EducationArticle>();

  /** Información de la categoría */
  categoryInfo: any;

  /** URL de imagen por defecto si no se proporciona */
  defaultImageUrl = 'https://concepto.de/wp-content/uploads/2013/08/ecolog%C3%ADa-e1551739090805.jpg';

  ngOnInit(): void {
    if (this.article) {
      this.categoryInfo = EDUCATION_CATEGORIES[this.article.category];
    }
  }

  /**
   * Maneja el clic en la tarjeta del artículo
   */
  onArticleClick(): void {
    if (this.article) {
      this.articleClick.emit(this.article);
    }
  }

  /**
   * Maneja el clic/enter en elementos con teclado
   * @param event - Evento de teclado
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onArticleClick();
    }
  }

  /**
   * Obtiene la imagen del artículo o la por defecto
   * @returns URL de la imagen
   */
  getArticleImage(): string {
    return this.article?.imageUrl || this.defaultImageUrl;
  }

  /**
   * Formatea el tiempo de lectura
   * @returns Texto formateado del tiempo de lectura
   */
  getReadingTimeText(): string {
    if (!this.article?.readingTime) return '';

    const minutes = this.article.readingTime;
    return minutes === 1 ? '1 min' : `${minutes} min`;
  }

  /**
   * Obtiene el nombre de la categoría
   * @returns Nombre de la categoría
   */
  getCategoryName(): string {
    return this.categoryInfo?.name || this.article?.category || '';
  }

  /**
   * Obtiene el color de la categoría
   * @returns Color CSS de la categoría
   */
  getCategoryColor(): string {
    return this.categoryInfo?.color || '#3498db';
  }

  /**
   * Obtiene el ícono de la categoría
   * @returns Emoji del ícono de la categoría
   */
  getCategoryIcon(): string {
    const icons = {
      'agua': '💧',
      'electricidad': '⚡',
      'transporte': '🚗'
    };
    return icons[this.article?.category] || '📖';
  }

  /**
   * Formatea la fecha de publicación
   * @returns Fecha formateada
   */
  getFormattedDate(): string {
    if (!this.article?.publishDate) return '';

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(this.article.publishDate));
  }

  /**
   * Trunca el resumen si es muy largo
   * @param maxLength - Longitud máxima del resumen
   * @returns Resumen truncado
   */
  getTruncatedSummary(maxLength: number = 120): string {
    if (!this.article?.summary) return '';

    if (this.article.summary.length <= maxLength) {
      return this.article.summary;
    }

    return this.article.summary.substring(0, maxLength).trim() + '...';
  }

  /**
   * Verifica si el artículo tiene tags
   * @returns True si tiene tags
   */
  hasTags(): boolean {
    return this.article?.tags && this.article.tags.length > 0;
  }

  /**
   * Obtiene una selección limitada de tags
   * @param limit - Número máximo de tags a mostrar
   * @returns Array de tags limitado
   */
  getLimitedTags(limit: number = 3): string[] {
    if (!this.hasTags()) return [];
    return this.article.tags.slice(0, limit);
  }

  /**
   * Maneja errores al cargar imágenes
   * @param event - Evento de error
   */
  onImageError(event: any): void {
    event.target.src = this.defaultImageUrl;
  }

  /**
   * Obtiene las clases CSS para la tarjeta
   * @returns String con las clases CSS
   */
  getCardClasses(): string {
    const classes = ['article-card'];

    if (this.article?.category) {
      classes.push(`theme-${this.article.category}`);
    }

    if (this.featured) {
      classes.push('featured');
    }

    if (this.compact) {
      classes.push('compact');
    }

    return classes.join(' ');
  }
}
