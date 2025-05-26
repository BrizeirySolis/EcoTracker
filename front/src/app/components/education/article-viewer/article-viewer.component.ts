// front/src/app/components/education/article-viewer/article-viewer.component.ts

import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { EducationService } from '../../../services/education.service';
import { ArticleCardComponent } from '../article-card/article-card.component';
import {
  EducationArticle,
  EducationCategory,
  ArticleNavigation,
  EDUCATION_CATEGORIES
} from '../../../models/education.model';

/**
 * Componente para mostrar el contenido completo de un artículo educativo
 * Incluye navegación, contenido sanitizado y artículos relacionados
 */
@Component({
  selector: 'app-article-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule, ArticleCardComponent],
  templateUrl: './article-viewer.component.html',
  styleUrls: ['./article-viewer.component.scss']
})
export class ArticleViewerComponent implements OnInit, OnDestroy {

  /** Artículo actual */
  currentArticle: EducationArticle | null = null;

  /** Navegación entre artículos */
  navigation: ArticleNavigation | null = null;

  /** Contenido HTML sanitizado */
  sanitizedContent: SafeHtml | null = null;

  /** Categoría actual */
  currentCategory: EducationCategory | null = null;

  /** Información de la categoría */
  categoryInfo: any;

  /** Estado de carga */
  isLoading = true;

  /** Error al cargar */
  error: string | null = null;

  /** Tiempo de inicio de lectura */
  private startTime: number = 0;

  /** Observable para cleanup */
  private destroy$ = new Subject<void>();

  /** Estadísticas de lectura */
  readingStats = {
    timeSpent: 0,
    scrollProgress: 0,
    completed: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private educationService: EducationService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.startTime = Date.now();
    this.subscribeToRouteChanges();

    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollTracking();
    }
  }

  ngOnDestroy(): void {
    this.recordReadingTime();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Suscribe a los cambios de ruta para cargar artículos
   */
  private subscribeToRouteChanges(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const category = params['tipo'] as EducationCategory;
        const slug = params['slug'];

        if (category && slug) {
          this.loadArticle(category, slug);
        } else {
          this.error = 'Parámetros de artículo inválidos';
          this.isLoading = false;
        }
      });
  }

  /**
   * Carga un artículo específico
   * @param category - Categoría del artículo
   * @param slug - Slug del artículo
   */
  private async loadArticle(category: EducationCategory, slug: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.currentCategory = category;
      this.categoryInfo = EDUCATION_CATEGORIES[category];

      // Cargar artículo
      this.currentArticle = await this.educationService.getArticleBySlug(category, slug);

      if (!this.currentArticle) {
        this.error = 'Artículo no encontrado';
        return;
      }

      // Sanitizar contenido HTML
      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(
        this.currentArticle.content
      );

      // Cargar navegación
      this.navigation = await this.educationService.getArticleNavigation(this.currentArticle.id);

      // Registrar vista del artículo
      this.educationService.recordArticleView(this.currentArticle.id);

      // Resetear estadísticas de lectura
      this.resetReadingStats();

    } catch (error) {
      console.error('Error loading article:', error);
      this.error = 'Error al cargar el artículo. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Configura el seguimiento del scroll para estadísticas
   */
  private setupScrollTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const totalScrollable = documentHeight - windowHeight;
      const scrollProgress = Math.min((scrollTop / totalScrollable) * 100, 100);

      this.readingStats.scrollProgress = scrollProgress;

      // Marcar como completado si se scrollea más del 80%
      if (scrollProgress > 80 && !this.readingStats.completed) {
        this.readingStats.completed = true;
        this.markArticleAsCompleted();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup en destroy
    this.destroy$.subscribe(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }

  /**
   * Resetea las estadísticas de lectura
   */
  private resetReadingStats(): void {
    this.startTime = Date.now();
    this.readingStats = {
      timeSpent: 0,
      scrollProgress: 0,
      completed: false
    };
  }

  /**
   * Registra el tiempo de lectura
   */
  private recordReadingTime(): void {
    if (this.currentArticle && this.startTime) {
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
      this.readingStats.timeSpent = timeSpent;

      this.educationService.recordReadingTime(
        this.currentArticle.id,
        timeSpent,
        this.readingStats.completed
      );
    }
  }

  /**
   * Marca el artículo como completado
   */
  private markArticleAsCompleted(): void {
    if (this.currentArticle) {
      this.educationService.markArticleAsCompleted(this.currentArticle.id);
    }
  }

  /**
   * Navega al artículo anterior
   */
  goToPreviousArticle(): void {
    if (this.navigation?.previous) {
      this.navigateToArticle(this.navigation.previous);
    }
  }

  /**
   * Navega al artículo siguiente
   */
  goToNextArticle(): void {
    if (this.navigation?.next) {
      this.navigateToArticle(this.navigation.next);
    }
  }

  /**
   * Navega a un artículo específico
   * @param article - Artículo destino
   */
  navigateToArticle(article: EducationArticle): void {
    this.recordReadingTime(); // Guardar tiempo antes de navegar
    this.router.navigate(['/educacion', article.category, article.slug]);
  }

  /**
   * Regresa a la página de categoría
   */
  goBackToCategory(): void {
    if (this.currentCategory) {
      this.router.navigate(['/educacion', 'categoria', this.currentCategory]);
    } else {
      this.router.navigate(['/educacion']);
    }
  }

  /**
   * Regresa al home de educación
   */
  goBackToHome(): void {
    this.router.navigate(['/educacion']);
  }

  /**
   * Comparte el artículo
   * @param platform - Plataforma de compartir
   */
  shareArticle(platform: string): void {
    if (!this.currentArticle) return;

    const url = window.location.href;
    const title = this.currentArticle.title;
    const summary = this.currentArticle.summary;

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(summary + '\n\n' + url)}`;
        break;
      default:
        this.copyToClipboard(url);
        return;
    }

    if (isPlatformBrowser(this.platformId)) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  /**
   * Copia el enlace al portapapeles
   * @param text - Texto a copiar
   */
  private async copyToClipboard(text: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías mostrar un toast de confirmación
      console.log('Enlace copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  }

  /**
   * Obtiene el tiempo estimado de lectura
   * @returns Texto formateado del tiempo
   */
  getReadingTimeText(): string {
    if (!this.currentArticle?.readingTime) return '';

    const minutes = this.currentArticle.readingTime;
    return minutes === 1 ? '1 minuto de lectura' : `${minutes} minutos de lectura`;
  }

  /**
   * Obtiene la fecha formateada de publicación
   * @returns Fecha formateada
   */
  getFormattedPublishDate(): string {
    if (!this.currentArticle?.publishDate) return '';

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(this.currentArticle.publishDate));
  }

  /**
   * Obtiene el progreso de lectura como porcentaje
   * @returns Porcentaje de progreso
   */
  getReadingProgress(): number {
    return Math.round(this.readingStats.scrollProgress);
  }

  /**
   * Verifica si hay artículos relacionados
   * @returns True si hay artículos relacionados
   */
  hasRelatedArticles(): boolean {
    return !!(this.navigation?.relatedArticles && this.navigation.relatedArticles.length > 0);
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
   * Recarga el artículo actual
   */
  refresh(): void {
    if (this.currentCategory && this.currentArticle?.slug) {
      this.loadArticle(this.currentCategory, this.currentArticle.slug);
    }
  }
}
