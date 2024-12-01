import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more.src';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown.src';
import { QagoverancedashboardInputs } from '../../../models/qagoverancedashboard-inputs';
import { AccessControl } from '../../../Shared/accessControl';
Drilldown(Highcharts);
import { MatOption, MatSelect, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialogConfig, MatDialog } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ViewAssessmentFindingDetailsComponent } from './view-assessment-finding-details/view-assessment-finding-details.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-dashboard-assessment-findings',
  templateUrl: './dashboard-assessment-findings.component.html',
  styleUrls: ['./dashboard-assessment-findings.component.scss'],
  providers: [

    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class DashboardAssessmentFindingsComponent implements OnInit {
  ddyear: number[]
  selectedQuarter: string;
  selectedYear: number;
  trendQuarter: number = 1;
  customerId: string;
  customer: any = [];
  @Input("custId") custId: string;
  @Input("allCust") allCust: boolean = false;
  allAccountsExcepttop15Accounts: any;
  top15Accounts: any;
  findingsType: any;
  customerIds: string;
  _loading: boolean = false;
  dates: any[];
  fromDate: Date;
  toDate: Date;
  chart1: any;
  chart2: any;
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 15;
  min = 0;
  showTicks = false;
  step = 5;
  value = 0;
  vertical = false;
  stackLabels = true;
  assessmentFindingInputs: QagoverancedashboardInputs;
  assessmentFindingData: any;
  allGSLabAccounts: any;
  allGSLabKeyAccounts: any;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('select') select: MatSelect;
  customeR_IDS: any = [];
  @ViewChild('selectCustomer') selectCustomer: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected: MatOption;
  qualitySpocAccounts: any;
  resultData: any;


  constructor(public _util: myUtility, private _appService: AppsService, public _access: AccessControl, private dialog: MatDialog) { }
  Highcharts = Highcharts;


  ngOnInit() {


    if (this._access.IsAllowed(77, 1, '', '')) {
      this.allCust = true;
      this.customerId = "-1";
    }
    else {
      this.customerId = this.custId;
    }


    this.ddyear = this._util.Years(3);
    this.selectedYear = this._util.Year();
    this.trendQuarter = 1;
    //this.customerId = this.allCust ? -1 : Number(this.custId);

    this.selectedQuarter = "lastQuarter";
    //this.customeR_IDS.push(this.customerId.toString());
    this.getdatesForQuarter();
    this.getAccountsForUser();
    this.getFindingType();
    this.bindAssessmentFindingInputs();
  }



  bindAssessmentFindingInputs() {

    this.assessmentFindingInputs = new QagoverancedashboardInputs();
    this.assessmentFindingInputs.charT_TITLE = this.assessmentFindingInputs.charT_TITLE == undefined ? "" : this.assessmentFindingInputs.charT_TITLE;
    this.assessmentFindingInputs.xAxis = this.assessmentFindingInputs.xAxis == undefined ? "" : this.assessmentFindingInputs.xAxis;
    this.assessmentFindingInputs.yAxis = this.assessmentFindingInputs.yAxis == undefined ? "" : this.assessmentFindingInputs.yAxis;
    this.assessmentFindingInputs.findinG_STATUS = this.assessmentFindingInputs.findinG_STATUS == undefined ? "Open" : this.assessmentFindingInputs.findinG_STATUS;
    this.assessmentFindingInputs.findinG_TYPE = this.assessmentFindingInputs.findinG_TYPE == undefined ? ["Weakness", "Threat"] : this.assessmentFindingInputs.findinG_TYPE;
    this.assessmentFindingInputs.StarT_DATE = new Date(this.fromDate).toDateString();
    this.assessmentFindingInputs.enD_DATE = new Date(this.toDate).toDateString();
    this.assessmentFindingInputs.findinG_AGE = "-1";
  }



  getAccountsForUser() {
    var role = localStorage.getItem('role');
    this._loading = true;
    this._appService.getAccountsForCSATDashboard(this.allCust).subscribe(data => {
      this.resultData = data;
      if (this.resultData != undefined) {
        this.customer = this.resultData.customers;
        this.top15Accounts = this.resultData.allTop15Accounts;
        this.allAccountsExcepttop15Accounts = this.resultData.allAccountsExceptTop15Accounts;
        this.qualitySpocAccounts = this.resultData.allQASpocAccounts;
        this.allGSLabAccounts = this.resultData.allGSLabAccounts;
        this.allGSLabKeyAccounts = this.resultData.allGSLabKeyAccounts;
      }
      
      if (this.customer != undefined) {
        if (this.allCust) {
          this.customer.splice(0, 1);
          this.customeR_IDS = this.customer.map(x => x.cusT_ID);
          this.customeR_IDS.unshift("-1");
        }
        else {
          this.customeR_IDS = this.customer.map(x => x.cusT_ID);
          this.customeR_IDS.unshift("-1");
        }
      }
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  getFindingType() {
    this._loading = true;
    this._appService.getFindingTypeForAssessmentFindingsQADeck().subscribe(data => {
      this.findingsType = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  getAssessmentFindingChartData() {
    this._loading = true;
    this.assessmentFindingData = undefined;
    this._appService.getAssessmentFindingChartData(this.assessmentFindingInputs).subscribe(data => {
      this.assessmentFindingData = data;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  selectedPeriod_OnChange() {
    this._loading = true;
    if (this.selectedQuarter == "Select Period") {
      this.fromDate = null;
      this.toDate = null;
    }
    this.getdatesForQuarter();
    this.assessmentFindingInputs.customeR_IDS = this.getCustomerIds();
    this.assessmentFindingInputs.StarT_DATE = new Date(this.fromDate).toDateString();
    this.assessmentFindingInputs.enD_DATE = new Date(this.toDate).toDateString();
  }

  reset() {

    this._loading = true;
    this.trendQuarter = 1;
    this.selectedQuarter = "lastQuarter";
    if (this.allCust) {
      this.customerId = "-1";
    }
    else {
      this.customerId = this.custId;
    }
    this.getdatesForQuarter()
    this.assessmentFindingInputs.charT_TITLE = "";
    this.assessmentFindingInputs.xAxis = "";
    this.assessmentFindingInputs.yAxis = "";
    this.assessmentFindingInputs.findinG_STATUS = "Open";
    this.assessmentFindingInputs.findinG_TYPE = ["Weakness", "Threat"];
    this.assessmentFindingInputs.StarT_DATE = this.fromDate.toDateString();
    this.assessmentFindingInputs.enD_DATE = this.toDate.toDateString();
    this.assessmentFindingData = undefined;
  }

  getdatesForQuarter() {
    this.dates = this._util.getDatesBasedOnQuarter(this.selectedQuarter, this.selectedYear, this.trendQuarter, this.fromDate, this.toDate);
    this.fromDate = this.dates[0].fromDate;
    this.toDate = this.dates[0].toDate;
    this.selectedQuarter = this.selectedQuarter != "Select Period" ? this._util.getQuarter(this.toDate.getMonth() + 1) : this.selectedQuarter;
    this.selectedYear = this.selectedQuarter == "Q4" ? this.toDate.getFullYear() - 1 : this.toDate.getFullYear();
    this._loading = false;
  }

  loadData() {
    if (this.assessmentFindingInputs.charT_TITLE == "") {
      alert("Chart title should not be empty.");
      return;
    }
    if (this.assessmentFindingInputs.xAxis == "") {
      alert("Please select x axis");
      return;
    }
    if (this.assessmentFindingInputs.yAxis == "") {
      alert("Please select Y axis");
      return;
    }
    this.assessmentFindingInputs.customeR_IDS = this.getCustomerIds();
    this.assessmentFindingInputs.StarT_DATE = new Date(this.fromDate).toDateString();
    this.assessmentFindingInputs.enD_DATE = new Date(this.toDate).toDateString();
    this.getAssessmentFindingChartData();
  }

  toggleSelection() {
    if (this.allSelected.selected)
      this.select.options.forEach((item: MatOption) => item.select());
    else
      this.select.options.forEach((item: MatOption) => item.deselect());
  }
  tosslePerOne() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }

    let count = 0;

    this.select.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.findingsType.length == count)
      this.allSelected.select();
  }

  getCustomerIds() {
    let opCustomers: string = "";
    if (this.selectCustomer.value != undefined && this.selectCustomer.value.indexOf != undefined) {
      if (this.selectCustomer.value.indexOf("-1") != -1) {
        opCustomers += "-1" + this.selectCustomer.value.join(',');
      }
      else {
        if (this.selectCustomer.value.indexOf("-2") != -1) {
          if (this.qualitySpocAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.qualitySpocAccounts;
        }
        if (this.selectCustomer.value.indexOf("-3") != -1) {
          if (this.top15Accounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.top15Accounts;
        }
        if (this.selectCustomer.value.indexOf("-4") != -1) {
          if (this.allAccountsExcepttop15Accounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allAccountsExcepttop15Accounts;
        }
        if (this.selectCustomer.value.indexOf("-5") != -1) {
          if (this.allGSLabAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allGSLabAccounts;
        }
        if (this.selectCustomer.value.indexOf("-6") != -1) {
          if (this.allGSLabKeyAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allGSLabKeyAccounts;
        }
        opCustomers += (opCustomers != "" ? "," : "") + this.selectCustomer.value.join(',');
      }
    }
    else {
      if (this.customeR_IDS != undefined) {
        opCustomers = this.customeR_IDS.toString();
      }
    }
    return opCustomers;
  }

  ViewAssessmentFindingDetails() {

    //this.bindCSATInputs();
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'assessmentFindingInputs': this.assessmentFindingInputs
    }
    dialogRef.maxWidth = "70%";
    dialogRef.width = "70%";
    dialogRef.height = "auto";
    const dialog = this.dialog.open(ViewAssessmentFindingDetailsComponent, dialogRef);
    dialog.afterClosed().subscribe(res => {
      //this.assessmentFindingInputs = new QagoverancedashboardInputs();
    })
  }

  toggleSelectionForCustomer() {

    if (this.allCustomerSelected.selected)
      this.selectCustomer.options.forEach((item: MatOption) => item.select());
    else
      this.selectCustomer.options.forEach((item: MatOption) => item.deselect());

  }

  customerTosslePerOne() {
    if (this.allCustomerSelected.selected) {
      this.allCustomerSelected.deselect();
      return false;
    }

    let count = 0;

    this.selectCustomer.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.customer.length == count)
      this.allCustomerSelected.select();
  }

}
