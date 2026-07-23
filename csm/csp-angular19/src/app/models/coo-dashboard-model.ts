/**
 * Dashboard Search Parameters Model
 * Matches legacy API expectations with uppercase property names
 */
export class DashboardSearchParams {
  CUST_ID: string[] = [];
  PROJ_IDS: string[] = [];
  START_DATE: Date = new Date();
  END_DATE: Date = new Date();
  ALL_PROJECTS: boolean = false;
  
  // Alternative lowercase properties for compatibility
  customerIds: string[] = [];
  projectIds: string[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  viewId: number = 1;
}

/**
 * Name-Value Pair Model for chart data
 */
export class NameValuePair {
  Name: string;
  value: number;

  constructor(name: string, value: number) {
    this.Name = name;
    this.value = value;
  }
}
