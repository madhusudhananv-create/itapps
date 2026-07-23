import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RoleContextService } from '../../shared/services/role-context.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
/**

 * Interface representing an account with SCP information
 */
export interface ScpAccount {
  /** Unique identifier for the account */
  id: string;
  /** Location of the account */
  location: string;
  /** Business Unit */
  businessUnit: string;
  /** Account/Company name */
  account: string;
  /** Project name associated with the account */
  project: string;
  /** Whether SCP is available for this account */
  scpAvailable: boolean;
  /** Current status of the SCP */
  scpStatus: 'Draft' | 'Reviewed' | 'Approved' | 'In Review' | 'Submitted for Review' | 'Submitted for Approval';
  /** Last modified date */
  lastModified?: Date;
  /** Created by user */
  createdBy?: string;
}

/**
 * Interface representing user roles and permissions
 */
export interface UserRole {
  /** Role identifier */
  role: 'BCP Coordinator' | 'Project Manager' | 'Customer Success Manager' | 'BU Head' | 'Admin (Super User)';
  /** Access scope for the user */
  accessScope: {
    /** Tagged projects the user can access */
    projects?: string[];
    /** Tagged accounts the user can access */
    accounts?: string[];
    /** Tagged business units the user can access */
    businessUnits?: string[];
  };
  /** Available SCP form actions */
  scpFormActions: string[];
  /** Reporting scope */
  reportingScope: string;
}

/**
 * Interface representing current user context
 */
export interface UserContext {
  /** User ID */
  userId: string;
  /** User name */
  userName: string;
  /** User role */
  role: UserRole;
}

/**
 * Interface for table column definitions
 */
export interface TableColumn {
  /** Column identifier */
  key: string;
  /** Display label for the column */
  label: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom width for the column */
  width?: string;
}

@Component({
  selector: 'bcp-scp-accounts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressBarModule,
    MatTabsModule,
    HighchartsChartComponent
  ],
  templateUrl: './scp-accounts.component.html',
  styleUrl: './scp-accounts.component.scss'
})
/**
 * Component for displaying and managing SCP accounts
 * Provides a table view of all accounts with their SCP status and actions
 */
export class ScpAccountsComponent implements OnInit {
  /** Array of accounts to display in the table */
  accounts: ScpAccount[] = [];
  
  /** Filtered accounts based on user role */
  filteredAccounts: ScpAccount[] = [];
  
  /** Columns to display in the table */
  displayedColumns: string[] = ['location', 'businessUnit', 'account', 'project', 'scpAvailable', 'scpStatus', 'action'];
  /** Loading state for the component */
  isLoading: boolean = false;

  /** Current user context */
  currentUser: UserContext = this.getMockUserContext();
  dataSource = [
  {  status: 'draft', statusLabel: 'In-Draft' },
  {  status: 'review', statusLabel: 'In-Review' },
  {  status: 'approved', statusLabel: 'Approved' },
];
  /** Selected role for demo */
  selectedRole: string = 'BCP Coordinator';

  constructor(private router: Router, private roleContext: RoleContextService) {}

  // Highcharts configuration
  Highcharts: typeof Highcharts = Highcharts;

  businessUnitStatusChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Business Unit SCP Status' },
    xAxis: { categories: [], title: { text: 'Business Unit' } },
    yAxis: { min: 0, title: { text: 'Count' } },
    legend: { enabled: true },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: { enabled: true }
      }
    },
    series: []
  };

  projectStatusChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Project SCP Status' },
    xAxis: { categories: [], title: { text: 'Project' } },
    yAxis: { min: 0, title: { text: 'Count' } },
    legend: { enabled: true },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: { enabled: true }
      }
    },
    series: []
  };


  /**
   * Initializes the component and loads account data
   */
  ngOnInit(): void {
    // Load accounts immediately without delay
    this.accounts = this.getMockAccounts();
    // Apply RBAC filtering
    this.filteredAccounts = this.applyRBACFilter(this.accounts);
    // Initialize selectedRole from context if available
    const currentRole = this.roleContext.getRole();
    if (currentRole) {
      this.selectedRole = currentRole;
      this.currentUser = this.getMockUserContextForRole(currentRole);
      this.filteredAccounts = this.applyRBACFilter(this.accounts);
    }
  }

  /* ngAfterViewInit() {
  // call chart generation after the view is ready
    this.createBusinessUnitStatusChart();
    this.createProjectStatusChart();
  } */

  /**
   * Gets mock account data for demonstration
   * @returns Array of mock account data
   * @private
   */
  private getMockAccounts(): ScpAccount[] {
    return [
      {
        id: '1',
        location: 'Pune',
        businessUnit: 'Tech',
        account: 'Palo Alto Networks',
        project: 'Palo Alto Networks',
        scpAvailable: true,
        scpStatus: 'Approved',
        lastModified: new Date('2024-01-15'),
        createdBy: 'John Doe'
      },
      {
        id: '2',
        location: 'Pune',
        businessUnit: 'India & UK',
        account: 'Palo Alto Networks',
        project: 'Palo Alto Networks-SOW3-Support',
        scpAvailable: true,
        scpStatus: 'In Review',
        lastModified: new Date('2024-01-20'),
        createdBy: 'Jane Smith'
      },
      {
        id: '3',
        location: 'Pune',
        businessUnit: 'India & UK',
        account: 'Palo Alto Networks',
        project: 'Palo Alto_DataEng_ADEM',
        scpAvailable: true,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-10'),
        createdBy: 'Mike Johnson'
      },
      {
        id: '4',
        location: 'Pune',
        businessUnit: 'Healthcare',
        account: 'Avaya India Pvt Ltd',
        project: 'Avaya SOW 304 Flipkart IP Change',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-25'),
        createdBy: 'Sarah Wilson'
      },
      {
        id: '5',
        location: 'Pune',
        businessUnit: 'Tech',
        account: 'Avaya India Pvt Ltd',
        project: 'SOW 295 Avaya HCS AES Logger Customization',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-18'),
        createdBy: 'David Brown'
      },
      {
        id: '6',
        location: 'Pune',
        businessUnit: 'Tech',
        account: 'Avaya India Pvt Ltd',
        project: 'SOW 296 Avaya Flipkart IVR',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-12'),
        createdBy: 'Lisa Davis'
      },
      {
        id: '7',
        location: 'Chennai',
        businessUnit: 'India & UK',
        account: 'Acryl Data Inc.',
        project: 'Acryl Data-SoW01-Dev',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-22'),
        createdBy: 'Robert Miller'
      },
      {
        id: '8',
        location: 'Chennai',
        businessUnit: 'India & UK',
        account: 'AthenaHealth',
        project: 'Athena_Collector R&P_FY23',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-28'),
        createdBy: 'Emily Taylor'
      },
      {
        id: '9',
        location: 'Chennai',
        businessUnit: 'India & UK',
        account: 'AthenaHealth',
        project: 'AthenaHealth - AuthOps',
        scpAvailable: true,
        scpStatus: 'Approved',
        lastModified: new Date('2024-01-14'),
        createdBy: 'Michael Anderson'
      },
      {
        id: '10',
        location: 'Chennai',
        businessUnit: 'India & UK',
        account: 'AthenaHealth',
        project: 'AthenaHealth - Rules 2.0 Program',
        scpAvailable: true,
        scpStatus: 'In Review',
        lastModified: new Date('2024-01-16'),
        createdBy: 'Jennifer Garcia'
      },
      {
        id: '11',
        location: 'Chennai',
        businessUnit: 'Chennai',
        account: 'Frontier Airlines INC',
        project: 'Frontier - FY25 - Cybersecurity',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-24'),
        createdBy: 'William Martinez'
      },
      {
        id: '12',
        location: 'Chennai',
        businessUnit: 'Chennai',
        account: 'Frontier Airlines INC',
        project: 'Frontier - FY25 - Data & Analytics',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-11'),
        createdBy: 'Ashley Rodriguez'
      },
      {
        id: '13',
        location: 'Chennai',
        businessUnit: 'Chennai',
        account: 'Covenant Health, Inc.',
        project: 'Covenant Health - Crowdstrike License',
        scpAvailable: false,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-26'),
        createdBy: 'Christopher Lee'
      },
      {
        id: '14',
        location: 'Chennai',
        businessUnit: 'Chennai',
        account: 'Covenant Health, Inc.',
        project: 'Covenant Health - Domain migration',
        scpAvailable: true,
        scpStatus: 'Draft',
        lastModified: new Date('2024-01-19'),
        createdBy: 'Amanda White'
      },
      {
        id: '15',
        location: 'Chennai',
        businessUnit: 'Chennai',
        account: 'Covenant Health, Inc.',
        project: 'Covenant Health - DRS with Google Cloud',
        scpAvailable: true,
        scpStatus: 'Approved',
        lastModified: new Date('2024-01-13'),
        createdBy: 'Daniel Harris'
      }
    ];
  }

  /**
   * Gets mock user context for demonstration
   * @returns Mock user context
   * @private
   */
  private getMockUserContext(): UserContext {
    return this.getMockUserContextForRole(this.selectedRole);
  }

  /**
   * Gets mock user context for specific role
   * @param role - The role to get context for
   * @returns Mock user context for the specified role
   * @private
   */
  private getMockUserContextForRole(role: string): UserContext {
    switch (role) {
      case 'BCP Coordinator':
        return {
          userId: 'user123',
          userName: 'John Doe',
          role: {
            role: 'BCP Coordinator',
            accessScope: {
              projects: ['Palo Alto Networks', 'Palo Alto Networks-SOW3-Support', 'Palo Alto_DataEng_ADEM'],
              accounts: ['Palo Alto Networks'],
              businessUnits: ['Tech']
            },
            scpFormActions: ['Create', 'Edit', 'Save', 'Submit for Review'],
            reportingScope: 'Project-level status report'
          }
        };

      case 'Project Manager':
        return {
          userId: 'user456',
          userName: 'Jane Smith',
          role: {
            role: 'Project Manager',
            accessScope: {
              projects: ['AthenaHealth - AuthOps', 'AthenaHealth - Rules 2.0 Program'],
              accounts: ['AthenaHealth'],
              businessUnits: ['India & UK']
            },
            scpFormActions: ['Review', 'Edit', 'Save', 'Submit for Approval'],
            reportingScope: 'Specific project status'
          }
        };

      case 'Customer Success Manager':
        return {
          userId: 'user789',
          userName: 'Mike Johnson',
          role: {
            role: 'Customer Success Manager',
            accessScope: {
              projects: ['Covenant Health - Domain migration', 'Covenant Health - DRS with Google Cloud'],
              accounts: ['Covenant Health, Inc.', 'AthenaHealth'],
              businessUnits: ['Chennai', 'India & UK']
            },
            scpFormActions: ['Review', 'Approve', 'Edit', 'Save'],
            reportingScope: 'Project-level, Account-level status reports'
          }
        };

      case 'BU Head':
        return {
          userId: 'user101',
          userName: 'Sarah Wilson',
          role: {
            role: 'BU Head',
            accessScope: {
              projects: [],
              accounts: [],
              businessUnits: ['Tech']
            },
            scpFormActions: ['View Only'],
            reportingScope: 'BU-level aggregation report'
          }
        };


      case 'Admin (Super User)':
        return {
          userId: 'user303',
          userName: 'Admin User',
          role: {
            role: 'Admin (Super User)',
            accessScope: {
              projects: [],
              accounts: [],
              businessUnits: []
            },
            scpFormActions: ['Edit', 'Save', 'Submit', 'Delete'],
            reportingScope: 'All reports (Project, Account, BU, Platform-wide)'
          }
        };

      default:
        return this.getMockUserContextForRole('BCP Coordinator');
    }
  }

  /**
   * Handles role change for demo purposes
   * @param newRole - The new role selected
   */
  onRoleChange(newRole: string): void {
    this.selectedRole = newRole;
    this.currentUser = this.getMockUserContextForRole(newRole);
    this.filteredAccounts = this.applyRBACFilter(this.accounts);
    // Persist role globally so header can show it across pages
    this.roleContext.setRole(newRole);
  }

  /**
   * Applies RBAC filtering to accounts based on user role
   * @param accounts - All accounts
   * @returns Filtered accounts based on user access scope
   * @private
   */
  private applyRBACFilter(accounts: ScpAccount[]): ScpAccount[] {
    const userRole = this.currentUser.role;
    const accessScope = userRole.accessScope;

    return accounts.filter(account => {
      // Check if user has access to this account based on their role
      switch (userRole.role) {
        case 'BCP Coordinator':
        case 'Project Manager':
          // Access to tagged projects
          return accessScope.projects?.includes(account.project) || false;
        
        case 'Customer Success Manager':
          // Access to tagged accounts and projects under them
          return accessScope.accounts?.includes(account.account) || 
                 accessScope.projects?.includes(account.project) || false;
        
        case 'BU Head':
          // Access to tagged business unit and all entities under it
          return accessScope.businessUnits?.includes(account.businessUnit) || false;
        
        case 'Admin (Super User)':
          // Full platform access
          return true;
        
        default:
          return false;
      }
    });
  }

  /**
   * Checks if user can perform specific action on account
   * @param account - The account
   * @param action - The action to check
   * @returns True if user can perform the action
   */
  canPerformAction(account: ScpAccount, action: string): boolean {
    return this.currentUser.role.scpFormActions.includes(action);
  }

  /**
   * Gets tooltip text for SCP status
   * @param account - The account to get tooltip for
   * @returns Tooltip text string
   */
  getScpStatusTooltip(account: ScpAccount): string {
    if (account.scpAvailable) {
      return `SCP Status: ${account.scpStatus}${account.lastModified ? ` | Last Modified: ${account.lastModified.toLocaleDateString()}` : ''}`;
    }
    return 'No SCP available for this account';
  }

  /**
   * Handles row click event
   * @param account - The clicked account
   */
  onRowClick(account: ScpAccount): void {
    if (account.scpAvailable) {
      this.viewScp(account);
    }
  }

  /**
   * Opens the SCP form in view mode
   * @param account - The account to view SCP for
   */
  viewScp(account: ScpAccount): void {
    // Map status: 'In Review' from account to 'Reviewed' for consistency
    //const status = account.scpStatus === 'In Review' ? 'Reviewed' : account.scpStatus;
    this.router.navigate(['/bcm/scp/form'], { 
      queryParams: { 
        accountId: account.id, 
        mode: 'view',
        account: account.account,
        project: account.project,
        businessUnit: account.businessUnit,
        status: account.scpStatus,
        role: this.currentUser.role.role === 'BCP Coordinator' ? 'spoc' :
              this.currentUser.role.role === 'Project Manager' ? 'pm' :
              this.currentUser.role.role === 'Customer Success Manager' ? 'csm' : undefined
      }
    });
  }

  /**
   * Opens the SCP form in edit mode
   * @param account - The account to edit SCP for
   */
  editScp(account: ScpAccount): void {
    // Map status: 'In Review' from account to 'Reviewed' for consistency
    //const status = account.scpStatus === 'In Review' ? 'Reviewed' : account.scpStatus;
    this.router.navigate(['/bcm/scp/form'], { 
      queryParams: { 
        accountId: account.id, 
        mode: 'edit',
        account: account.account,
        project: account.project,
        businessUnit: account.businessUnit,
        status: account.scpStatus,
        role: this.currentUser.role.role === 'BCP Coordinator' ? 'spoc' :
              this.currentUser.role.role === 'Project Manager' ? 'pm' :
              this.currentUser.role.role === 'Customer Success Manager' ? 'csm' : undefined
      }
    });
  }

  /**
   * Navigates to PM Review Dashboard
   */
  navigateToPmReview(): void {
    this.router.navigate(['/bcm/scp/pm/review']);
  }

  /**
   * Navigates to CSM Approval Dashboard
   */
  navigateToCsmApproval(): void {
    this.router.navigate(['/bcm/scp/csm/approval']);
  }

  getProgress(scpStatus: string): number {
  switch (scpStatus) {
    case 'Draft': return 10;
    case 'In Review':
    case 'Submitted for Review': return 23;
    case 'Reviewed':
    case 'Submitted for Approval': return 43;
    case 'Approved': return 100;
    default: return 0;
  }
}
// New function to generate the correct CSS class name
getStatusBarClass(scpStatus: string): string {
  switch (scpStatus) {
    case 'Draft':
      return 'status-draft';
    case 'In Review':
    case 'Submitted for Review':
      return 'status-in-review';
    case 'Approved':
      return 'status-approved';
    default:
      return 'status-not-started';
  }
}

getStatusIcon(scpStatus: string): string {
  switch (scpStatus) {
    case 'Draft':
      return 'edit';
    case 'In Review':
    case 'Submitted for Review':
      return 'hourglass_empty';
    case 'Approved':
      return 'check_circle';
    default:
      return 'help';
  }
} 

createBusinessUnitStatusChart(): void {
  const statuses = Array.from(new Set(this.filteredAccounts.map(a => a.scpStatus)));
  const units = Array.from(new Set(this.filteredAccounts.map(a => a.businessUnit)));
  
  const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ffcd56', '#9966ff', '#ff9f40', '#c9cbcf'];
  
  const series: Highcharts.SeriesOptionsType[] = statuses.map((status, idx) => ({
    type: 'column',
    name: status,
    data: units.map(unit =>
      this.filteredAccounts.filter(a => a.businessUnit === unit && a.scpStatus === status).length
    ),
    color: colors[idx % colors.length]
  }));

  this.businessUnitStatusChartOptions = {
    ...this.businessUnitStatusChartOptions,
    xAxis: { categories: units, title: { text: 'Business Unit' } },
    series: series
  };
}

createProjectStatusChart(): void {
  const statuses = Array.from(new Set(this.filteredAccounts.map(a => a.scpStatus)));
  const projects = Array.from(new Set(this.filteredAccounts.map(a => a.project)));
  
  const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ffcd56', '#9966ff', '#ff9f40', '#c9cbcf'];
  
  const series: Highcharts.SeriesOptionsType[] = statuses.map((status, idx) => ({
    type: 'column',
    name: status,
    data: projects.map(project =>
      this.filteredAccounts.filter(a => a.project === project && a.scpStatus === status).length
    ),
    color: colors[idx % colors.length]
  }));

  this.projectStatusChartOptions = {
    ...this.projectStatusChartOptions,
    xAxis: { categories: projects, title: { text: 'Project' } },
    series: series
  };
}
}
