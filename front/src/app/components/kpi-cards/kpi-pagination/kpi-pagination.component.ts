import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-pagination',
  templateUrl: './kpi-pagination.component.html',
  styleUrls: ['./kpi-pagination.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class KpiPaginationComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 3;
  @Output() pageChange = new EventEmitter<number>();

  /**
   * Navigate to previous page
   */
  prevPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
