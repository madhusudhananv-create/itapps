import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { LayoutService } from '../../layout/layout.service';
import { COODashboardService } from '../coo-dashboard.service';
import { MatDialog, MatDialogConfig, MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../models/portfolio-model';
import { riskDashboardInputsModel } from '../../../controls/risk-chart/risk-chart.component';
import { COODashboardCommon } from '../coo-dashboard-common';
import { SurveyService } from '../../survey/survey.service';
import { ViewCssDetailsComponent } from '../../dashboard/cssdashboard/view-css-details/view-css-details.component';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent implements OnInit {

  menuToggleStatus: boolean;
  selectedPeriod = 'asToday';
  selectedCust: string;
  selectedProj: any[] = [];
  selectedPortfolio: number[];
  empid: string;
  customerId: string;
  projId: string[];
  portId: number[];
  customers: any[] = [];
  projects: any[] = [];
  portfolioList: any[];
  projectList: any[] = [];
  portfolioprojectMap: ProjectModelNew[] = [];
  selectedDateType: string = "1";
  loading: boolean = false;
  @ViewChild('allSelected') allSelected: MatOption;
  @ViewChild('select') select: MatSelect;
  @ViewChild('allSelectedCSM') allSelectedCSM: MatOption;
  @ViewChild('selectCSM') selectCSM: MatSelect;
  isChecked: boolean = false;
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  CSMList: any[];
  allCust: Boolean = false;
  currIndex: number = 0;
  cssInputs: any;
  riskDashboardInputs: riskDashboardInputsModel;
  overallBusinessUnit: any;
  businessUnit: any;
  progress: boolean = false;
  @ViewChild('selectBusinessUnit') selectBusinessUnit: MatSelect;
  @ViewChild('allBusinessUnitSelected') allBusinessUnitSelected: MatOption;
  constructor(private _appservice: AppsService, private surveyService: SurveyService, public _coodashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility, private dialog: MatDialog) {

  }

  ngOnInit() {
    this.empid = localStorage.getItem('empid');
    this.service_GetCSMList();
    this.getOverallBusinessUnits();
    setTimeout(() => {
      this.riskReset(); this.CSATReset();
      // this.bindCSATInputs();
    }, 2000);    // this._cooDashboardCommon.heatMapData =JSON.parse(localStorage.getItem("heatMapData"));
  }
  service_GetCSMList() {
    this.surveyService.GetCSMListDistinct().subscribe(data => {
      this.CSMList = data;
    }, error => { this._util.serviceError(error); });
  }
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }
  riskApply() {
    this.riskDashboardInputs = this._cooDashboardCommon.loadRiskDashboardInputs(this._cooDashboardCommon.riskStatus, this._cooDashboardCommon.businessUnit);
  }
  riskReset() {
    this.allBusinessUnitSelected.select();
    this.allSelected.select();
    this.toggleSelection();
    this.riskDashboardInputs = this._cooDashboardCommon.loadRiskDashboardInputs(this._cooDashboardCommon.riskStatus, this._cooDashboardCommon.businessUnit);
  }
  CSATReset() {
    this.allSelectedCSM.select();
    this.toggleCSMSelection(null);
    this.CSATApply();
  }
  CSATApply() {
    if (this._cooDashboardCommon.csmIds.length > 0)
      this.bindCSATInputs();
    else {
      alert("Please choose any csm");
      return;
    }
    //this._cooDashboardCommon.heatMapData =JSON.parse(localStorage.getItem("heatMapData"));
  }

  selectedTabChange($event) {
    let clickedIndex = $event.index;
    if (clickedIndex == 1) { this._cooDashboardCommon.LoadRiskDashboard(); }
  }

  toggleSelection() {
    if (this.select != undefined && this.select.options != undefined) {
      if (this.allSelected.selected)
        this.select.options.forEach((item: MatOption) => item.select());
      else
        this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  toggleCSMSelection($event) {
    if (this.selectCSM != undefined && this.selectCSM.options != undefined) {
      if (this.allSelectedCSM.selected)
        this.selectCSM.options.forEach((item: MatOption) => item.select());
      else
        this.selectCSM.options.forEach((item: MatOption) => item.deselect());
    }
  }
  tosslePerOne($event?) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    let allSelect: Boolean = true;
    this.select.options.forEach(function (i) {
      if (!i.selected && i.value != -1)
        allSelect = false;
    });
    if (allSelect)
      this.allSelected.select();
    let count = 0;
    this.select.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
  }

  getOverallBusinessUnits() {
    this._appservice.getBusinessUnits().subscribe(data => {
      this.overallBusinessUnit = data;
      if (this.overallBusinessUnit.length > 0) {
        this.businessUnit = this.overallBusinessUnit.slice();
        this.businessUnit.unshift('-1');
      }
    }, error => { this._util.serviceError(error); })
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

  onPrev() {
    this.currIndex--;
    if (this.currIndex == 0) {
      //this.getCSATHeatmap1();
    }
  }
  onNext() {
    this.currIndex++;
  }
  bindCSATInputs() {
    this._cooDashboardCommon.loadCSATInsightsInputs(this._cooDashboardCommon.csmIds);
    //this._cooDashboardCommon.cssDashboardInputs = obj;
  }
  ViewCSSDetails() {
    // this.bindCSATInputs();
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'cssInputs': this._cooDashboardCommon.cssDashboardInputs
    }
    dialogRef.maxWidth = "80%";
    dialogRef.width = "80%";
    dialogRef.height = "80%";
    const dialog = this.dialog.open(ViewCssDetailsComponent, dialogRef);
    dialog.afterClosed().subscribe(res => {
      //this._cooDashboardCommon.cssDashboardInputs = new CssdashboardInputs();
    })
  }
  tosslePerOneCSM() {
    if (this.allSelectedCSM.selected) {
      this.allSelectedCSM.deselect();
      return false;
    }

    let allSelect: Boolean = true;
    this.selectCSM.options.forEach(function (i) {
      if (!i.selected && i.value != -1)
        allSelect = false;
    });
    if (allSelect)
      this.allSelectedCSM.select();
    let count = 0;
    this.selectCSM.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
  }
}


