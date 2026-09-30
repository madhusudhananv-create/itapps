import { Routes } from '@angular/router';
import { MaturityLandingComponent } from './pages/maturity-landing/maturity-landing.component';
import { MaturityAssessmentComponent } from './pages/maturity-assessment/maturity-assessment.component';
import { DomainReviewComponent } from './pages/domain-review/domain-review.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { AdminSetupComponent } from './pages/admin-setup/admin-setup.component';

export const routes: Routes = [
  // Both routes render the same landing component - `initialMode` picks which
  // of its two views (the account/domain-scorecard dashboard, or the flat
  // My Assessments/Needs Review assignment tabs) it opens on, since they used
  // to live behind an in-page toggle and are now separate nav menu items.
  { path: '', component: MaturityLandingComponent, data: { initialMode: 'accounts' } },
  { path: 'my-assignments', component: MaturityLandingComponent, data: { initialMode: 'assignments' } },
  { path: 'assessment/:domainId', component: MaturityAssessmentComponent },
  { path: 'review/:domainId', component: DomainReviewComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'admin', component: AdminSetupComponent },
  { path: '**', redirectTo: '' },
];
