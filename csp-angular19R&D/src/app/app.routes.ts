/**
 * Application Routes Configuration
 * Migrated from LEGACY-SOURCE routing structure to Angular 19 standalone routes
 * 
 * Migration Changes:
 * - Using functional guards instead of class-based guards
 * - Lazy loading all feature modules for better performance
 * - Standalone components architecture
 * - Preserving all legacy route paths for backward compatibility
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Root redirects
  { 
    path: '', 
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Authentication routes (public)
  { 
    path: 'login', 
    loadComponent: () => import('./features/authentication/login/login.component')
      .then(m => m.LoginComponent)
    // loginGuard removed - allow access to login page even if already logged in
  },
  { 
    path: 'login/:gslab', 
    loadComponent: () => import('./features/authentication/login/login.component')
      .then(m => m.LoginComponent)
    // loginGuard removed - allow access to login page even if already logged in
  },

  // OAuth callback landing page
  { 
    path: 'landingpage', 
    loadComponent: () => import('./features/authentication/landing/landing.component')
      .then(m => m.LandingComponent) 
  },

  // Password reset routes
  {
    path: 'forgotpassword',
    loadComponent: () => import('./features/authentication/password-forgot/password-forgot.component')
      .then(m => m.PasswordForgotComponent)
  },
  {
    path: 'setpassword/:email/:code',
    loadComponent: () => import('./features/authentication/password-set/password-set.component')
      .then(m => m.PasswordSetComponent)
  },

  // Main application - protected routes
  {
    path: 'newdashboard',
    canActivate: [authGuard], // Require authentication for all child routes
    children: [
      // Customer view - single customer dashboard
      {
        path: 'cust',
        loadComponent: () => import('./features/dashboard/dashboard-navigation/dashboard-navigation.component')
          .then(m => m.DashboardNavigationComponent)
      },
      {
        path: 'cust/:customerid',
        loadComponent: () => import('./features/dashboard/dashboard-navigation/dashboard-navigation.component')
          .then(m => m.DashboardNavigationComponent)
      },
      {
        path: 'cust/:customerid/:reset',
        loadComponent: () => import('./features/dashboard/dashboard-navigation/dashboard-navigation.component')
          .then(m => m.DashboardNavigationComponent)
      },

      // Multiple customers view (GAVS employees)
      {
        path: 'custm',
        loadComponent: () => import('./features/dashboard/dashboard-customer-multiple/dashboard-customer-multiple.component')
          .then(m => m.DashboardCustomerMultipleComponent)
      },
      {
        path: 'custm/:viewType',
        loadComponent: () => import('./features/dashboard/dashboard-customer-multiple/dashboard-customer-multiple.component')
          .then(m => m.DashboardCustomerMultipleComponent)
      },

      // Task Planner page
      {
        path: 'planner/:custid',
        loadComponent: () => import('./features/task/task.component')
          .then(m => m.TaskComponent)
      },

      // Task/Event page - view tasks/events by period
      {
        path: 'viewtaskevents/:custid',
        loadComponent: () => import('./features/task-event-page/task-event-page.component')
          .then(m => m.TaskEventPageComponent)
      },
      {
        path: 'viewtaskevents/:custid/:period',
        loadComponent: () => import('./features/task-event-page/task-event-page.component')
          .then(m => m.TaskEventPageComponent)
      },

      // BVD Entry - View/Edit existing idea via queryParams (e.g. from View Idea button or mail link)
      {
        path: 'bvdentry',
        loadComponent: () => import('./pages/bvd-entry/bvd-entry.component')
          .then(m => m.BvdEntryComponent)
      },

      // BVD Entry - Add/Edit ideas (MUST come BEFORE listview to match first)
      {
        path: 'cust/:customerid/:reset/listview/entry',
        loadComponent: () => import('./pages/bvd-entry/bvd-entry.component')
          .then(m => m.BvdEntryComponent)
      },

      // BVD Ideas List View - View all ideas
      {
        path: 'cust/:customerid/:reset/listview',
        loadComponent: () => import('./pages/bvd-entry/ideas-list-view/ideas-list-view.component')
          .then(m => m.IdeasListViewComponent)
      },
      {
        path: 'cust/:customerid/:reset/listview/:Ideaid',
        loadComponent: () => import('./pages/bvd-entry/ideas-list-view/ideas-list-view.component')
          .then(m => m.IdeasListViewComponent)
      },

      // CSS Dashboard - Customer Success Score Dashboard
      {
        path: 'cssdashboard/:custid/:currindex',
        loadComponent: () => import('./pages/cssdashboard/cssdashboard.component')
          .then(m => m.CssdashboardComponent)
      },

      // Risk Chart - Risk Management Dashboard
      // {
      //   path: 'risk-chart',
      //   loadComponent: () => import('./controls/risk-chart/risk-chart.component')
      //     .then(m => m.RiskchartComponent)
      // },

      // TODO: Uncomment this as component is created
      // // All customers list view
      // {
      //   path: 'allcust/:viewType',
      //   loadComponent: () => import('./features/dashboard/dashboard-all-customers/dashboard-all-customers.component')
      //     .then(m => m.DashboardAllCustomersComponent)
      // }
    ]
  },

  // Service Level Dashboard - Premier customer routes (protected)
  // Same structure as newdashboard but for premier customers
  {
    path: 'serviceleveldashboard',
    canActivate: [authGuard],
    children: [
      // Customer view - single customer dashboard
      {
        path: 'cust',
        loadComponent: () => import('./features/dashboard/dashboard-navigation/dashboard-navigation.component')
          .then(m => m.DashboardNavigationComponent)
      },
      {
        path: 'cust/:customerid',
        loadComponent: () => import('./features/dashboard/dashboard-navigation/dashboard-navigation.component')
          .then(m => m.DashboardNavigationComponent)
      },
      {
        path: 'cust/:customerid/:reset',
        loadComponent: () => import('./features/dashboard/dashboard-navigation/dashboard-navigation.component')
          .then(m => m.DashboardNavigationComponent)
      },

      // BVD Entry - View/Edit existing idea via queryParams (e.g. from View Idea button or mail link)
      {
        path: 'bvdentry',
        loadComponent: () => import('./pages/bvd-entry/bvd-entry.component')
          .then(m => m.BvdEntryComponent)
      },

      // BVD Entry - Add/Edit ideas (MUST come BEFORE listview to match first)
      {
        path: 'cust/:customerid/:reset/listview/entry',
        loadComponent: () => import('./pages/bvd-entry/bvd-entry.component')
          .then(m => m.BvdEntryComponent)
      },

      // BVD Ideas List View - View all ideas (serviceleveldashboard)
      {
        path: 'cust/:customerid/:reset/listview',
        loadComponent: () => import('./pages/bvd-entry/ideas-list-view/ideas-list-view.component')
          .then(m => m.IdeasListViewComponent)
      },
      {
        path: 'cust/:customerid/:reset/listview/:Ideaid',
        loadComponent: () => import('./pages/bvd-entry/ideas-list-view/ideas-list-view.component')
          .then(m => m.IdeasListViewComponent)
      },
    ]
  },

  // SQA Management - Process Model routes (protected)
  // Legacy route: /sqamanagement
  // Standalone page for SQA Management with its own navigation
  // NOTE: Auth guard temporarily disabled for development/testing
  // SQA Management routes - includes task/event pages
  {
    path: 'sqamanagement',
    // canActivate: [authGuard], // Uncomment for production
    children: [
      {
        path: '',
        loadComponent: () => import('./features/sqa-management/sqa-management-page/sqa-management-page.component')
          .then(m => m.SqaManagementPageComponent)
      },
      // Objective User - Process Objectives Management
      {
        path: 'objective-user',
        loadComponent: () => import('./features/sqa-management/objective-user/objective-user.component')
          .then(m => m.ObjectiveUserComponent),
        title: 'Process Objectives'
      },
      // Risk User - Process Risks Management
      {
        path: 'risk-user',
        loadComponent: () => import('./features/sqa-management/risk-user/risk-user.component')
          .then(m => m.RiskUserComponent),
        title: 'Process Risks'
      },
      // Control User - Process Controls Management
      {
        path: 'control-user',
        loadComponent: () => import('./features/sqa-management/control-user/control-user.component')
          .then(m => m.ControlUserComponent),
        title: 'Process Controls'
      },
      // Requirement Reference - Compliance Requirements Tracker
      {
        path: 'requirement-reference',
        loadComponent: () => import('./features/sqa-management/requirement-reference/requirement-reference.component')
          .then(m => m.RequirementReferenceComponent),
        title: 'Compliance Requirements'
      },
      // Audit Execution - Risk Based Assessment
      {
        path: 'audit-execution',
        loadComponent: () => import('./features/sqa-management/audit-execution/audit-execution.component')
          .then(m => m.AuditExecutionComponent),
        title: 'Risk Based Assessment'
      },
      // Task Planner page
      {
        path: 'planner/:custid',
        loadComponent: () => import('./features/task/task.component')
          .then(m => m.TaskComponent)
      },
      // Task/Event page - view tasks/events by period
      {
        path: 'viewtaskevents/:custid',
        loadComponent: () => import('./features/task-event-page/task-event-page.component')
          .then(m => m.TaskEventPageComponent)
      },
      {
        path: 'viewtaskevents/:custid/:period',
        loadComponent: () => import('./features/task-event-page/task-event-page.component')
          .then(m => m.TaskEventPageComponent)
      },
    ]
  },

  // Layout wrapper for customer-specific pages (protected)
  // Legacy route: /layout with child routes
  // Provides consistent structure for overview, people, process, delivery, etc.
  {
    path: 'layout',
    loadComponent: () => import('./features/layout/layout.component')
      .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      // Overview page - customer overview information
      {
        path: 'overview/:custid',
        loadComponent: () => import('./features/overview-page/overview-page.component')
          .then(m => m.OverviewPageComponent)
      },
      // Customer Objectives (Project Scope) page
      {
        path: 'customerobjectivesnew/:custid',
        loadComponent: () => import('./features/customer-objectives-page/customer-objectives-page.component')
          .then(m => m.CustomerObjectivesPageComponent)
      },
      // People page
      {
        path: 'people/:custid',
        loadComponent: () => import('./features/people-page/people-page.component')
          .then(m => m.PeoplePageComponent)
      },
      // Process page
      {
        path: 'process/:custid',
        loadComponent: () => import('./features/process-page/process-page.component')
          .then(m => m.ProcessPageComponent)
      },
      // Task Planner page
      {
        path: 'planner/:custid',
        loadComponent: () => import('./features/task/task.component')
          .then(m => m.TaskComponent)
      },
      // Task/Event page - view tasks/events by period
      {
        path: 'viewtaskevents/:custid',
        loadComponent: () => import('./features/task-event-page/task-event-page.component')
          .then(m => m.TaskEventPageComponent)
      },
      {
        path: 'viewtaskevents/:custid/:period',
        loadComponent: () => import('./features/task-event-page/task-event-page.component')
          .then(m => m.TaskEventPageComponent)
      },
      // Delivery page
      {
        path: 'delivery/:custid',
        loadComponent: () => import('./features/delivery-page/delivery-page.component')
          .then(m => m.DeliveryPageComponent)
      },
      // Alternative route with project ID
      {
        path: 'delivery/:custid/:projid',
        loadComponent: () => import('./features/delivery-page/delivery-page.component')
          .then(m => m.DeliveryPageComponent)
      },
      // Success Goals page
      {
        path: 'successgoals/:custid',
        loadComponent: () => import('./features/success-page/success-page.component')
          .then(m => m.SuccessPageComponent)
      },
      // Lessons Learnt page
      {
        path: 'lessons-learnt/:custid',
        loadComponent: () => import('./features/lessons-learned-page/lessons-learned-page.component')
          .then(m => m.LessonsLearnedPageComponent)
      },
      // Best Practices page
      {
        path: 'best-practices/:custid',
        loadComponent: () => import('./features/best-practices-page/best-practices-page.component')
          .then(m => m.BestPracticesPageComponent)
      },
      // Ideas & Innovations page - ✅ COMPLETE
      {
        path: 'ideas/:custid',
        loadComponent: () => import('./features/ideas-page/ideas-page.component')
          .then(m => m.IdeasPageComponent)
      },
      {
        path: 'ideas/:custid/:ideasid',
        loadComponent: () => import('./features/ideas-page/ideas-page.component')
          .then(m => m.IdeasPageComponent)
      },
      // Feedback page
      {
        path: 'feedback-page/:custid',
        loadComponent: () => import('./features/feedback-page/feedback-page.component')
          .then(m => m.FeedbackPageComponent)
      },
      // Voice of Customer (Survey Feedback) page - ✅ COMPLETE
      {
        path: 'surveyfeedback/:custid',
        loadComponent: () => import('./features/view-csat/view-csat.component')
          .then(m => m.ViewCsatComponent)
      },
      // Contacts page - ✅ COMPLETE
      {
        path: 'contacts/:custid',
        loadComponent: () => import('./features/contacts-page/contacts-page.component')
          .then(m => m.ContactsPageComponent)
      },
      // Appreciation page - ✅ COMPLETE
      {
        path: 'appreciation/:custid',
        loadComponent: () => import('./features/appreciation/appreciation.component')
          .then(m => m.AppreciationComponent)
      },
      // Project Migration page - ✅ COMPLETE
      {
        path: 'projectmigration/:custid',
        loadComponent: () => import('./features/project-migration/project-migration.component')
          .then(m => m.ProjectMigrationComponent)
      },
      // Project Data Configuration page - ✅ COMPLETE
      {
        path: 'projectdataconfiguration/:custid',
        loadComponent: () => import('./features/project-data-configuration/project-data-configuration.component')
          .then(m => m.ProjectDataConfigurationComponent)
      },
      // Project Data Configuration — mail approval route
      {
        path: 'projectdataconfigurationApproval/:custid/:projid/:settingid/:isApproveReject',
        loadComponent: () => import('./features/project-data-configuration/project-data-configuration.component')
          .then(m => m.ProjectDataConfigurationComponent)
      },
      // Manage KPI Product Entry page - ✅ COMPLETE (requires child components)
      {
        path: 'managekpiproduct/:custid',
        loadComponent: () => import('./features/manage-kpi-product-entry/manage-kpi-product-entry.component')
          .then(m => m.ManageKpiProductEntryComponent)
      },
      // Checklist Assessment page - Audit checklist execution
      {
        path: 'checklistassessment/:custid',
        loadComponent: () => import('./features/layout/checklist-assessment-page/checklist-assessment-page.component')
          .then(m => m.ChecklistAssessmentPageComponent)
      },
      // Assessment Status page - View assessments by status and date range
      {
        path: 'assessment/:custid',
        loadComponent: () => import('./pages/layout/assessmentstatus/assessmentstatus.component')
          .then(m => m.AssessmentstatusComponent)
      },
      {
        path: 'assessment/:custid/:month/:year',
        loadComponent: () => import('./pages/layout/assessmentstatus/assessmentstatus.component')
          .then(m => m.AssessmentstatusComponent)
      },
      // Action Items page - ✅ COMPLETE
      {
        path: 'actionitems/:custid',
        loadComponent: () => import('./pages/layout/action-items-page/action-items-page.component')
          .then(m => m.ActionItemsPageComponent)
      },
      // Risk page - ✅ COMPLETE
      {
        path: 'risk/:custid',
        loadComponent: () => import('./pages/layout/risk-page/risk-page.component')
          .then(m => m.RiskPageComponent)
      },
      {
        path: 'risk/:custid/:projid',
        loadComponent: () => import('./pages/layout/risk-page/risk-page.component')
          .then(m => m.RiskPageComponent)
      },
      {
        path: 'risk/:custid/:projid/:riskid',
        loadComponent: () => import('./pages/layout/risk-page/risk-page.component')
          .then(m => m.RiskPageComponent)
      },
      // BVD Entry - Idea entry and management (MUST come BEFORE listview to match first)
      {
        path: 'bvdentry/cust/:customerid/:reset/listview/entry',
        loadComponent: () => import('./pages/bvd-entry/bvd-entry.component')
          .then(m => m.BvdEntryComponent)
      },
      // BVD Ideas List View - View all ideas (bvdentry path)
      {
        path: 'bvdentry/cust/:customerid/:reset/listview',
        loadComponent: () => import('./pages/bvd-entry/ideas-list-view/ideas-list-view.component')
          .then(m => m.IdeasListViewComponent)
      },
      {
        path: 'bvdentry/cust/:customerid/:reset/listview/:Ideaid',
        loadComponent: () => import('./pages/bvd-entry/ideas-list-view/ideas-list-view.component')
          .then(m => m.IdeasListViewComponent)
      },
      // Issues page - ✅ COMPLETE
      {
        path: 'issues/:custid',
        loadComponent: () => import('./pages/layout/issues-page/issues-page.component')
          .then(m => m.IssuesPageComponent)
      },
      // Checklist Findings routes - ✅ COMPLETE
      {
        path: 'checklistfindings/:custid',
        loadComponent: () => import('./pages/layout/checklist-findings-page/checklist-findings-page.component')
          .then(m => m.ChecklistFindingsPageComponent)
      },
      {
        path: 'checklistfindings/:custid/:projid/:auditid/:isfromdashboard',
        loadComponent: () => import('./pages/layout/checklist-findings-page/checklist-findings-page.component')
          .then(m => m.ChecklistFindingsPageComponent)
      },
      {
        path: 'checklistfindings/:custid/:isfromqagoverance/:frommonth/:fromyear/:tomonth/:toyear/:projid/:findingstatus/:findingtype',
        loadComponent: () => import('./pages/layout/checklist-findings-page/checklist-findings-page.component')
          .then(m => m.ChecklistFindingsPageComponent)
      },
      {
        path: 'checklistfindings/:custid/:findingid/:asssessmentid/:isauditor/:acceptval',
        loadComponent: () => import('./pages/layout/checklist-findings-page/checklist-findings-page.component')
          .then(m => m.ChecklistFindingsPageComponent)
      },
      // QA Summary routes (alias for checklistfindings - same component)
      {
        path: 'qasummary/:custid/:isFindingByTime',
        loadComponent: () => import('./pages/layout/qaassessmentdetails/qaassessmentdetails.component')
          .then(m => m.QaassessmentdetailsComponent)
      },
      {
        path: 'qasummary/:custid',
        loadComponent: () => import('./pages/layout/qaassessmentdetails/qaassessmentdetails.component')
          .then(m => m.QaassessmentdetailsComponent)
      },
      {
        path: 'qasummary/:custid/:frommonth/:fromyear/:tomonth/:toyear/:findingstatus/:findingtype/:isfromqagoverance',
        loadComponent: () => import('./pages/layout/qaassessmentdetails/qaassessmentdetails.component')
          .then(m => m.QaassessmentdetailsComponent)
      },
      {
        path: 'qasummary/:custid/:projid/:frommonth/:fromyear/:tomonth/:toyear/:findingstatus/:findingtype/:isfromqagoverance',
        loadComponent: () => import('./pages/layout/qaassessmentdetails/qaassessmentdetails.component')
          .then(m => m.QaassessmentdetailsComponent)
      },
      {
        path: 'qasummary/:custid/:projid/:asssessmentid/:findingid/:isauditor/:acceptval',
        loadComponent: () => import('./pages/layout/qaassessmentdetails/qaassessmentdetails.component')
          .then(m => m.QaassessmentdetailsComponent)
      }
    ]
  },

  // TODO: Uncomment this route when overview component is created
  // Overview page (protected)
  {
    path: 'overview',
    loadComponent: () => import('./features/overview-page/overview-page.component')
      .then(m => m.OverviewPageComponent),
    canActivate: [authGuard]
  },

  // Reports page (protected)
  // Legacy route: /reports (lazy-loaded ReportsModule with ReportspageComponent)
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports-page/reportspage.component')
      .then(m => m.ReportspageComponent),
    canActivate: [authGuard]
  },

  // Success Goal (KPI Performance) routes (protected)
  // Legacy route: /successgoal (lazy-loaded SuccessgoalModule with SuccessgoalComponent)
  // Displays KPI performance, service level achievement, and metrics
  {
    path: 'successgoal',
    canActivate: [authGuard],
    children: [
      {
        path: 'goals/:custid/:projid',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      },
      {
        path: 'goals/:custid/:projid/:goalid',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      },
      {
        path: 'goals/:custid/:projid/:month/:year',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      },
      {
        path: 'goals/:custid/:projid/:goalid/:month/:year',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      },
      {
        path: 'metric/:custid/:prodid/:modeid/:month/:year',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      },
      {
        path: 'metric/:custid/:prodid/:modeid/:month/:year/:flagValue/:capaStageId',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      },
      {
        path: 'metric/:custid/:prodid/:modeid/:month/:year/:d',
        loadComponent: () => import('./features/successgoal/successgoal.component')
          .then(m => m.SuccessgoalComponent)
      }
    ]
  },

  // CSAT Configuration page (protected)
  // Legacy route: /csatconfiguration (lazy-loaded CsatconfigurationComponent)
  {
    path: 'csatconfiguration',
    loadComponent: () => import('./features/csatconfiguration/csatconfiguration.component')
      .then(m => m.CsatconfigurationComponent),
    canActivate: [authGuard]
  },

  // Access Control Project Page (protected)
  // Legacy route: /accesscontrolproject (lazy-loaded AccessControlProjectPageComponent)
  // Manages project resource assignments (Resource wise Projects & Project wise resource)
  {
    path: 'accesscontrolproj',
    loadComponent: () => import('./features/access-control-project-page/access-control-project-page.component')
      .then(m => m.AccessControlProjectPageComponent),
    canActivate: [authGuard]
  },

  // Configuration EXT Page (protected)
  // Legacy route: /configext (lazy-loaded ConfigextComponentComponent)
  // Manages external configuration key-value pairs with customer/project scope
  {
    path: 'configext',
    loadComponent: () => import('./features/configext/configext-component.component')
      .then(m => m.ConfigextComponentComponent),
    canActivate: [authGuard]
  },

  // Risk Repository Page (protected)
  // Legacy route: /risk-repository (lazy-loaded RiskRepositoryComponent)
  // Manages centralized risk repository with service tower mapping
  {
    path: 'riskrepository',
    loadComponent: () => import('./features/risk-repository/risk-repository.component')
      .then(m => m.RiskRepositoryComponent),
    canActivate: [authGuard]
  },

  // Auditor Quality Standards Page (protected)
  // Legacy route: /auditqualitystandards (lazy-loaded AuditqualitystandardsComponent)
  // Manages auditor qualifications and process model assignments
  {
    path: 'auditqualitystandards',
    loadComponent: () => import('./features/auditqualitystandards/auditqualitystandards.component')
      .then(m => m.AuditqualitystandardsComponent),
    canActivate: [authGuard]
  },

  // Benchmark KPI (Projects KPI) Page (protected)
  // Legacy route: /projects-kpi (lazy-loaded ProjectsKPIComponent)
  // Displays KPI achievement across projects with multiple view modes (by Project, Enterprise KPI, or Summary)
  {
    path: 'projectsKPI',
    loadComponent: () => import('./features/projects-kpi/projects-kpi.component')
      .then(m => m.ProjectsKPIComponent),
    canActivate: [authGuard]
  },

  // KPI Management Page (protected)
  // Legacy route: /kpi/:custid (lazy-loaded KpiPageComponent)
  // Main KPI management interface for setting goals, targets, and tracking achievements
  // Contains 3 tabs: Set Customer Goals, Set KPI & Targets, KPI Achievements
  {
    path: 'kpi/:custid',
    loadComponent: () => import('./controls/kpi/kpi-page/kpi-page.component')
      .then(m => m.KpiPageComponent),
    canActivate: [authGuard],
  },

  // Product KPI View Page (protected)
  // Legacy route: /productkpi/:custid/:portId/:prodId/:modeId/:month/:year/:kpiId
  // Product-specific KPI view with detailed achievements by service/mode
  // Parameters: customer ID, portfolio ID, product ID, mode ID, month, year, KPI ID
  {
    path: 'productkpi/:custid/:portId/:prodId/:modeId/:month/:year/:kpiId',
    loadComponent: () => import('./controls/kpi/kpi-page/kpi-page.component')
      .then(m => m.KpiPageComponent),
    canActivate: [authGuard],
  },

  // CI Leaderboard Page (protected)
  // Legacy route: /ci-leaderboard-page (lazy-loaded CiLeaderboardPageComponent)
  // Displays Continual Improvement Leader Board with customer/project/portfolio hierarchy
  {
    path: 'cileaderboard',
    loadComponent: () => import('./features/ci-leaderboard-page/ci-leaderboard-page.component')
      .then(m => m.CiLeaderboardPageComponent),
    canActivate: [authGuard]
  },

  // SQA Management Upload Page (protected) - Parent component with tabs
  // Legacy route: /complianceinsights (lazy-loaded SqaManagementUploadComponent)
  // Contains 5 tabs: Upload Data, Map Data, Setup Charts, View Charts, Analysis (ComplianceInsightsComponent)
  // Default opens on Analysis tab which has ComplianceInsightsComponent
  {
    path: 'complianceinsights',
    loadComponent: () => import('./features/sqa-management-upload/sqa-management-upload.component')
      .then(m => m.SqaManagementUploadComponent),
    canActivate: [authGuard]
  },

  // Survey Settings Page (protected)
  // Legacy route: /surveysettings (lazy-loaded SurveySettingsPageComponent)
  // Manages CSS (Customer Satisfaction Survey) batch configuration and customer contacts
  // Includes batch creation, verification mails, survey trigger, and link management
  {
    path: 'css',
    loadComponent: () => import('./pages/survey/survey-settings-page/survey-settings-page.component')
      .then(m => m.SurveySettingsPageComponent),
    canActivate: [authGuard]
  },

  // CSS Verification Page (protected) - ✅ COMPLETE
  // Legacy route: /cssverification (lazy-loaded SurveySettingsVerificationPageComponent)
  // Allows CSMs to verify customer contact details before sending CSS surveys
  // Features: Batch listing (Quarterly/Half-Yearly), Approve/Reject workflow, Premier separation
  {
    path: 'cssverification',
    loadComponent: () => import('./features/survey-settings-verification-page/survey-settings-verification-page.component')
      .then(m => m.SurveySettingsVerificationPageComponent),
    canActivate: [authGuard]
  },

  // CSS Monthly Settings Page (protected) - ✅ COMPLETE
  // Legacy route: /cssmonthly/:batchid/:recordid/:isApproveReject (lazy-loaded SurveySettingsMonthlyComponent)
  // Monthly Customer Success Survey Configuration for Premier customers
  // Features: Batch management, verification mails, survey trigger, action items, link activation
  {
    path: 'cssmonthly',
    loadComponent: () => import('./features/survey-settings-monthly/survey-settings-monthly.component')
      .then(m => m.SurveySettingsMonthlyComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cssmonthly/:batchid/:recordid/:isApproveReject',
    loadComponent: () => import('./features/survey-settings-monthly/survey-settings-monthly.component')
      .then(m => m.SurveySettingsMonthlyComponent),
    canActivate: [authGuard]
  },

  // Customer Satisfaction Survey Form (public - accessed via email link with code)
  // Legacy route: /CustomerSuccessSurvey/:code (SurveyComponent)
  // Customer-facing survey form for filling out satisfaction ratings
  // Code parameter is the unique GUID from the survey invitation email
  {
    path: 'CustomerSuccessSurvey/:code',
    loadComponent: () => import('./pages/survey/survey.component')
      .then(m => m.SurveyComponent)
    // Note: No authGuard - customers access this via email link without login
  },

 // Business Continuity Management (BCM) Module Routes
  // BCM is a separate application located in src/BCM/
  // Parent layout with nested routes for BCP and SCP
  {
    path: 'bcm',
    canActivate: [authGuard],
    loadComponent: () => import('../BCM/app/pages/bcp-exercise/bcm-layout.component')
      .then(m => m.BcmLayoutComponent),
    children: [
      // Default route - redirects to BCP
      {
        path: '',
        redirectTo: 'bcp',
        pathMatch: 'full'
      },
      // BCP Routes
      {
        path: 'bcp',
        loadComponent: () => import('../BCM/app/pages/bcp-exercise/bcp-page.component')
          .then(m => m.BcpPageComponent),
        title: 'Business Continuity Plan'
      },
      {
        path: 'bcp/bc-exercise',
        loadComponent: () => import('../BCM/app/pages/bcp-exercise/bc-exercise-page.component')
          .then(m => m.BcExercisePageComponent),
        title: 'BC Exercise'
      },
      // SCP Routes
      {
        path: 'scp',
        loadComponent: () => import('../BCM/app/pages/bcp-exercise/scp-accounts.component')
          .then(m => m.ScpAccountsComponent),
        title: 'Service Continuity Plan - Accounts'
      },
      {
        path: 'scp/form',
        loadComponent: () => import('../BCM/app/pages/bcp-exercise/scp-page.component')
          .then(m => m.ScpPageComponent),
        title: 'Service Continuity Plan - Form'
      },
      {
        path: 'scp/pm/review',
        loadComponent: () => import('../BCM/app/pages/bcp-exercise/scp-pm-review.component')
          .then(m => m.ScpPmReviewComponent),
        title: 'SCP PM Review Dashboard'
      },
      {
        path: 'scp/csm/approval',
        loadComponent: () => import('../BCM/app/pages/bcp-exercise/scp-csm-approval.component')
          .then(m => m.ScpCsmApprovalComponent),
        title: 'SCP CSM Approval Dashboard'
      }
    ]
  },

  // Legacy route redirects for backward compatibility
  {
    path: 'bcp',
    redirectTo: '/bcm/bcp',
    pathMatch: 'full'
  },
  {
    path: 'scp',
    redirectTo: '/bcm/scp',
    pathMatch: 'full'
  },

  // COO Dashboard - Executive Dashboard
  {
    path: 'coo-dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/coo-dashboard/coo-dashboard.component')
      .then(m => m.COODashboardComponent),
  },

  // CRISP Report - Overall CRISP Scores (multiple routes for compatibility)
  {
    path: 'crisp-report',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/crisp-report/crisp-report.component')
      .then(m => m.CrispReportComponent),
  },
  {
    path: 'crisp-report/:custid',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/crisp-report/crisp-report.component')
      .then(m => m.CrispReportComponent),
  },
  {
    path: 'crisp-report/:custid/:projid/:month/:year',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/crisp-report/crisp-report.component')
      .then(m => m.CrispReportComponent),
  },
  // Legacy routes for backward compatibility with old menu links
  {
    path: 'layout/crisp-report/:custid',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/crisp-report/crisp-report.component')
      .then(m => m.CrispReportComponent),
  },
  {
    path: 'layout/crisp-report/:custid/:projid/:month/:year',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/crisp-report/crisp-report.component')
      .then(m => m.CrispReportComponent),
  },

  // ── Mandatory Training Report ──────────────────────────────────────────────
  // Legacy route: mandatorytrainingreport/:custid
  {
    path: 'mandatorytrainingreport/:custid',
    canActivate: [authGuard],
    loadComponent: () => import('./features/mandatory-training-report/mandatory-training-report.component')
      .then(m => m.MandatoryTrainingReportComponent),
  },
  {
    path: 'mandatorytrainingreport/:custid/:projid/:year/:month',
    canActivate: [authGuard],
    loadComponent: () => import('./features/mandatory-training-report/mandatory-training-report.component')
      .then(m => m.MandatoryTrainingReportComponent),
  },
  // Backward-compat layout-prefixed variants
  {
    path: 'layout/mandatorytrainingreport/:custid',
    canActivate: [authGuard],
    loadComponent: () => import('./features/mandatory-training-report/mandatory-training-report.component')
      .then(m => m.MandatoryTrainingReportComponent),
  },
  {
    path: 'layout/mandatorytrainingreport/:custid/:projid/:year/:month',
    canActivate: [authGuard],
    loadComponent: () => import('./features/mandatory-training-report/mandatory-training-report.component')
      .then(m => m.MandatoryTrainingReportComponent),
  },

  // ── Project Data Configuration — mail approval top-level routes ───────────
  // Legacy route: /layout/projectdataconfigurationApproval/:custid/:projid/:settingid/:isApproveReject
  {
    path: 'projectdataconfigurationApproval/:custid/:projid/:settingid/:isApproveReject',
    canActivate: [authGuard],
    loadComponent: () => import('./features/project-data-configuration/project-data-configuration.component')
      .then(m => m.ProjectDataConfigurationComponent),
  },
  {
    path: 'layout/projectdataconfigurationApproval/:custid/:projid/:settingid/:isApproveReject',
    canActivate: [authGuard],
    loadComponent: () => import('./features/project-data-configuration/project-data-configuration.component')
      .then(m => m.ProjectDataConfigurationComponent),
  },

  // Wildcard - 404 redirect (must be last)
  {
    path: '**',
    redirectTo: '/login'
  }
];
