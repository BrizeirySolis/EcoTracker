import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsumptionTabType } from '../../models/dashboard.model';

/**
 * Component that handles tab navigation for different consumption types
 */
@Component({
  selector: 'app-consumption-tab',
  templateUrl: './consumption-tab.component.html',
  styleUrls: ['./consumption-tab.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ConsumptionTabComponent {
  @Input() activeTab: ConsumptionTabType = 'agua';
  @Output() tabChange = new EventEmitter<ConsumptionTabType>();

  /**
   * Emits the selected tab type to parent component
   * @param tab The consumption tab type to select
   */
  selectTab(tab: ConsumptionTabType): void {
    this.tabChange.emit(tab);
  }
}
