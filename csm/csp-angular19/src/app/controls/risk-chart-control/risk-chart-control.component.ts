import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { RiskModel } from '../../shared/models/risk.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { enumRoles } from '../../shared/enum';
import { AccessControl } from '../../shared/access-control';
import { RiskDetailsComponent } from '../risk-details/risk-details.component';

// Model class definition
export class riskDashboardInputsModel {
  customeR_IDS: string = "";
  StarT_DATE: Date = new Date();
  enD_DATE: Date = new Date();
  businesS_UNITS: string = "";
  risK_STATUS: string = "";
}

@Component({
  selector: 'app-risk-chart-control',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule
  ],
  templateUrl: './risk-chart-control.component.html',
  styleUrl: './risk-chart-control.component.scss'
})
export class RiskchartControlComponent implements OnInit, OnChanges {
  @Input() input: any;
  @Input() inputs!: riskDashboardInputsModel;
  @Input() isValid!: boolean;
  risk: RiskModel[] = [];
  overAllData: any;
  _loading: boolean = false;
  riskDashboardInputs!: riskDashboardInputsModel;

  constructor(public _util: MyUtility, public _serv: AppsService,
    public dialog: MatDialog,
    public _access: AccessControl) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this._util.riskSubject.subscribe((res: any) => {
      this.overAllData = res;
      this.callLoader();
    })
    this.riskDashboardInputs = this.inputs;
    this.loadData();
  }

  loadData() {
    if (this.riskDashboardInputs != null && this.isValid) {
      this._loading = true;
      this._util.GetRiskChart(this.riskDashboardInputs);
      this.callLoader();
    }
  }

  getvalue(row: number, col: number): any {
    if (this.overAllData == null || this.overAllData == undefined) {
      return "";
    }
    else {
      if (row == 0 || col == 0) {
        return "";
      }
      else if (this.overAllData.riskChart.data[row - 1][col - 1] === 0) {
        return "";
      }
      else {
        return this.overAllData.riskChart.data[row - 1][col - 1];
      }
    }
  }

  openDialog(probability: number, impact: number) {
    this.risk = this.overAllData.overallRisk;
    this.risk = this.risk.filter((x: any) => x.probabilitY_SCALE == probability && x.impacT_SCALE == impact);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "80vw";
    //dialogConfig.maxWidth = "80%";
    dialogConfig.height = "80%";
    dialogConfig.data = {
      risk: this.risk
    };
    this.dialog.open(RiskDetailsComponent, dialogConfig);
  }

  callLoader() {
    setTimeout(() => {
      this._loading = false;
    }, 2000);
  }

}
