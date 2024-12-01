import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { RiskModel } from '../../models/risk-model';
import { MatDialog, MatDialogConfig, MatOption, MatSelect } from '@angular/material';
import { RiskDetailsComponent } from '../risk-details/risk-details.component';
import { enumRoles } from '../../Shared/enum';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-risk-chart',
  templateUrl: './risk-chart.component.html',
  styleUrls: ['./risk-chart.component.scss']
})
export class RiskchartComponent implements OnInit {
  @Input() input: any;
  @Input("customerId") customerId: string;
  risk: any = [];
  customer: any;
  customerIds: string;
  _loading: boolean = false;
  allCust: boolean = false;
  projId: any;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('select') select: MatSelect;
  riskDashboardInputs: riskDashboardInputsModel;
  customeR_IDS: any = [];
  customeR_IDSAll: any = [];
  @ViewChild('selectCustomer') selectCustomer: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected: MatOption;
  @ViewChild('selectBusinessUnit') selectBusinessUnit: MatSelect;
  @ViewChild('allBusinessUnitSelected') allBusinessUnitSelected: MatOption;
  top15Accounts: any;
  allAccountsExcepttop15Accounts: any;
  date = new Date();
  fromDate: Date;
  toDate: Date;
  riskChartData: any = [];
  overallRisk: any = [];
  riskData: any;
  riskStatus: any;
  catastrophicCount: any;
  highCount: any;
  lowCount: any;
  moderateCount: any;
  public overAllData: any;
  isValid = true;
  allGSLabAccounts: any;
  allGSLabKeyAccounts: any;
  overallBusinessUnit: any;
  businessUnit: any;
  allBusinessUnits: any;
  qualitySpocAccounts: any;
  resultData: any;
  constructor(private route: ActivatedRoute, private _appservice: AppsService, public _util: myUtility, public dialog: MatDialog, public _access: AccessControl) { }

  ngOnInit() {

    if (this._access.IsAllowed(77, 1, '', '')) {
      this.allCust = true;
    }
    this.getAccountsForUser();
    this.getRiskStatus();
    this.getOverallBusinessUnits();
    //this.reset();
    // this._util.riskSubject.subscribe((res) => {
    //   this.overAllData = res;
    //   // this.riskChartData = res.riskChart.data;
    //   // this.overallRisk = res.overallRisk;
    //   // this.catastrophicCount = res.catastrophicCount;
    //   // this.highCount = res.highCount;
    //   // this.lowCount = res.lowCount;
    //   // this.moderateCount = res.moderateCount;
    //   this._loading = false;
    // })
  }

  getvalue(row, col) {
    if (row == 0 && col == 0)
      return "";
    if (this.riskChartData[row - 1][col - 1] === 0)
      return "";
    else
      return this.riskChartData[row - 1][col - 1];
  }

  loadData() {
    this.isValid = true;
    this.riskDashboardInputs = new riskDashboardInputsModel();
    this.riskDashboardInputs.customeR_IDS = this.getCustomerIds();
    this.riskDashboardInputs.StarT_DATE = (this.fromDate == null || this.fromDate == undefined) ? null : this._util.setLocaleDate(this.fromDate);
    this.riskDashboardInputs.enD_DATE = (this.toDate == null || this.toDate == undefined) ? null : this._util.setLocaleDate(this.toDate);
    this.riskDashboardInputs.businesS_UNITS = this.businessUnit.toString();
    this.riskDashboardInputs.risK_STATUS = this.riskStatus.toString();
    if (this.riskDashboardInputs.customeR_IDS == "" || this.riskDashboardInputs.customeR_IDS == undefined || this.riskDashboardInputs.customeR_IDS == null) {
      alert("Please choose any customer");
      this.isValid = false;
      return;
    }
    if (this.riskDashboardInputs.businesS_UNITS == "" || this.riskDashboardInputs.businesS_UNITS == undefined || this.riskDashboardInputs.businesS_UNITS == null) {
      alert("Please choose any business unit");
      this.isValid = false;
      return;
    }
    if (this.riskDashboardInputs.risK_STATUS == "" || this.riskDashboardInputs.risK_STATUS == undefined || this.riskDashboardInputs.risK_STATUS == null) {
      alert("Please choose any risk status");
      this.isValid = false;
      return;
    }
    if (this.riskDashboardInputs.StarT_DATE != null && this.riskDashboardInputs.StarT_DATE != undefined &&
      this.riskDashboardInputs.enD_DATE != null && this.riskDashboardInputs.enD_DATE != undefined) {
      if (this.riskDashboardInputs.StarT_DATE > this.riskDashboardInputs.enD_DATE) {
        alert("Please select To date greater than From date");
        this.isValid = false;
        return;
      }
    }
  }
  openDialog(probability, impact) {
    this.risk = this.overallRisk.filter(x => x.probabilitY_SCALE == probability && x.impacT_SCALE == impact);
    this.showRisk();
  }

  showRisk() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      risk: this.risk
    },
      dialogConfig.maxWidth = "80%"
    dialogConfig.height = "80%",
      dialogConfig.width = "80vw"
    const dialogRef = this.dialog.open(RiskDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getAccountsForUser() {
    this._loading = true;
    this._appservice.getAccountsForCSATDashboard(this.allCust).subscribe(data => {
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
      this.customeR_IDSAll = this.customeR_IDS;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
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

  getRiskStatus() {
    this.riskData = ["-1", "Identified", "Assessed", "Planned", "In-Process", "Occurred", "Not-Occurred", "Closed"];
    this.riskStatus = this.riskData;
    return this.riskStatus;
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
    if (this.riskData.length == count + 1)
      this.allSelected.select();
  }

  getOverallBusinessUnits() {
    this._loading = true;
    this._appservice.getBusinessUnits().subscribe(data => {
      this.overallBusinessUnit = data;
      if (this.overallBusinessUnit.length > 0) {
        this.businessUnit = this.overallBusinessUnit.slice();
        this.businessUnit.unshift('-1');
      }
      this.allBusinessUnits = this.businessUnit;
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }

  toggleSelectionForBusinessUnit() {
    if (this.allBusinessUnitSelected.selected)
      this.selectBusinessUnit.options.forEach((item: MatOption) => item.select());
    else
      this.selectBusinessUnit.options.forEach((item: MatOption) => item.deselect());
  }

  businessUnitTosslePerOne() {
    if (this.allBusinessUnitSelected.selected) {
      this.allBusinessUnitSelected.deselect();
      return false;
    }
    let count = 0;
    this.selectBusinessUnit.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.overallBusinessUnit.length == count)
      this.allBusinessUnitSelected.select();
  }

  reset() {
    this.customeR_IDS = this.customeR_IDSAll;
    this.riskStatus = this.getRiskStatus();
    this.businessUnit = this.allBusinessUnits;
    this.fromDate = undefined;
    this.toDate = undefined;
    this.riskDashboardInputs = new riskDashboardInputsModel();
    this.riskDashboardInputs.customeR_IDS = this.customeR_IDS.join(",");
    this.riskDashboardInputs.StarT_DATE = null;
    this.riskDashboardInputs.enD_DATE = null;
    this.riskDashboardInputs.risK_STATUS = this.riskStatus.toString();
    this.riskDashboardInputs.businesS_UNITS = this.businessUnit.toString();
    this.isValid = true;
  }

}

export class riskDashboardInputsModel {
  customeR_IDS: string;
  StarT_DATE: Date;
  enD_DATE: Date;
  businesS_UNITS: string;
  risK_STATUS: string;
}