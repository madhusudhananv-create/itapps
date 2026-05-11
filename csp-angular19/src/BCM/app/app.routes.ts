import { Routes } from '@angular/router';
import { BcpPageComponent } from './pages/bcp-page.component';
import { ScpPageComponent } from './pages/scp-page.component';
import { ScpAccountsComponent } from './pages/scp-accounts.component';
import { ScpPmReviewComponent } from './pages/scp-pm-review.component';
import { ScpCsmApprovalComponent } from './pages/scp-csm-approval.component';

export const routes: Routes = [
  {
    path: 'bcp',
    component: BcpPageComponent,
    title: 'Business Continuity Plan',
  },
  {
    path: 'scp',
    component: ScpAccountsComponent,
    title: 'Service Continuity Plan - Accounts',
  },
  {
    path: 'scp/form',
    component: ScpPageComponent,
    title: 'Service Continuity Plan - Form',
  },
  {
    path: 'scp/pm/review',
    component: ScpPmReviewComponent,
    title: 'SCP PM Review Dashboard',
  },
  {
    path: 'scp/csm/approval',
    component: ScpCsmApprovalComponent,
    title: 'SCP CSM Approval Dashboard',
  },
  {
    path: '',
    redirectTo: '/bcp',
    pathMatch: 'full',
  },
];
