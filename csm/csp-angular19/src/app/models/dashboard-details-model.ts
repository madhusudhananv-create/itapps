/**
 * Dashboard Details Models
 * Migrated from Angular 6 to Angular 19
 * 
 * Models for dashboard data including KPI scores, portfolio details, and task summaries
 */

export interface DashboardDetailsModel {
  id: number;
  title: string;
  content: string;
  color: string;
  comments: string;
  cusT_ID: string;
  proJ_ID: string;
  portfoliO_ID: number;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

export interface AllPortfolioDetails {
  portfoliO_NAME: string;
  projectS_COUNT: number;
  succesS_GOAL_PERFORMANCE: string;
  procesS_COMPLIANCE_PERCENTAGE: string;
  succesS_SURVEY: string;
  riskS_HIGH: string;
  riskS_MEDIUM: string;
  riskS_LOW: string;
  riskS_TOTAL: number;
  automationS_COUNT: string;
  ideaS_COUNT: string;
  improvementS_COUNT: string;
  ideaS_TOTAL_COUNT: number;
}

export interface SuccessGoalsScoresModel {
  cusT_ID: string;
  cusT_NM: string;
  proJ_ID: string;
  proJ_NM: string;
  portfoliO_ID: number;
  customeR_NM: string;
  score: string;
  color: string;
  projecT_PLAN_URL: string;
  totaL_KPIS: number;
  meT_KPIS: number;
  totaL_KPI_AREA: number;
}

export interface SuccessGoalsScoresModelForAProject {
  cusT_ID: string;
  cusT_NM: string;
  proJ_ID: string;
  proJ_NM: string;
  protfoliO_ID: number;
  customeR_NM: string;
  score: string;
  color: string;
  goaL_NAME: string;
  dscore: number;
}

export interface CSMDashboardDetailsModel {
  cusT_ID: string;
  cusT_NM: string;
  proJ_ID: string;
  proJ_NM: string;
  portfoliO_ID: number;
  improvemenT_TYPE_COUNT: number;
  improvemenT_TYPE_NAME: string;
  percentagE_SCORE: number;
}

export interface TasksEventsSummary {
  priority: string;
  dueEvents: number;
  overdueEvents: number;
  nextWeekEvents: number;
  nextMonthEvents: number;
  dueTasks: number;
  overdueTasks: number;
  nextWeekTasks: number;
  nextMonthTasks: number;
  thisWeekEvents: number;
  thisMonthEvents: number;
  thisWeekTasks: number;
  thisMonthTasks: number;
}

export interface TasksEventsDetails {
  ID: number;
  customerID: string;
  customerName: string;
  projectID: string;
  projectName: string;
  taskType: string;
  taskCategory: string;
  description: string;
  status: string;
  scheduledStartDate: Date;
  scheduledEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedTo?: string;
  priority?: string;
}
