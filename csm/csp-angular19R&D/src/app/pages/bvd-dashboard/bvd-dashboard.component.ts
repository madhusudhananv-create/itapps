import { Component, OnInit, ViewChild, Input, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOption } from '@angular/material/core';
import { Subscription } from 'rxjs';

// Services
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedData } from '../../shared/shared-data';
import { BvdDashboardService } from './services/bvd-dashboard.service';
import { BvdEntryService } from '../bvd-entry/services/bvd-entry.service';

// Models
import enumBenefit, { IdeaBenefitSummary } from '../../models/bvd-entry/idea-benefit-summary-model';
import { CustomerModel } from '../../models/customer.model';
import { ProjectResourceByEmpIdModel } from '../../models/emp-info-model';
import { Idea } from '../../models/bvd-entry/idea-model';
import { IdeaReview } from '../../models/bvd-entry/idea-review-model';

// Components
import { PortfolioProjectSelectorComponent } from '../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { BvdQuantitativeBenefitsComponent } from './bvd-quantitative-benefits/bvd-quantitative-benefits.component';
import { BvdQualitativeBenefitsComponent } from './bvd-qualitative-benefits/bvd-qualitative-benefits.component';

/**
 * BVD Dashboard Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Business Value Dashboard showing:
 * - Quantitative Benefits (Value and Value Additions)
 * - Qualitative Benefits (Value and Value Additions)
 * - Filters: Beneficiary, Date Range, Benefit Pillar, Status, Identified By
 * - Charts: Pie charts, Column charts, Stacked charts
 */
@Component({
  selector: 'app-bvd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    PortfolioProjectSelectorComponent,
    BvdQuantitativeBenefitsComponent,
    BvdQualitativeBenefitsComponent
  ],
  templateUrl: './bvd-dashboard.component.html',
  styleUrls: ['./bvd-dashboard.component.scss']
})
export class BvdDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('allSelected') allSelected!: MatOption;
  @ViewChild('identifiedSelect') identifiedSelect!: MatSelect;
  @ViewChild('allstatusSelected') allstatusSelected!: MatOption;
  @ViewChild('select') select!: MatSelect;

  @Input() customerId: string = '';

  // Injected services
  private readonly _bvdService = inject(BvdDashboardService);
  private readonly route = inject(ActivatedRoute);
  public readonly _util = inject(MyUtility);
  private readonly _appService = inject(AppsService);
  public readonly _shared = inject(SharedData);
  private readonly router = inject(Router);
  private readonly _bvdEntry = inject(BvdEntryService);

  // Component state
  searchValue: string = '';
  stackedValueAddEmpty: boolean = false;
  stackedValueEmpty: boolean = false;
  benefitsFilter = new findingBenefits();
  beneficiary: any[] = [];
  benefitPillar: any[] = [];
  customers: string[] = [];
  date = new Date();
  startDate!: Date;
  endDate!: Date;
  showFilter: boolean = false;
  portArray: number[] = [];
  projArray: any[] = [];
  selectedVal = new Date().getMonth();
  ideasStackedDataValue: any[] = [];
  ideasStackedDataValueAdd: any[] = [];
  sub?: Subscription;
  selectedCust: string = '';
  reset: boolean = false;
  progress: boolean = false;
  lblStartDate: any;
  lblEndDate: any;
  employees: ProjectResourceByEmpIdModel[] = [];
  empList: ProjectResourceByEmpIdModel[] = [];
  identifiedBy: any[] = [];
  status: number[] = [];

  // Chart data
  Value: any[] = [];
  ValueAdd: any[] = [];
  ValueDetail: any[] = [];
  ValueDetailQualitative: any[] = [];
  ValueAddDetailQualitative: any[] = [];
  ValueAddDetail: any[] = [];
  Valuechart: any[] = [];
  ValueAddchart: any[] = [];
  ValueColumnChart: any[] = [];
  ValueAddColumnChart: any[] = [];
  year: any;
  month: any;
  beginDate: any;

  ngOnInit() {
    if (this.customerId != undefined) {
      this.benefitsFilter.CustomerId.push(this.customerId);
      this.selectedCust = this.customerId;
    } else {
      this.sub = this.route.params.subscribe(params => {
        this.benefitsFilter.CustomerId.push(params['customerid']);
        this.selectedCust = params['customerid'];
        this.reset = params['reset'];
      });

      if (this.reset == undefined)
        this.reset = true;
    }
    
    localStorage.setItem('navigateurl', '');
    
    if (this.selectedCust == undefined) {
      this.router.navigateByUrl('/login');
      return;
    }

    const empId = localStorage.getItem('empId') || '';
    this.getCustomerList(empId);
    this.beneficiary = this._util.enumSelector(enumBenefit.BENEFICIARY);
    this.benefitPillar = this._util.enumSelector(enumBenefit.BENEFIT_PILLAR);
    this.status = [0, 2, 4, 3];
    this.getDates();
    this.getProjectResource();
  }

  ngAfterViewInit() {
    if (this._shared.selectedPortfolios != undefined && this._shared.selectedPortfolios.length > 0)
      this.portArray = this._shared.selectedPortfolios;

    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0)
      this.projArray = this._shared.selectedProjects;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  UOM_OnChange(uom_id: number, Flag: number) {
    this.benefitsFilter.UOMID = uom_id;
    this.service_getValueDasboarddetails(Flag);
    this.service_getColumndashboarddetails(Flag);
    this.getQuantitativeBenefitsDetail(Flag);
  }

  getDates() {
    this.benefitsFilter.StartDate = new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1);
    this.startDate = new Date(this.benefitsFilter.StartDate.toString());

    this.benefitsFilter.EndDate = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
    this.endDate = new Date(this.benefitsFilter.EndDate.toString());
  }

  getFilterValues() {
    this.Value = [];
    this.ValueAdd = [];
    this.ValueDetail = [];
    this.ValueAddDetail = [];
    this.ValueDetailQualitative = [];
    this.ValueAddDetailQualitative = [];
    this.Valuechart = [];
    this.ValueAddchart = [];
    this.ValueColumnChart = [];
    this.ValueAddColumnChart = [];

    if (this.startDate == undefined || this.startDate == null) {
      alert('Please Select Start date');
      return;
    }
    if (this.endDate == undefined || this.endDate == null) {
      alert('Please Select End date');
      return;
    }

    this.benefitsFilter.StartDate = this._util.setLocaleDate(this.startDate);
    this.benefitsFilter.EndDate = this._util.setLocaleDate(this.endDate);

    this.lblStartDate = this.benefitsFilter.StartDate;
    this.lblEndDate = this.benefitsFilter.EndDate;

    this._bvdService.dashboardStartdate = this.benefitsFilter.StartDate;
    this._bvdService.dashboardEnddate = this.benefitsFilter.EndDate;

    this.benefitsFilter.StatusId = this.status;
    
    if (this.endDate < this.startDate) {
      alert('End date cannot be lesser than Start date');
      return;
    }
    if (this.benefitsFilter.Beneficiary.length == 0) {
      alert('Please Select Beneficiary');
      return;
    }
    if (this.benefitsFilter.BenefitPillar.length == 0) {
      alert('Please Select Benefit Pillar');
      return;
    }
    if (this.benefitsFilter.StatusId.length == 0) {
      alert('Please Select Benefit Pillar');
      return;
    }
    if (this.benefitsFilter.IdentifiedBy.length == 0) {
      alert('Please Select Identified By Person');
      this.resetValues();
      return;
    }

    this.getQualitativeBenefitsByType();
    this.service_getValueDasboarddetails(0);
    this.service_getColumndashboarddetails(0);
    this.service_getIdeaStatusCountStackedGraph();
    this.getQualitativeBenefitsDetail();
    this.getQuantitativeBenefitsDetail(0);
  }

  getProjectResource() {
    if (this.selectedCust == undefined) {
      this.router.navigateByUrl('/login');
      return;
    }
    
    this._appService.getIdentifiedBy(this.selectedCust).subscribe({
      next: (data: ProjectResourceByEmpIdModel[]) => {
        this.employees = data;
        this.empList = data;
        this.benefitsFilter.IdentifiedBy = this.employees.map(x => x.emP_ID.toString());
        if (this.benefitsFilter.IdentifiedBy.length == this.employees.length)
          this.benefitsFilter.IdentifiedBy.push('-1');
        this.getFilterValues();
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  openedChange(opened: boolean) {
    this.searchValue = '';
    this.applyFilter(this.searchValue);
  }

  applyFilter(filterValue: string) {
    this.employees = this.empList.filter(opt =>
      opt.frsT_NM.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  toggleIdentifiedAll() {
    if (this.allSelected.selected) {
      this.identifiedSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.identifiedSelect.options.forEach((item: MatOption) => item.deselect());
    }
  }

  toggleSelection() {
    if (this.allstatusSelected.selected)
      this.select.options.forEach((item: MatOption) => item.select());
    else
      this.select.options.forEach((item: MatOption) => item.deselect());
  }

  tosslePerOne() {
    if (this.allstatusSelected.selected) {
      this.allstatusSelected.deselect();
      return false;
    }
    let count = 0;
    this.select.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.benefitsFilter.StatusId.length == count + 1)
      this.allstatusSelected.select();

    return true;
  }

  toggleIdentifiedby() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    let count = 0;
    this.identifiedSelect.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.employees.length == count)
      this.allSelected.select();

    return true;
  }

  identifiedBy_OnChange(event: any) {
    this.benefitsFilter.IdentifiedBy = event;
  }

  getCustomerList(empId: string) {
    this._appService.GetCustomerList(empId, false).subscribe({
      next: (data: any) => {
        this.customers = data;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  getQualitativeBenefitsByType() {
    this._bvdService.getQualitativeBenefit(this.benefitsFilter).subscribe({
      next: (data: any) => {
        this.Value = data.benefits_Value;
        this.ValueAdd = data.benefits_ValueAdd;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  service_getValueDasboarddetails(Flag: number) {
    this._bvdService.getValuePieChart(this.benefitsFilter).subscribe({
      next: (data: any) => {
        if (Flag == 0 || Flag == 1)
          this.Valuechart = data.benefits_Quantitative_Value;
        if (Flag == 0 || Flag == 2)
          this.ValueAddchart = data.benefits_Quantitative_ValueAdd;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  service_getIdeaStatusCountStackedGraph() {
    this._bvdService.getIdeaStatusCountsByType(this.benefitsFilter).subscribe({
      next: (data: any[]) => {
        this.ideasStackedDataValue = data.filter(x => x.type == 'Value');
        this.stackedValueEmpty = this.ideasStackedDataValue.length > 0 ? false : true;
        this.ideasStackedDataValueAdd = data.filter(x => x.type == 'Value_Add');
        this.stackedValueAddEmpty = this.ideasStackedDataValueAdd.length > 0 ? false : true;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  service_getColumndashboarddetails(Flag: number) {
    this._bvdService.getvalueColumnChart(this.benefitsFilter).subscribe({
      next: (data: any) => {
        if (Flag == 0 || Flag == 1)
          this.ValueColumnChart = data.benefits_Quantitative_Column_Value;
        if (Flag == 0 || Flag == 2)
          this.ValueAddColumnChart = data.benefits_Quantitative_Column_ValueAdd;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  getQualitativeBenefitsDetail() {
    this._bvdService.getQualitativeBenefitDetail(this.benefitsFilter).subscribe({
      next: (data: any) => {
        this.ValueDetailQualitative = data.benefits_Value;
        this.ValueAddDetailQualitative = data.benefits_ValueAdd;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  getQuantitativeBenefitsDetail(Flag: number) {
    this._bvdService.getQuantitativeBenefitsDetail(this.benefitsFilter).subscribe({
      next: (data: any) => {
        if (Flag == 0 || Flag == 1)
          this.ValueDetail = data.benefits_Quantitative_Value;
        if (Flag == 0 || Flag == 2)
          this.ValueAddDetail = data.benefits_Quantitative_ValueAdd;
      },
      error: (err) => {
        this._util.serviceError(err);
      }
    });
  }

  resetValues() {
    this.Value = [];
    this.ValueAdd = [];
    this.ValueDetail = [];
    this.ValueAddDetail = [];
    this.ValueDetailQualitative = [];
    this.ValueAddDetailQualitative = [];
    this.Valuechart = [];
    this.ValueAddchart = [];
    this.ValueColumnChart = [];
    this.ValueAddColumnChart = [];
  }

  Refresh_Onclick() {
    this.service_refreshDashboardDetails();
  }

  service_refreshDashboardDetails() {
    this.progress = true;
    this.getDates();
    this.getFilterValues();
    this.getSelectedProjectsList(-1);
  }

  getSelectedProjectsList(event: any) {
    this.projArray = event;
    this.benefitsFilter.ProjectId = this.projArray;

    if (this.benefitsFilter.ProjectId.length > 0) {
      this.getQualitativeBenefitsByType();
      this.service_getValueDasboarddetails(0);
      this.service_getColumndashboarddetails(0);
      this.service_getIdeaStatusCountStackedGraph();
      this.getQualitativeBenefitsDetail();
      this.getQuantitativeBenefitsDetail(0);
    } else {
      this.resetValues();
    }
  }

  addNewIdea() {
    this._bvdEntry.bvdViewType = 1;
    this._bvdEntry.bvdidea = new Idea();
    this._bvdEntry.bvdbenefit = [];
    this._bvdEntry.bvdimplementationschdules = [];
    this._bvdEntry.currentStep = 1;
    this._bvdEntry.isIdeaSubmitted = false;
    this._bvdEntry.projecT_ID = '';
    this._bvdEntry.ideA_ID = 0;
    this._bvdEntry.isIdeaApproved = false;
    this._bvdEntry.bvdreview = new IdeaReview();

    // Store navigation source - coming from BVD Dashboard
    window.localStorage.setItem('isFromAddNewIdea', 'true');
    window.localStorage.setItem('ideaNavigationSource', 'dashboard');

    if (this._util.IsPremier(this.selectedCust)) {
      this.router.navigate(['/serviceleveldashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
    } else {
      this.router.navigate(['/newdashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
    }
  }

  /**
   * Navigate to Ideas List View
   * Shows all ideas for the selected customer
   */
  viewIdeas(): void {

    window.localStorage.removeItem('isFromAddNewIdea');

    if (this._util.IsPremier(this.selectedCust)) {
      // Navigate to list view (WITHOUT /entry for viewing)
      this.router.navigate(['/serviceleveldashboard/cust', this.selectedCust, this.reset, 'listview']);
    } else {
      // Navigate to list view (WITHOUT /entry for viewing)
      this.router.navigate(['/newdashboard/cust', this.selectedCust, this.reset, 'listview']);
    }
  }

  /** Returns a short label for active benefit pillar chips. */
  getPillarLabel(): string {
    const pillars = this.benefitsFilter.BenefitPillar;
    if (!pillars || pillars.length === 0) return '';
    const all = this.benefitPillar.map((p: any) => p.value);
    if (pillars.length === all.length) return 'All Pillars';
    return this.benefitPillar
      .filter((p: any) => pillars.includes(p.value))
      .map((p: any) => p.title)
      .join(', ');
  }
}

export class findingBenefits {
  Beneficiary: number[] = [1, 2];
  CustomerId: string[] = [];
  ProjectId: string[] = [];
  Year: number = new Date().getFullYear();
  Frequency: string = 'monthly';
  TypeId: number = 1;
  BenefitPillar: number[] = [1, 2, 3, 4, 5];
  StartDate!: Date;
  EndDate!: Date;
  UOMID: number = 1;
  IdentifiedBy: string[] = [];
  StatusId: number[] = [0, 1, 2, 3, 4];
}
