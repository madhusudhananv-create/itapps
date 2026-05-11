import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { AppsService } from '../../../services/apps.service';
import { SharedService } from '../../../shared/shared.service';
import { AccessControl } from '../../../shared/access-control';
import { COODashboardCommon } from '../../../models/coo-dashboard-common.model';
import { CustomerProjectIds } from '../../../models/customer-project-ids.model';
import { SearchableMultiselectDropdownComponent } from '../../../controls/searchable-multiselect-dropdown/searchable-multiselect-dropdown.component';

@Component({
  selector: 'app-dashboard-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    SearchableMultiselectDropdownComponent
  ],
  templateUrl: './dashboard-filter.component.html',
  styleUrl: './dashboard-filter.component.scss'
})
export class DashboardFilterComponent implements OnInit, OnDestroy {
  @Input() projId: string[] = [];
  @Input() custId: string[] = [];
  @Input() rowId: string = '';
  
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  @Output() onChange: EventEmitter<CustomerProjectIds> = new EventEmitter<CustomerProjectIds>();

  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('projectSelect') projectSelect!: MatSelect;
  @ViewChild('portselect') portselect!: MatSelect;
  @ViewChild('ddCustomer') ddCustomer!: MatSelect;
  @ViewChild('allCustSelected') allCustSelected!: MatOption;

  searchUserForm!: FormGroup;
  selectedPeriod: string = '';
  selectedCust: string[] = [];
  selectedProj: string[] = [];
  searchProjVal: string = '';
  searchCustVal: string = '';
  
  customer: any[] = [];
  customers: any[] = [];
  project: any[] = [];
  projects: any[] = [];
  portfolioList: any[] = [];
  portfolioprojectMap: any[] = [];

  selectedDateType: string = '1';
  fromDate: Date = new Date();
  toDate: Date = new Date();
  Year: number = new Date().getFullYear();
  Month: number = new Date().getMonth() + 1;
  QiD: number = 1;
  Yearrange: number[] = [];
  
  loading: boolean = false;
  reset: boolean = false;
  isLoaded: boolean = false;
  
  public _cooDashboardCommon!: COODashboardCommon;
  private subscription: Subscription = new Subscription();

  constructor(
    private _appservice: AppsService,
    private _sharedService: SharedService,
    private _accessControl: AccessControl,
    private fb: FormBuilder
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
    this.searchUserForm = this.fb.group({
      custNames: new FormControl([]),
      userType: new FormControl([])
    });
  }

  ngOnInit(): void {
    this.getCurrentMonth();
    this.getCurrentQuarter();
    this.ddView_Onchange(null);
    this.LoadCustomerProjectsByEmpId();
    this.Yearrange = this.getYears();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Helper method to get year range
  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  // Helper method for error handling
  private serviceError(error: any): void {
    console.error('Service error:', error);
    alert('An error occurred. Please try again.');
  }

  // Helper method to get quarter info
  private getQuarter(qid: number, year: number): { startDate: string, endDate: string } | null {
    // Fiscal quarters: Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
    const quarters = [
      { startDate: `${year}-04-01`, endDate: `${year}-06-30` }, // Q1
      { startDate: `${year}-07-01`, endDate: `${year}-09-30` }, // Q2
      { startDate: `${year}-10-01`, endDate: `${year}-12-31` }, // Q3
      { startDate: `${year + 1}-01-01`, endDate: `${year + 1}-03-31` } // Q4
    ];
    return quarters[qid - 1] || null;
  }

  LoadCustomerProjectsByEmpId(): void {
    const empid = localStorage.getItem('empid') || '';
    const projectId = localStorage.getItem('projectId') || '';
    const customerId = localStorage.getItem('customerId') || '';
    
    // Check access control - using 4 parameters as required
    let AllAllowed = this._accessControl.IsAllowed(71, 1, projectId, customerId);
    
    if (AllAllowed) {
      this._cooDashboardCommon.AllAccounts = true;
      let sub = this._appservice.GetCustomerProjectsList(empid).subscribe(
        (res: any) => {
          if (res != null && res.length > 0) {
            this.customers = res;
            this.customer = res;
            this.LoadCustomer();
            
            // Auto-select all customers
            setTimeout(() => {
              if (this.allCustSelected) {
                this.allCustSelected.select();
              }
              // Select all customer IDs
              this._cooDashboardCommon.customerIds = this.customers.map((c: any) => c.cusT_ID.toString());
            }, 500);
            
            // Auto-select all projects after customers are selected
            setTimeout(() => {
              this.getProjects();
              setTimeout(() => {
                if (this.allSelected) {
                  this.allSelected.select();
                }
                // Select all project IDs
                this._cooDashboardCommon.projectIds = this.projects.map((p: any) => p.proJ_ID.toString());
                
                // Trigger initial data load
                if (this._cooDashboardCommon.customerIds && 
                    this._cooDashboardCommon.customerIds.length > 0 &&
                    this._cooDashboardCommon.projectIds &&
                    this._cooDashboardCommon.projectIds.length > 0) {
                  this.loadData();
                }
              }, 300);
            }, 800);
          }
        },
        (error: any) => {
          this.serviceError(error);
        }
      );
      this.subscription.add(sub);
    } else {
      this._cooDashboardCommon.AllAccounts = false;
      let projids = localStorage.getItem('projIds');
      if (projids != null) {
        let sub = this._appservice.GetCustomerProjectListForProjIds(projids).subscribe(
          (res: any) => {
            if (res != null && res.length > 0) {
              this.customers = res;
              this.customer = res;
              this.LoadCustomer();
              
              // Auto-select all customers
              setTimeout(() => {
                if (this.allCustSelected) {
                  this.allCustSelected.select();
                }
                // Select all customer IDs
                this._cooDashboardCommon.customerIds = this.customers.map((c: any) => c.cusT_ID.toString());
              }, 500);
              
              // Auto-select all projects after customers are selected
              setTimeout(() => {
                this.getProjects();
                setTimeout(() => {
                  if (this.allSelected) {
                    this.allSelected.select();
                  }
                  // Select all project IDs
                  this._cooDashboardCommon.projectIds = this.projects.map((p: any) => p.proJ_ID.toString());
                  
                  // Trigger initial data load
                  if (this._cooDashboardCommon.customerIds && 
                      this._cooDashboardCommon.customerIds.length > 0 &&
                      this._cooDashboardCommon.projectIds &&
                      this._cooDashboardCommon.projectIds.length > 0) {
                    this.loadData();
                  }
                }, 300);
              }, 800);
            }
          },
          (error: any) => {
            this.serviceError(error);
          }
        );
        this.subscription.add(sub);
      }
    }
  }

  LoadCustomer(): void {
    this.customer = this.customers;
  }

  LoadProject(): void {
    this.project = this.projects;
  }

  ddCustomer_Onchange(event: any): void {
    this.getProjects();
  }

  customer_Onchange(event: string[]): void {
    this._cooDashboardCommon.customerIds = event;
    this.getProjects();
  }

  project_onChange(event: string[]): void {
    this._cooDashboardCommon.projectIds = event;
  }

  getProjects(): void {
    let custIds = this._cooDashboardCommon.customerIds;
    this.projects = [];
    this.project = [];
    
    if (custIds != null && custIds.length > 0) {
      this.customers.forEach((cust: any) => {
        if (custIds.includes(cust.cusT_ID.toString())) {
          if (cust.projects != null && cust.projects.length > 0) {
            cust.projects.forEach((proj: any) => {
              this.projects.push(proj);
            });
          }
        }
      });
      this.isLoaded = false;
      this.LoadProject();
    }
  }

  toggleAllSelection(): void {
    if (this.allSelected.selected) {
      this.projectSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.projectSelect.options.forEach((item: MatOption) => item.deselect());
    }
  }

  toggleAllCustomerSelection(): void {
    if (this.allCustSelected.selected) {
      this.ddCustomer.options.forEach((item: MatOption) => item.select());
    } else {
      this.ddCustomer.options.forEach((item: MatOption) => item.deselect());
    }
  }

  tosslePerOne(): void {
    if (this.allSelected && this.allSelected.selected) {
      this.allSelected.deselect();
    }
    let allSelected = true;
    this.projectSelect.options.forEach((item: MatOption) => {
      if (!item.selected && item.value !== -1) {
        allSelected = false;
      }
    });
    if (allSelected && this.allSelected) {
      this.allSelected.select();
    }
  }

  tosslePerOneCust(): void {
    if (this.allCustSelected && this.allCustSelected.selected) {
      this.allCustSelected.deselect();
    }
    let allSelected = true;
    this.ddCustomer.options.forEach((item: MatOption) => {
      if (!item.selected && item.value !== -1) {
        allSelected = false;
      }
    });
    if (allSelected && this.allCustSelected) {
      this.allCustSelected.select();
    }
  }

  onCustomerKey(value: string): void {
    this.searchCustVal = value;
    this.SearchCust();
  }

  onProjectKey(value: string): void {
    this.searchProjVal = value;
    this.SearchProject();
  }

  SearchCust(): void {
    let filter = this.searchCustVal.toLowerCase();
    if (filter) {
      this.customer = this.customers.filter((option: any) =>
        option.cusT_NM.toLowerCase().includes(filter)
      );
    } else {
      this.customer = this.customers;
    }
  }

  SearchProject(): void {
    let filter = this.searchProjVal.toLowerCase();
    if (filter) {
      this.project = this.projects.filter((option: any) =>
        option.proJ_NM.toLowerCase().includes(filter)
      );
    } else {
      this.project = this.projects;
    }
  }

  isInputsValid(): boolean {
    if (this._cooDashboardCommon.customerIds == null || 
        this._cooDashboardCommon.customerIds.length == 0) {
      alert('Please select at least one customer');
      return false;
    }
    if (this._cooDashboardCommon.projectIds == null || 
        this._cooDashboardCommon.projectIds.length == 0) {
      alert('Please select at least one project');
      return false;
    }
    return true;
  }

  Apply(): void {
    if (this.isInputsValid()) {
      this.loadData();
    }
  }

  Reset(): void {
    this.reset = true;
    this.isLoaded = false;
    this.customer = [];
    this.searchCustVal = '';
    this.searchProjVal = '';
    this._cooDashboardCommon.ViewId = 5; // Monthly view
    this.getCurrentMonth();
    setTimeout(() => {
      this.reset = false;
      this.LoadCustomerProjectsByEmpId();
    }, 2000);
  }

  loadData(): void {
    // Emit filter change event
    let model = new CustomerProjectIds();
    model.CustomerIds = this._cooDashboardCommon.customerIds;
    model.ProjectIds = this._cooDashboardCommon.projectIds;
    model.StartDate = this._cooDashboardCommon.dashboardStartdate;
    model.EndDate = this._cooDashboardCommon.dashboardEnddate;
    this.onChange.emit(model);
    
    // Set the quarter period text for display
    let qtr: string;
    if (this._cooDashboardCommon.ViewId === 5) {
      // Monthly view
      qtr = this.getQuarterFromMonth(this.Month);
    } else if (this._cooDashboardCommon.ViewId === 3) {
      // Annual view
      qtr = 'YT';
    } else if (this._cooDashboardCommon.ViewId === 1) {
      // Quarterly view
      qtr = 'Q' + this.QiD;
    } else {
      // Default to Q1
      qtr = 'Q1';
    }
    
    this._cooDashboardCommon.selectedQPeriodCss = qtr;
    this._cooDashboardCommon.selectedQPeriodCsg = qtr;
  }
  
  /**
   * Get quarter string from month number
   */
  private getQuarterFromMonth(month: number): string {
    if (month >= 4 && month <= 6) return 'Q1';
    if (month >= 7 && month <= 9) return 'Q2';
    if (month >= 10 && month <= 12) return 'Q3';
    return 'Q4'; // Jan-Mar
  }

  ddMonth_OnChange(event: any): void {
    this.Month = event;
    // Store in shared service if needed (temporarily commented)
    // this._sharedService.SelectedMonth = this.Month;
    this.setDateRange();
  }

  ddQuarter_Onchange(event: any): void {
    this.QiD = event;
    // Store in shared service if needed (temporarily commented)
    // this._sharedService.SelectedQuarter = this.QiD;
    this.setDateRange();
  }

  ddView_Onchange(event: any): void {
    // Note: event will be null on initial call from ngOnInit
    if (event !== null && event !== undefined) {
      this._cooDashboardCommon.ViewId = event;
    }
    // Set date ranges for all view types except Period (ViewId 4)
    if (this._cooDashboardCommon.ViewId !== 4) {
      this.setDateRange();
    }
  }

  ddYear_Onchange(event: any): void {
    this.Year = event;
    // Store in shared service if needed (temporarily commented)
    // this._sharedService.SelectedYear = this.Year;
    this.setDateRange();
  }

  setDateRange(): void {
    let viewId = this._cooDashboardCommon.ViewId;
    
    if (viewId === 1) {
      // Quarterly
      this.setQuarterlyRange();
    } else if (viewId === 3) {
      // Annual (Year-to-date)
      this.setYearlyRange();
    } else if (viewId === 5) {
      // Monthly
      this.setMonthlyRange();
    }
  }

  setQuarterlyRange(): void {
    // Fiscal quarters: Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
    if (this.QiD === 1) {
      this._cooDashboardCommon.dashboardStartdate = new Date(this.Year, 3, 1); // April 1
      this._cooDashboardCommon.dashboardEnddate = new Date(this.Year, 5, 30); // June 30
    } else if (this.QiD === 2) {
      this._cooDashboardCommon.dashboardStartdate = new Date(this.Year, 6, 1); // July 1
      this._cooDashboardCommon.dashboardEnddate = new Date(this.Year, 8, 30); // September 30
    } else if (this.QiD === 3) {
      this._cooDashboardCommon.dashboardStartdate = new Date(this.Year, 9, 1); // October 1
      this._cooDashboardCommon.dashboardEnddate = new Date(this.Year, 11, 31); // December 31
    } else if (this.QiD === 4) {
      this._cooDashboardCommon.dashboardStartdate = new Date(this.Year + 1, 0, 1); // January 1 (next year)
      this._cooDashboardCommon.dashboardEnddate = new Date(this.Year + 1, 2, 31); // March 31 (next year)
    }
  }

  setMonthlyRange(): void {
    const startDate = new Date(this.Year, this.Month - 1, 1);
    const nextMonth = this.Month === 12 ? 1 : this.Month + 1;
    const nextYear = this.Month === 12 ? this.Year + 1 : this.Year;
    const endDate = new Date(nextYear, nextMonth - 1, 0);
    
    this._cooDashboardCommon.dashboardStartdate = startDate;
    this._cooDashboardCommon.dashboardEnddate = endDate;
  }

  setYearlyRange(): void {
    // Fiscal year starts from April and ends in March next year
    const startDate = new Date(this.Year, 3, 1); // April 1
    const endDate = new Date(this.Year + 1, 2, 31); // March 31 next year
    
    this._cooDashboardCommon.dashboardStartdate = startDate;
    this._cooDashboardCommon.dashboardEnddate = endDate;
  }

  getCurrentQuarter(): void {
    // Calculate current fiscal quarter (Apr-Mar)
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    // Fiscal quarters: Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
    if (month >= 3 && month <= 5) {
      this.QiD = 1; // Q1: Apr-Jun
    } else if (month >= 6 && month <= 8) {
      this.QiD = 2; // Q2: Jul-Sep
    } else if (month >= 9 && month <= 11) {
      this.QiD = 3; // Q3: Oct-Dec
    } else {
      this.QiD = 4; // Q4: Jan-Mar
    }
    // Store in shared service if needed (temporarily commented)
    // this._sharedService.SelectedQuarter = this.QiD;
  }

  getCurrentMonth(): void {
    const today = new Date();
    this.Month = today.getMonth() + 1; // 1-12
    
    // Handle fiscal year: if January, use previous year
    if (this.Month === 1) {
      this.Year = today.getFullYear() - 1;
    } else {
      this.Year = today.getFullYear();
    }
    
    // Store in shared service if needed (temporarily commented)
    // this._sharedService.SelectedMonth = this.Month;
  }
}
