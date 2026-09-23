import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RiskLogComponent } from './pages/risk-log/risk-log.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { KeyInsightsComponent } from './pages/key-insights/key-insights.component';
import { ViewExistingRiskComponent } from './pages/view-existing-risk/view-existing-risk.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { CriticalProjectRisksComponent } from './pages/critical-project-risks/critical-project-risks.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'key-insights', component: KeyInsightsComponent },
      { path: 'risk-log', component: RiskLogComponent },
      { path: 'existing-risks', component: ViewExistingRiskComponent },
      { path: 'critical-project-risks', component: CriticalProjectRisksComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
