import { Routes } from '@angular/router';
import { MaturityLandingComponent } from './pages/maturity-landing/maturity-landing.component';
import { MaturityAssessmentComponent } from './pages/maturity-assessment/maturity-assessment.component';
import { DomainReviewComponent } from './pages/domain-review/domain-review.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: '', component: MaturityLandingComponent },
  { path: 'assessment/:domainId', component: MaturityAssessmentComponent },
  { path: 'review/:domainId', component: DomainReviewComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' },
];
