import { Component, OnInit, Output, ViewChild, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { COODashboardService } from '../coo-dashboard.service';
import { MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../models/portfolio-model';
import { AccessControl } from '../../../Shared/accessControl';
import { CustomerProjectIds } from '../../../models/customer-projects-model';
import { OverallStatusPage1Component } from '../tab-overall-status/overall-status-page1/overall-status-page1.component';
import { SharedService } from '../../../Shared/shared.service';
import { AccountHealthViewdetailsComponent } from '../dashboard-controls/account-health-viewdetails/account-health-viewdetails.component';
import { COODashboardCommon } from '../coo-dashboard-common';
import { Subscription } from 'rxjs';

//import { start } from 'repl';
@Component({
  selector: 'app-dashboard-filter',
  templateUrl: './dashboard-filter.component.html',
  styleUrls: ['./dashboard-filter.component.scss']
})
export class DashboardFilterComponent implements OnInit {

  menuToggleStatus: boolean;
  selectedPeriod = 'asToday';
  selectedCust: string = "-1";
  selectedProj: any[] = [];
  searchProjVal = "";
  searchCustVal = "";
  selectedPortfolio: number[];
  empid: string;
  customerId: string;
  portId: number[];
  projectIds = [];
  customers: any[] = [];
  projects: any[] = [];
  portfolioList: any[];
  customer = [];
  project = [];
  projectList: any[] = [];
  portfolioprojectMap: ProjectModelNew[] = [];
  selectedDateType: string = "1";
  loading: boolean = false;
  reset : boolean = true;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('projectSelect') projectSelect: MatSelect;
  @ViewChild('portSelect') portselect: MatSelect;
  @ViewChild('ddCustomer') ddCustomer: MatSelect;
  @Input("projId") projId: string[] = ["-1"];
  @Input("custId") custId: string[] = ["-1"];
  // @Input("allcust") allcust: boolean = true;
  // @Input("allproj") allproj: boolean = false;
  @Input("rowId") rowId: number;
  isChecked: boolean = false;
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  @Output() onChange: EventEmitter<CustomerProjectIds> = new EventEmitter<CustomerProjectIds>();
  ciTrackerParamerterModel: any;
  searchUserForm: any;
  @ViewChild('allCustSelected') allCustSelected: MatOption;
  fromDate: Date;
  toDate: Date;
  isProjsLoaded = false;
  QiD: number;
  Month: number;
  Yearrange = [];
  Year: number;
  isLoaded: boolean = false;
  private subscription: Subscription;
  constructor(private _appservice: AppsService, public _shared: SharedService, private _overallStatusPage1Component: OverallStatusPage1Component, private _accountHealthViewdetailsComponent: AccountHealthViewdetailsComponent, public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, changeDetectorRef: ChangeDetectorRef, public _access: AccessControl, public _util: myUtility, private fb: FormBuilder) {

    // this.allcust = true;
    // this.allproj = true;
    if (this._access.IsAllowed(71, 1, '', '')) {
      this._cooDashboardCommon.allcust = true;
      this._cooDashboardCommon.allproj = true;
    }
    else {
      this._cooDashboardCommon.allcust = false;
      this._cooDashboardCommon.allproj = false;
    }

  }
  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.ddCustomer_Onchange(null);
    // }, 2000);
  }
  ngOnInit() {
    this.empid = localStorage.getItem('empid');
    this.getCurrentMonth();
    this.getCurrentQuarter();
    this.ddView_Onchange(null);
    this.LoadCustomerProjectsByEmpId();
    this.searchUserForm = this.fb.group({
      userType: new FormControl(''),
      custNames: new FormControl('')
    });
    this.Yearrange = this._util.Years(3);
  }
  ngOnDestroy() {
   
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  BindCustomerProjects(data) {
    this._cooDashboardCommon.customerProjectsList = data;
    this.customer = this._cooDashboardCommon.getUniqueCustIdNameFromList(data, "cusT_ID", "cusT_NM");
    this._cooDashboardCommon.customersList = this.customer;
    this._cooDashboardCommon.userProjects = this._cooDashboardCommon.getUniqueProjIdNameFromList(data, "proJ_ID", "proJ_NM").sort((n1, n2) => { return n1.proJ_NM.toLowerCase() > n2.proJ_NM.toLowerCase() ? 1 : -1 });;
    let projects = localStorage.getItem('projIds');
    if (projects == null || projects == undefined) {
      const selectedIds = this._cooDashboardCommon.userProjects.map(({ id }) => id);
      this._cooDashboardCommon.projectIds = selectedIds;
      localStorage.setItem('projIds', JSON.stringify(selectedIds));
    }
    setTimeout(() => {
      if (this.allCustSelected != undefined && this.allCustSelected != null)
        this.allCustSelected.select();
      setTimeout(() => {
        this.ddCustomer_Onchange(null);
      }, 500);
    }, 1000);
    let cnt = this._cooDashboardCommon.userProjects.length;
    setTimeout(() => {
      this.loadData();
    }, cnt * 10);
  }
  LoadCustomerProjectsByEmpId() {
    let projects = localStorage.getItem('projIds');
    if (projects == null || projects == undefined) {
      this._appservice.GetCustomerProjectsList(localStorage.getItem('empid')).subscribe(data => {
        this.BindCustomerProjects(data);
      }, error => { this._util.serviceError(error); });
    }
    else {
      this._appservice.GetCustomerProjectListForProjIds(projects).subscribe(data => {
        this.BindCustomerProjects(data);
      }, error => { this._util.serviceError(error); });
    }
  }
  onCustomerKey(value) {
    this.customer = this.SearchCust(value);
  }
  SearchCust(value: string) {
    let filter = value.toLowerCase();
    let customerList = this._cooDashboardCommon.getUniqueCustIdNameFromList(this._cooDashboardCommon.customerProjectsList, "cusT_ID", "cusT_NM");
    return customerList.filter(option =>
      option.cusT_NM.toLowerCase().startsWith(filter)
    );
  }

  onProjectKey(value) {
    this.project = this.SearchProject(value);
  }
  SearchProject(value: string): any {
    let filter = value.toLowerCase();
    let projList = this._cooDashboardCommon.getUniqueProjIdNameFromList(this._cooDashboardCommon.customerProjectsList, "proJ_ID", "proJ_NM");
    return projList.filter(option =>
      option.proJ_NM.toLowerCase().startsWith(filter)
    );
  }

  LoadCustomer(allcust: boolean) {
    this._appservice.GetRASCustomerList().subscribe(data => {
      this.customer = data;
      setTimeout(() => {
        if (this.allCustSelected != undefined && this.allCustSelected != null)
          this.allCustSelected.select();
      }, 1000);
      setTimeout(() => {
        this.ddCustomer_Onchange(null);
      }, 500);
    }, error => { this._util.serviceError(error); });
  }
  LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customer = data;
      this._cooDashboardCommon.customersList = data;
      setTimeout(() => {
        if (this.allCustSelected != undefined && this.allCustSelected != null)
          this.allCustSelected.select();
      }, 1000);
      setTimeout(() => {
        this.ddCustomer_Onchange(null);
      }, 500);
    }, error => { this._util.serviceError(error); });
  }

  LoadProject() {
    setTimeout(() => {

      if (!this.isProjsLoaded) {
        this.isProjsLoaded = true;
        if (this._cooDashboardCommon.customerProjectsList != null && this._cooDashboardCommon.customerProjectsList.length > 0) {
          // this.project = this._cooDashboardCommon.getUniqueProjIdNameFromList(p, "proJ_ID", "proJ_NM").sort((n1, n2) => { return n1.proJ_NM.toLowerCase() > n2.proJ_NM.toLowerCase() ? 1 : -1 });;
          this.projects = this._cooDashboardCommon.getUniqueProject(this.custId);
          this.project = this.projects;//.map(x => x.proJ_ID);//.filter(x => this.custId.includes(x.cusT_ID));
          // this.selectallProjects();        // setTimeout(() => {
        }
      } else {
        //  this.selectallProjects();
      }
    },this._cooDashboardCommon.customerProjectsList.length);
 
  }
  emitChanges() {
    let str: CustomerProjectIds = new CustomerProjectIds();
    str.customer = this.searchUserForm.controls.custNames.value;
    str.project = this.searchUserForm.controls.userType.value
    str.rowId = this.rowId;
    this.onChange.emit(str);
  }
  ddCustomer_Onchange(event) {
    this._shared.AllAccounts = false;
    this.LoadProject();
    this.isLoaded = false;
    this._shared.selectedCustIDarray = this.custId;
  }
  customer_Onchange(event) {
    this.custId = event; this.isProjsLoaded = false; this.isLoaded = false;
    this._cooDashboardCommon.custIds = event;
    this.ddCustomer_Onchange(event);
  }
  project_onChange(event) {
    this._cooDashboardCommon.projectIds = event;
 
   
  }

  toggleAllSelection() {
    if (this.allSelected != undefined && this.allSelected != null && this.allSelected.selected) {
      //  this.selectallProjects();
    } else {
      this.projectSelect.options.forEach((item: MatOption) => item.deselect());
    }
    this.emitChanges()
  }
  toggleAllCustomerSelection() {
    this.isProjsLoaded = false;
    this._shared.AllAccounts = false;
    if (this.allCustSelected != undefined && this.allCustSelected != null && this.allCustSelected.selected) {
      this._shared.AllAccounts = true;
      this.ddCustomer.options.forEach((item: MatOption) => item.select());
    } else {
      this.ddCustomer.options.forEach((item: MatOption) => item.deselect());
      this.project = [];
    }
    this.emitChanges();
  }
  getCustomerList(empId) {
    this._appservice.GetCustomerList(empId, false).subscribe(data => {
      this.customers = data;

      if (this.customers.length > 0) {
        this.getProjects();
        this.selectedCust = "-1";
        this._shared.selectedCustIDarray = this.custId;
      }

    }, (err) => {this._util.serviceError(err) })
  }

  getProjects() {
    if (this.selectedCust == null || this.selectedCust == undefined)
      return;

    this.subscription = this._appservice.getAllProjectsForCustomer(this.selectedCust).subscribe(data => {
      this.projects = data;
      this.selectedProj = this.projects.map(p => p.proJ_ID);
      if (this.selectedProj.length == this.projects.length)
        this.selectedProj.push('-1');
      this.customerId = this.selectedCust;
      this.projId = this.selectedProj
      this.loading = true;
    }, (err) => { this._util.serviceError(err) })
  }
  tosslePerOne() {
    if (this.allSelected != undefined && this.allSelected != null) {
      if (this.allSelected.selected) {
        this.allSelected.deselect();
        return false;
      }
    }
    if (this.allCustSelected != undefined && this.allCustSelected != null) {
      if (this.allCustSelected.selected) {
        this.allCustSelected.deselect();
        return false;
      }

      this._shared.AllAccounts = false;
      if (this.allCustSelected.selected) {
        this._shared.AllAccounts = true;
      }
    }
  }
  tosslePerOneCust() {
    this.isProjsLoaded = false;
    if (this.allCustSelected != undefined && this.allCustSelected != null && this.allCustSelected.selected) {
      this.allCustSelected.deselect();
      return false;
    }
  }
  isInputsValid() {
    if (!(this._cooDashboardCommon.custIds != null && this._cooDashboardCommon.custIds != undefined && this._cooDashboardCommon.custIds.length > 0 && !(this._cooDashboardCommon.custIds.length == 1 && this._cooDashboardCommon.custIds[0] == "-1"))) {
      alert("please select customers");
      return false;
    }
    if (!(this._cooDashboardCommon.projectIds != null && this._cooDashboardCommon.projectIds != undefined && this._cooDashboardCommon.projectIds.length > 0 && !(this._cooDashboardCommon.projectIds.length == 1 && this._cooDashboardCommon.projectIds[0] == "-1"))) {
      alert("please select projects");
      return false;
    }
    return true;
  }
  loadData() {
    this._overallStatusPage1Component.Year = this.Year;
    let data = this._cooDashboardCommon.LoadParams();

    let qtr;
    if (this._cooDashboardCommon.ViewId == 5) {
      qtr = this._util.getQuarter(this.Month);
    }
    else if (this._cooDashboardCommon.ViewId == 3) {
      qtr = "YT";
    }
    else if (this._cooDashboardCommon.ViewId == 1) {
      qtr = "Q" + this.QiD;
    }
    else {
      this._shared.SelectedQuarter = 1;
      qtr = "Q" + this._shared.SelectedQuarter;
    }
    this._cooDashboardCommon.selectedQPeriodCss = qtr;
    this._cooDashboardCommon.selectedQPeriodCsg = qtr;
    this._overallStatusPage1Component.getEarlyWarningSignalCount();
    this._overallStatusPage1Component.getAccountOverallHealth();
    this._overallStatusPage1Component.getKPIPerspectives(data.START_DATE, data.END_DATE);
    this._overallStatusPage1Component.getCustomerSuccessSurvey(data.START_DATE, data.END_DATE);
    this._cooDashboardCommon.LoadRiskDashboard(this._cooDashboardCommon.riskStatus, this._cooDashboardCommon.businessUnit);
    this._cooDashboardCommon.loadCSATInsightsInputs(this._cooDashboardCommon.csmIds);
  }
  Apply() {
    if (this.isInputsValid()) {
      this.loadData();
    }
  }
  Reset() {
    this.reset = true;
    this.isLoaded = false;
    this.customer = [];
    this.searchCustVal = "";
    this.searchProjVal = "";
    this.customer = this._cooDashboardCommon.getUniqueCustomer();
    this.project = this._cooDashboardCommon.getUniqueProject(this._cooDashboardCommon.custIds);
    this._cooDashboardCommon.ViewId = 5;
    this.getCurrentMonth();
    setTimeout(() => {
      this.loadData();
    }, 2000);
  }

  ddMonth_OnChange(event) {
    const startDate = new Date(this.Year, this.Month - 1, 1);
    const nextMonth = this.Month === 12 ? 1 : this.Month + 1;
    const nextYear = this.Month === 12 ? this.Year + 1 : this.Year;
    const endDate = new Date(nextYear, nextMonth - 1, 0);
    this._cooDashboardCommon.dashboardStartdate = startDate;
    this._cooDashboardCommon.dashboardEnddate = endDate;
  }

  ddQuarter_Onchange(event) {
    this._shared.SelectedQuarter = this.QiD;
    if (this.QiD == 1) {
      this._cooDashboardCommon.dashboardStartdate = new Date("04/01/" + this.Year);
      this._cooDashboardCommon.dashboardEnddate = new Date("06/30/" + this.Year);
    } else if (this.QiD == 2) {
      this._cooDashboardCommon.dashboardStartdate = new Date("07/01/" + this.Year);
      this._cooDashboardCommon.dashboardEnddate = new Date("09/30/" + this.Year);
    }
    else if (this.QiD == 3) {
      this._cooDashboardCommon.dashboardStartdate = new Date("10/01/" + this.Year);
      this._cooDashboardCommon.dashboardEnddate = new Date("12/31/" + this.Year);
    }
    else if (this.QiD == 4) {
      this._cooDashboardCommon.dashboardStartdate = new Date("01/01/" + (this.Year + 1));
      this._cooDashboardCommon.dashboardEnddate = new Date("03/31/" + (this.Year + 1));
    }
  }

  ddView_Onchange(event) {
    if (this._cooDashboardCommon.ViewId == 3) {
      this._cooDashboardCommon.dashboardStartdate = new Date("04/01/" + (this.Year));
      this._cooDashboardCommon.dashboardEnddate = new Date("03/31/" + (this.Year + 1));
    }
    else if (this._cooDashboardCommon.ViewId == 2) {
      this._cooDashboardCommon.dashboardStartdate = new Date("1/04/" + this.Year);
      this._cooDashboardCommon.dashboardEnddate = new Date("30/09/" + (this.Year + 1));
    }
    else if (this._cooDashboardCommon.ViewId == 1) {
      this.ddQuarter_Onchange(event);
    }
    else if (this._cooDashboardCommon.ViewId == 5) {
      this.ddMonth_OnChange(event);
    }
  }

  ddYear_Onchange(event) {
    this._shared.SelectedYear = this.Year;
    this.ddView_Onchange(event);
  }
  getCurrentQuarter() {
    this.QiD = this._util.getCurrentQuarter();
    this._shared.SelectedQuarter = this.QiD;
    this._cooDashboardCommon.currentQuarter = this.QiD; 
  }
  getCurrentMonth() {
    var today = new Date();
    this.Month = today.getMonth();

    if (this.Month == 0) {
      this.Month = 12;
      this.Year = today.getFullYear() - 1;
    }
    else {
      this.Year = today.getFullYear();
    }
  }
}


