import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';
import { RiskModel } from '../../models/risk-model';
import { MatDialog, MatDialogConfig, MatOption, MatSelect } from '@angular/material';
import { RiskDetailsComponent } from '../risk-details/risk-details.component';
import { enumRoles } from '../../Shared/enum';
import { AccessControl } from '../../Shared/accessControl';
import { riskDashboardInputsModel } from '../risk-chart/risk-chart.component';

@Component({
  selector: 'app-risk-chart-control',
  templateUrl: './risk-chart-control.component.html',
  styleUrls: ['./risk-chart-control.component.scss']
})
export class RiskchartControlComponent implements OnInit {
  @Input() input: any;
  @Input("inputs") riskDashboardInputs: riskDashboardInputsModel;
  @Input("isValid") isValid = true;
  risk: any = [];
  customer: any = []
  customerIds: string;
  _loading: boolean = false;
  allCust: boolean = false;
  projId: any; 
  customeR_IDS: any = []; 
  top15Accounts: any;
  allAccountsExcepttop15Accounts: any;
  date = new Date();
  fromDate: Date;
  toDate: Date;
  overallRisk: any = [];
  riskStatus: any;
  catastrophicCount: any;
  highCount: any;
  lowCount: any;
  moderateCount: any;
  overAllData: any;
  constructor(private route: ActivatedRoute, private _appservice: AppsService, public _util: myUtility, public dialog: MatDialog, public _access: AccessControl) { }

  ngOnInit() {
 
  }

  callLoader() {
    setTimeout(() => {
      this.loader();
    }, 2000);
  }
  loader() {
    this._loading = false;
  }

  getvalue(row, col) {
    if ((row == 0 && col == 0))
      return "";
    if (this.overAllData != null && this.overAllData != undefined && this.overAllData.riskChart != null && this.overAllData.riskChart != undefined) {
      if (this.overAllData.riskChart.data[row - 1][col - 1] === 0)
        return "";
      else
        return this.overAllData.riskChart.data[row - 1][col - 1];
    }
    else {
      return "";
    }
  }
  openDialog(probability, impact) {
    this.risk = this.overAllData.overallRisk.filter(x => x.probabilitY_SCALE == probability && x.impacT_SCALE == impact);
    this.showRisk();
  }
  ngOnChanges() {
    this._util.riskSubject.subscribe((res) => {
      this.overAllData = res;
      this.callLoader();
    });
    this.loadData();
  }
  loadData() {
    if (this.riskDashboardInputs != null && this.riskDashboardInputs != undefined && this.isValid) {
      this._loading = true;
      this._util.GetRiskChart(this.riskDashboardInputs);
      this.callLoader();
    }
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
} 