import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AppServiceOthers } from '../../Services/apps.service.other';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { BvdDashboardService } from './services/bvd-dashboard.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { TokenInterceptor } from './services/token-interceptor';
import enumBenefit, { IdeaBenefitSummary } from '../../models/bvd-entry/idea-benefit-summary-model';
import { FormControl } from '@angular/forms';
import { SelectionChange } from '@angular/cdk/collections';
import { MatSelectChange, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatOption, MatSelect } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerModel } from '../../models/customer-model';
import { SharedService } from '../../Shared/shared.service';
import { ProjectResourceByEmpIdModel } from '../../models/emp-info-model';
import { BvdEntryService } from '../bvd-entry/services/bvd-entry.service';
import { Idea } from '../../models/bvd-entry/idea-model';
import { IdeaReview } from '../../models/bvd-entry/idea-review-model';


@Component({
  selector: 'app-bvd-dashboard',
  templateUrl: './bvd-dashboard.component.html',
  styleUrls: ['./bvd-dashboard.component.scss']
})
export class BvdDashboardComponent implements OnInit {

  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('identifiedSelect') identifiedSelect: MatSelect;

  @ViewChild('allstatusSelected') allstatusSelected: MatOption;
  @ViewChild('select') select: MatSelect;

  searchValue: string = "";
  stackedValueAddEmpty: boolean;
  stackedValueEmpty: boolean;
  benefitsFilter = new findingBenefits();
  beneficiary = [];
  benefitPillar = []
  customers: string[] = [];
  date = new Date();
  startDate: Date;
  endDate: Date;
  showFilter: boolean;
  portArray: number[] = [];
  projArray: any[] = [];
  selectedVal = new Date().getMonth();
  ideasStackedDataValue: any[] = [];
  ideasStackedDataValueAdd: any[] = [];
  sub: any;
  selectedCust: string;
  reset: boolean = false;
  progress: boolean = false;
  lblStartDate;
  lblEndDate;
  employees: ProjectResourceByEmpIdModel[] = [];
  empList: ProjectResourceByEmpIdModel[] = [];
  identifiedBy: any[]
  status: number[] = [];
  @Input('customerId') customerId: string;

  constructor(private _bvdService: BvdDashboardService, private route: ActivatedRoute, private _util: myUtility,
    private _appService: AppsService, private _shared: SharedService, private router: Router, private _bvdEntry: BvdEntryService) {
  }


  ngOnInit() {
    if (this.customerId != undefined) {
      this.benefitsFilter.CustomerId.push(this.customerId);
      this.selectedCust = this.customerId;
    }
    else {
      this.sub = this.route.params.subscribe(params => {
        this.benefitsFilter.CustomerId.push(params['customerid']);
        this.selectedCust = params['customerid'];
        this.reset = params['reset'];
      });

      if (this.reset == undefined)
        this.reset = true;
    }
    localStorage.setItem('navigateurl', '');
    if (this.selectedCust == undefined) { this.router.navigateByUrl('/login'); return; };

    let empId = localStorage.getItem('empId');
    this.getCustomerList(empId);
    this.beneficiary = this._util.enumSelector(enumBenefit.BENEFICIARY);
    this.benefitPillar = this._util.enumSelector(enumBenefit.BENEFIT_PILLAR);
    this.status = [0, 2, 4, 3];
    this.getDates();
    this.getProjectResource();
  }

  Value = [];
  ValueAdd = [];
  ValueDetail = [];
  ValueDetailQualitative = [];
  ValueAddDetailQualitative = [];
  ValueAddDetail = [];
  Valuechart = [];
  ValueAddchart = [];
  ValueColumnChart = [];
  ValueAddColumnChart = [];
  year;
  month;
  beginDate;

  UOM_OnChange(uom_id, Flag) {
    this.benefitsFilter.UOMID = uom_id;
    this.service_getValueDasboarddetails(Flag);
    this.service_getColumndashboarddetails(Flag);
    this.getQuantitativeBenefitsDetail(Flag);
  }

  ngAfterViewInit() {
    if (this._shared.selectedPortfolios != undefined && this._shared.selectedPortfolios.length > 0)
      this.portArray = this._shared.selectedPortfolios;

    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0)
      this.projArray = this._shared.selectedProjects;
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
      alert("Please Select Start date");
      return;
    }
    if (this.endDate == undefined || this.endDate == null) {
      alert("Please Select End date");
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
      alert("End date cannot be lesser than Start date");
      return;
    }
    if (this.benefitsFilter.Beneficiary.length == 0) {
      alert("Please Select Beneficiary");
      return;
    }
    if (this.benefitsFilter.BenefitPillar.length == 0) {
      alert("Please Select Benefit Pillar");
      return;
    }
    if (this.benefitsFilter.StatusId.length == 0) {
      alert("Please Select Benefit Pillar");
      return;
    }
    if (this.benefitsFilter.IdentifiedBy.length == 0) {
      alert("Please Select Identified By Person");
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

    if (this.selectedCust == undefined) { this.router.navigateByUrl('/login'); return; };
    this._appService.getIdentifiedBy(this.selectedCust).subscribe(data => {

      this.employees = data;
      this.empList = data;
      this.benefitsFilter.IdentifiedBy = this.employees.map(x => x.emP_ID.toString());
      if (this.benefitsFilter.IdentifiedBy.length == this.employees.length)
        this.benefitsFilter.IdentifiedBy.push('-1');
      this.getFilterValues();
    }, error => { this._util.serviceError(error); })

  }
  openedChange(opened: boolean) {

    this.searchValue = "";
    this.applyFilter(this.searchValue);
  }
  applyFilter(filterValue: string) {
    this.employees = this.empList.filter(opt => opt.frsT_NM.toLowerCase().includes(filterValue.toLowerCase()));
  }

  toggleIdentifiedAll() {
    if (this.allSelected.selected) {
      this.identifiedSelect.options.forEach((item: MatOption) => item.select());
    }
    else {
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
  }

  identifiedBy_OnChange(event) {
    this.benefitsFilter.IdentifiedBy = event
  }

  getCustomerList(empId) {
    this._appService.GetCustomerList(empId, false).subscribe(data => {
      this.customers = data;
    }, (err) => { this._util.serviceError(err) })
  }

  getQualitativeBenefitsByType() {
    this._bvdService.getQualitativeBenefit(this.benefitsFilter).subscribe(data => {
      this.Value = data.benefits_Value;
      this.ValueAdd = data.benefits_ValueAdd;
    }, (err) => { this._util.serviceError(err) })
  }


  service_getValueDasboarddetails(Flag) {
    this._bvdService.getValuePieChart(this.benefitsFilter).subscribe(data => {
      if (Flag == 0 || Flag == 1)
        this.Valuechart = data.benefits_Quantitative_Value;
      if (Flag == 0 || Flag == 2)
        this.ValueAddchart = data.benefits_Quantitative_ValueAdd

    }, (err) => { this._util.serviceError(err) })
  }

  service_getIdeaStatusCountStackedGraph() {
    this._bvdService.getIdeaStatusCountsByType(this.benefitsFilter).subscribe(data => {
      this.ideasStackedDataValue = data.filter(x => x.type == 'Value');
      this.stackedValueEmpty = this.ideasStackedDataValue.length > 0 ? false : true;
      this.ideasStackedDataValueAdd = data.filter(x => x.type == 'Value_Add');
      this.stackedValueAddEmpty = this.ideasStackedDataValueAdd.length > 0 ? false : true;
    }, (err) => { this._util.serviceError(err) })
  }

  service_getColumndashboarddetails(Flag) {
    this._bvdService.getvalueColumnChart(this.benefitsFilter).subscribe(data => {
      if (Flag == 0 || Flag == 1)
        this.ValueColumnChart = data.benefits_Quantitative_Column_Value;
      if (Flag == 0 || Flag == 2)
        this.ValueAddColumnChart = data.benefits_Quantitative_Column_ValueAdd;

    }, (err) => { this._util.serviceError(err) })
  }

  getQualitativeBenefitsDetail() {
    this._bvdService.getQualitativeBenefitDetail(this.benefitsFilter).subscribe(data => {
      this.ValueDetailQualitative = data.benefits_Value;
      this.ValueAddDetailQualitative = data.benefits_ValueAdd;

    }, (err) => { this._util.serviceError(err) })
  }

  getQuantitativeBenefitsDetail(Flag) {
    this._bvdService.getQuantitativeBenefitsDetail(this.benefitsFilter).subscribe(data => {
      if (Flag == 0 || Flag == 1)
        this.ValueDetail = data.benefits_Quantitative_Value;
      if (Flag == 0 || Flag == 2)
        this.ValueAddDetail = data.benefits_Quantitative_ValueAdd;
    }, (err) => { this._util.serviceError(err) })
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

  service_refreshDashboardDetails() {
    this.progress = true;
    this.getDates();
    this.getFilterValues();
    this.getSelectedProjectsList(-1);

  }

  getSelectedProjectsList(event) {

    this.projArray = event;
    this.benefitsFilter.ProjectId = this.projArray;

    if (this.benefitsFilter.ProjectId.length > 0) {
      this.getQualitativeBenefitsByType();
      this.service_getValueDasboarddetails(0);
      this.service_getColumndashboarddetails(0);
      this.service_getIdeaStatusCountStackedGraph();
      this.getQualitativeBenefitsDetail();
      this.getQuantitativeBenefitsDetail(0);
    }
    else {
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

    window.localStorage.setItem('isFromAddNewIdea', 'true')

    if (this._util.IsPremier(this.selectedCust)) {
      this.router.navigate(['/serviceleveldashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
    }
    else {
      this.router.navigate(['/newdashboard/cust', this.selectedCust, this.reset, 'listview', 'entry']);
    }

  }
}

export class findingBenefits {
  Beneficiary: number[] = [1, 2]
  CustomerId: string[] = [];//[202100011];
  ProjectId: string[] = [];
  Year: number = new Date().getFullYear();
  Frequency: string = "monthly"
  TypeId: number = 1
  BenefitPillar: number[] = [1, 2, 3, 4, 5]
  StartDate: Date
  EndDate: Date
  UOMID: number = 1;
  IdentifiedBy: string[] = [];
  StatusId: number[] = [0, 1, 2, 3, 4]
}

