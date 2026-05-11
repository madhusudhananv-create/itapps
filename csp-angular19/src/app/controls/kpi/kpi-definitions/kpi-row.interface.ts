// KPI Data Models for Angular 19 with Signals

export interface TargetBand {
  description: string;
  operator: string;
  value: number | string;
}

export interface KpiRow {
  id: number;
  kpiIdentifier: string;
  workGroup: string;
  kpiName: string;
  serviceTower: string;
  supportWindow: string;
  priority: string;
  frequency: string;
  targets: TargetBand[];   // array of 3-4 target bands (bronze/silver/gold/platinum)
  unitOfMeasurement: string;
  isExpired: boolean;      // true if target end date < today → show red
  
  // Original data structure mapping
  kpI_UNIQUEID?: string;
  servicE_AREA?: string;
  kpI_NAME?: string;
  servicE_TOWER_ID?: string[];
  supporT_WINDOW?: string;
  slA_TARGET_UNIT_OF_MEASUREMENT?: string;
  kpI_TARGETS?: any[];
}