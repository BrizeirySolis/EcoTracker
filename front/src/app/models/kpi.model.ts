import { StatusType, TrendInfo } from '../components/kpi-cards/kpi-card/kpi-card.component';

/**
 * Data structure for KPI card configuration
 */
export interface KpiData {
  title: string;
  primaryValue: string;
  primaryUnit: string;
  secondaryValue?: string;
  secondaryUnit?: string;
  status: StatusType;
  trend?: TrendInfo;
  footerText?: string;
  sparklinePath?: string;
  sparklineEndPoint?: { x: number, y: number };
}
