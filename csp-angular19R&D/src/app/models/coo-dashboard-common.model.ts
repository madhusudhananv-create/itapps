/**
 * COO Dashboard Common Singleton
 * Manages shared state across COO Dashboard components
 */
import { DashboardSearchParams, NameValuePair } from './coo-dashboard-model';
import * as Highcharts from 'highcharts';

export class COODashboardCommon {
  private static instance: COODashboardCommon;

  AllAccounts: boolean = false;
  customerIds: string[] = [];
  projectIds: string[] = [];
  ViewId: number = 5; // Default to Monthly view (matches legacy)
  dashboardStartdate: Date = new Date();
  dashboardEnddate: Date = new Date();
  progress: boolean = false;

  // Risk Dashboard properties
  riskStatus: string[] = [];
  businessUnit: string[] = [];
  overAllData: any = null;

  // CSAT properties
  csmIds: any[] = [];
  cssDashboardInputs: any = null;
  custIds: string[] = [];
  frequency: string = '';

  // Overall Status properties
  selectedQPeriodCsg: string = 'Q1';
  selectedQPeriodCss: string = 'Q1';
  selectedYearCsg: number = new Date().getFullYear();
  selectedYearCss: number = new Date().getFullYear();
  customerSuccessGoalScore: number = 0;
  overallHealthIndex: number = 0;
  earlyWarningSignalCount: number = 0;
  LastQtrScore: number = 0;
  YTMScore: number = 0;
  csgLastQtrChangeText: string = '0% change';
  kpiLastQtrChangeText: string = '0% change';

  // Account Health data
  accountOverallHealth: any = null;
  performDataAccounts: NameValuePair[] = [];
  performDataPortfolios: NameValuePair[] = [];
  performDataProjects: NameValuePair[] = [];
  nonPerformDataAccounts: NameValuePair[] = [];
  nonPerformDataPortfolios: NameValuePair[] = [];
  nonPerformDataProjects: NameValuePair[] = [];

  // Top 3 performing/non-performing
  top3Accounts: NameValuePair[] = [];
  top3Portfolios: NameValuePair[] = [];
  top3Projects: NameValuePair[] = [];
  top3AccountsCsg: NameValuePair[] = [];
  top3PortfoliosCsg: NameValuePair[] = [];
  top3ProjectsCsg: NameValuePair[] = [];

  // Donut chart
  loadDonutIp: string = 'UC';
  donutChart!: Highcharts.Options;
  nfucSummaryData: any[] = [];

  // KPI Perspectives
  KPIPerspectives: any = null;

  // Customer Success Survey
  customerSuccessSurvey: any = null;

  // Customer list
  customersList: any[] = [];
  selectedCustomerID: string = '';
  selectedCustomerName: string = '';

  private constructor() {
    // Initialize default risk status
    this.riskStatus = ['Assessed', 'Closed', 'Identified', 'In-Process', 'Not-Occurred', 'Occurred', 'Planned'];
  }

  static GetInstance(): COODashboardCommon {
    if (!COODashboardCommon.instance) {
      COODashboardCommon.instance = new COODashboardCommon();
    }
    return COODashboardCommon.instance;
  }

  /**
   * Load parameters for dashboard API calls
   * Matches legacy format with both uppercase and lowercase properties
   */
  LoadParams(): DashboardSearchParams {
    const params = new DashboardSearchParams();
    
    // Set uppercase properties (for backend API compatibility)
    params.CUST_ID = this.customerIds && this.customerIds.length > 0 ? this.customerIds : ['-1'];
    params.PROJ_IDS = this.projectIds && this.projectIds.length > 0 ? this.projectIds : ['-1'];
    params.START_DATE = this.dashboardStartdate;
    params.END_DATE = this.dashboardEnddate;
    params.ALL_PROJECTS = this.AllAccounts || false;
    
    // Also set lowercase properties (for internal use)
    params.customerIds = params.CUST_ID;
    params.projectIds = params.PROJ_IDS;
    params.startDate = params.START_DATE;
    params.endDate = params.END_DATE;
    params.viewId = this.ViewId;
    
    return params;
  }

  /**
   * Get period text for display
   */
  GetPeriodText(quarter: string, year: number): string {
    const quarterMap: { [key: string]: string } = {
      'Q1': `Apr-Jun ${year}`,
      'Q2': `Jul-Sep ${year}`,
      'Q3': `Oct-Dec ${year}`,
      'Q4': `Jan-Mar ${year + 1}`,
      'YT': `Year to Date ${year}`
    };
    return quarterMap[quarter] || `${quarter} ${year}`;
  }

  /**
   * Get change in score text
   */
  getChangeInScore(currentScore: number, previousScore: number): string {
    if (previousScore === 0) return '0% change';
    const change = currentScore - previousScore;
    const percentChange = (change / previousScore) * 100;
    const direction = change >= 0 ? 'increase' : 'decrease';
    return `${Math.abs(percentChange).toFixed(1)}% ${direction}`;
  }

  /**
   * Sort data helper
   */
  sortData(data: NameValuePair[], descending: boolean = false): NameValuePair[] {
    return data.sort((a, b) => {
      return descending ? b.value - a.value : a.value - b.value;
    });
  }

  /**
   * Group data helper (for aggregation)
   */
  groupData(data: NameValuePair[]): NameValuePair[] {
    // For now, return as-is. Can add grouping logic if needed
    return data;
  }

  /**
   * Load risk dashboard
   */
  LoadRiskDashboard(): void {
  }

  /**
   * Load CSAT insights inputs
   */
  loadCSATInsightsInputs(csmIds: any[]): void {
    const obj: any = {};
    obj.StarT_DATE = this.dashboardStartdate?.toISOString() || '';
    obj.enD_DATE = this.dashboardEnddate?.toISOString() || '';
    obj.customeR_IDS = this.customerIds.join(',');
    obj.frequency = this.frequency;
    obj.csM_IDs = csmIds?.filter((x: any) => x !== '-1').join(',') || '';
    obj.projecT_IDS = this.projectIds.join(',');
    this.cssDashboardInputs = obj;
  }
}


