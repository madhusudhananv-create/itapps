import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { KpiGoalModel } from '../../../models/kpi-goal-model';
import { kpi } from '../../../models/kpi';
import { kpidetails } from '../../../models/kpi-details';
import { forEach } from '@angular/router/src/utils/collection';
import { variable } from '@angular/compiler/src/output/output_ast';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { isNumeric } from 'rxjs/internal/util/isNumeric';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { KpiActionPlanComponent } from '../kpi-action-plan/kpi-action-plan.component';
import { KpiProductDetailViewComponent } from '../kpi-product-view/kpi-product-detail-view/kpi-product-detail-view.component';


export interface DialogData {
  isNotApplicable: Boolean;
  highlights: string;
  showApprovedMsg: Boolean;
  showComments: Boolean;
  showRejectedMsg: Boolean;
}
@Component({
  selector: 'app-kpi-details',
  templateUrl: './kpi-details.component.html',
  styleUrls: ['./kpi-details.component.scss']
})
export class KpiDetailsComponent implements OnInit {
  @Input('custId') custId: string;
  @Input('projId') projId: string;
  @Input('tabIndex') tabChange: Boolean;
  detailmonthly = [];
  weeklydate: Date;
  firstdate: Date;
  lastdate: Date;
  ind: number = 0;
  detailweekly: any;
  actual_period: Date;

  details: kpidetails[] = [];
  detail: kpidetails = new kpidetails();


  _loading: boolean = false;

  month = [];
  kpiColor: any;
  colorCode: any[];
  additionalData: any;
  kpiDetailsData: any[];
  findingStatus: any;
  currentDate: Date = new Date();
  disableKPIEdit : boolean= false;

  constructor(public _util: myUtility, private _appservice: AppsService, public dialog: MatDialog

  ) { }

  ngOnInit() {
    if (this.tabChange)
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this.LoadData();
  }
  ngOnChanges() {
    if (this.tabChange)
      this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this.detail = new kpidetails();
    this.LoadData();
  }

  LoadData() {
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    this.checkDateRestriction(d);
    if (this.projId != undefined) {
      this.detailmonthly = undefined;
      this._loading = true;
      this._appservice.getKPIDetailsMonthlyandWeekly(this.custId, this.projId, d).subscribe(data => {
        this.detailmonthly = data;
        this.getColorforKPIDetails(this.detailmonthly)
        this.loadAdditionalData(this.detailmonthly)
        this.ShowMonthTable();
        this.ShowWeeklyTable();
        this.ShowQuarterlyTable();
        this.setWeekDates();
        this._loading = false;
      },
        error => {
          this._loading = false;
          this._util.serviceError(error);
        });
    }
  }

  getColorforKPIDetails(detailmonthly) {
    this.detailmonthly = detailmonthly;
    this.detailmonthly.forEach(i => {
      i.kpI_Month.forEach(j => {
        j.monthly.forEach((k, index) => {
          k.colorCode = j.colorCode[index];
        });
      });
      i.kpI_Quaterly.forEach(j => {
        j.quarterly.forEach((k, index) => {
          k.colorCode = j.colorCode[index];
        });
      });
      i.kpI_week.forEach(j => {
        const weeks = [j.week1, j.week2, j.week3, j.week4, j.week5];
        weeks.forEach((week, index) => {
          week.forEach(k => {
            k.colorCode = j.colorCode[index];
          });
        });
      });
    });
  }

  loadAdditionalData(detailmonthly) {
    this._loading = true;
    this._appservice.getKpiAdditionalData(detailmonthly).subscribe(data => {
      this.additionalData = data;
      for (var i = 0; i < data.length; i++) {
        this.getKpiData(data[i].kpI_ID);
      }
      this._loading = false;
    },
      error => {
        this._loading = false;
        this._util.serviceError(error);
      });
  }


  reloadMonthlyKPITable() {
    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    this.month = this._util.getmonthsBasedonYear(this._util.tableYear);
    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    this.checkDateRestriction(d);
    if (this.projId != undefined) {
      this.detailmonthly = undefined;
      this._loading = true;
      this._appservice.getKPIDetailsMonthlyandWeekly(this.custId, this.projId, d).subscribe(data => {
        this.detailmonthly = data;
        this.getColorforKPIDetails(this.detailmonthly);
        this.loadAdditionalData(this.detailmonthly);
        this.ShowMonthTable();
        this.ShowWeeklyTable();
        this.ShowQuarterlyTable();
        this.setWeekDates();
        this._loading = false;
      }, error => {
        this._loading = false;
        this._util.serviceError(error);
      });
    }
  }

  ViewCAPA(kpiId, periodType, kpiActual) {
    this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
    let kpiDetails = this.additionalData.filter(x => x.kpI_ID == kpiId && x.perioD_TYPE == periodType)[0];
    let kpiData = this.detailmonthly;
    let date: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'editedRow': kpiDetails,
      'kpiData': kpiData,
      'selectedPeriod': date
    }
    dialogRef.maxWidth = "100%";
    dialogRef.width = "99%";
    dialogRef.height = "70%";
    const dialog = this.dialog.open(KpiActionPlanComponent, dialogRef);

    dialog.afterClosed().subscribe(res => {
      let keys = "capaforKPI" + kpiDetails;

      if (res != null && res != undefined && res.data != null && res.data != undefined) {
        this.additionalData.filter(x => x.kpI_ID == kpiId && x.perioD_TYPE == periodType)[0].capaStage = res.data;
      }
      else {
        res = localStorage.getItem(keys);
        if (res != undefined && res != null) {
          this.additionalData.filter(x => x.kpI_ID == kpiId && x.perioD_TYPE == periodType)[0].capaStage = JSON.parse(res);
        }
      }
      this.getKpiData(kpiId);
      localStorage.removeItem(keys);
    })
  }

  WeekDates = [];
  setWeekDates() {
    if (this.detailmonthly != undefined)
      for (var i = 0; i < this.detailmonthly.length; i++) {
        if (this.detailmonthly[i].kpI_week.length > 0) {
          this.WeekDates = this.detailmonthly[i].kpI_week
          return
        }
      }
  }
 

  checkDateRestriction(d) {
    const reportDate = new Date(d); 
    const currentMonth = reportDate.getMonth();
    const currentYear = reportDate.getFullYear();
    const endOfNextMonth = new Date(currentYear, currentMonth + 2, 0); 
    // if (this.currentDate >= reportDate && this.currentDate <= endOfNextMonth) {
    //   this.disableKPIEdit = false;
    // } else {
    //   this.disableKPIEdit = true;
    // }    
  }

  getWeekly() {
    if (this.detailmonthly != undefined)
      return this.detailmonthly.filter(t => t.frequency === "Weekly");
  }
  getMonthly() {
    if (this.detailmonthly != undefined)
      return this.detailmonthly.filter(t => t.frequency === "Monthly");
  }

  SaveDetails(detailedit) {

    let week1: Date;
    let week2: Date;
    let week3: Date;
    let week4: Date;
    let week5: Date;

    let kpiActualEmpty: number = 0;

    if (this.WeekDates != undefined && this.WeekDates.length > 0) {
      week1 = this._util.setLocaleDate(this.WeekDates[0].week1[0].period);
      week2 = this._util.setLocaleDate(this.WeekDates[0].week2[0].period);
      week3 = this._util.setLocaleDate(this.WeekDates[0].week3[0].period);
      week4 = this._util.setLocaleDate(this.WeekDates[0].week4[0].period);
      week5 = this._util.setLocaleDate(this.WeekDates[0].week5[0].period);
    }

    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    let slaData = this.additionalData.filter(x => x.slA_STATUS == null);
    if (slaData.length == this.additionalData.length) {
      alert("Please fill any KPI actual to save the data.");
      return false;
    }

    let actualNotMet = this.additionalData.filter(x => x.kpI_ACTUAL != null && x.slA_STATUS == "Not Met");
    if (actualNotMet.length > 0) {
      for (var i = 0; i < actualNotMet.length; i++) {
        if (actualNotMet[i].capaStage.capA_SUBMISSION != null && actualNotMet[i].capaStage.capA_SUBMISSION.capa != null &&
          actualNotMet[i].capaStage.capA_SUBMISSION.capa.length == 0) {
          this.additionalData.filter(x => x.kpI_ID == actualNotMet[i].kpI_ID)[0].iS_NOT_FILLED = true;
          alert('Please fill Corrective Action Plan for the Actual values where expected target was not met.');
          return false;
        }
      }
    }

    for (var i = 0; i < detailedit.length; i++) {
      for (var i = 0; i < detailedit.length; i++) {
        for (var j = 0; j < detailedit[i].kpI_Month.length; j++) {
          for (var k = 0; k < detailedit[i].kpI_Month[j].monthly.length; k++) {
            detailedit[i].kpI_Month[j].monthly[k].period = d;
            if (detailedit[i].kpI_Month[j].monthly[k].kpI_ACTUAL != "" && detailedit[i].kpI_Month[j].monthly[k].kpI_ACTUAL != undefined) {
              var isNumber = isNumeric(detailedit[i].kpI_Month[j].monthly[k].kpI_ACTUAL);
              if (isNumber == false) {
                alert('Please enter only numbers');
                return
              }
            }
            if (detailedit[i].kpI_Month[j].monthly[k].kpI_ACTUAL == "") {
              kpiActualEmpty++;
            }

          }
        }
      }
      for (var i = 0; i < detailedit.length; i++) {
        for (var j = 0; j < detailedit[i].kpI_week.length; j++) {
          for (var k = 0; k < detailedit[i].kpI_week[j].week1.length; k++) {
            detailedit[i].kpI_week[j].week1[k].period = week1;
            if (detailedit[i].kpI_week[j].week1[k].kpI_ACTUAL != "" && detailedit[i].kpI_week[j].week1[k].kpI_ACTUAL != undefined) {
              var isNumber = isNumeric(detailedit[i].kpI_week[j].week1[k].kpI_ACTUAL);
              if (isNumber == false) {
                alert('Please enter only numbers');
                return
              }
            }

            if (detailedit[i].kpI_week[j].week1[k].kpI_ACTUAL == "") {
              kpiActualEmpty++;
            }
          }
          for (var k = 0; k < detailedit[i].kpI_week[j].week2.length; k++) {
            detailedit[i].kpI_week[j].week2[k].period = week2;
            if (detailedit[i].kpI_week[j].week2[k].kpI_ACTUAL != "" && detailedit[i].kpI_week[j].week2[k].kpI_ACTUAL != undefined) {
              var isNumber = isNumeric(detailedit[i].kpI_week[j].week2[k].kpI_ACTUAL);
              if (isNumber == false) {
                alert('Please enter only numbers');
                return
              }
            }
            if (detailedit[i].kpI_week[j].week2[k].kpI_ACTUAL == "") {
              kpiActualEmpty++;
            }
          }
          for (var k = 0; k < detailedit[i].kpI_week[j].week3.length; k++) {
            detailedit[i].kpI_week[j].week3[k].period = week3;
            if (detailedit[i].kpI_week[j].week3[k].kpI_ACTUAL != "" && detailedit[i].kpI_week[j].week3[k].kpI_ACTUAL != undefined) {
              var isNumber = isNumeric(detailedit[i].kpI_week[j].week3[k].kpI_ACTUAL);
              if (isNumber == false) {
                alert('Please enter only numbers');
                return
              }
            }
            if (detailedit[i].kpI_week[j].week3[k].kpI_ACTUAL == "") {
              kpiActualEmpty++;
            }
          }
          for (var k = 0; k < detailedit[i].kpI_week[j].week4.length; k++) {
            detailedit[i].kpI_week[j].week4[k].period = week4;
            if (detailedit[i].kpI_week[j].week4[k].kpI_ACTUAL != "" && detailedit[i].kpI_week[j].week4[k].kpI_ACTUAL != undefined) {
              var isNumber = isNumeric(detailedit[i].kpI_week[j].week4[k].kpI_ACTUAL);
              if (isNumber == false) {
                alert('Please enter only numbers');
                return
              }
            }
            if (detailedit[i].kpI_week[j].week4[k].kpI_ACTUAL == "") {
              kpiActualEmpty++;
            }
          }
          for (var k = 0; k < detailedit[i].kpI_week[j].week5.length; k++) {
            detailedit[i].kpI_week[j].week5[k].period = week5;
            if (detailedit[i].kpI_week[j].week5[k].kpI_ACTUAL != "" && detailedit[i].kpI_week[j].week5[k].kpI_ACTUAL != undefined) {
              var isNumber = isNumeric(detailedit[i].kpI_week[j].week5[k].kpI_ACTUAL);
              if (isNumber == false) {
                alert('Please enter only numbers');
                return
              }
            }
            if (detailedit[i].kpI_week[j].week5[k].kpI_ACTUAL == "") {
              kpiActualEmpty++;
            }
          }
        }
      }
    }

    if (kpiActualEmpty > 0)      // Just showing the Warning msg.We does not restrict anything here.
    {
      alert("KPI Achievements / Actuals not updated for all the KPI(s), please update the same to reflect the Project's KPI achievements in the dashboard.");
    }
    this.service_addKpiDetails(detailedit);
    kpiActualEmpty = 0 // reset the value 
  }

  getSLAStatus(kpiActual: any, kpiId: any) {
    var isNumber = isNumeric(kpiActual);
    if (isNumber == false) {
      alert('Please enter only numbers');
      return false;
    }
    this._appservice.getColorforKPI(kpiActual, kpiId).subscribe(data => {
      this.kpiColor = data;
      this.detailmonthly.forEach((i: any) => {
        i.kpI_Quaterly.forEach((j: any) => {
          j.quarterly.forEach((k: any) => {
            if (k.kpI_ID == kpiId) {
              k.kpI_ACTUAL = kpiActual;
              k.colorCode = this.kpiColor;
              k.slA_STATUS = this.getSLAStatusBasedOnColor(this.kpiColor);
              this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
              this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS = k.slA_STATUS;
            }
          });
        });
        i.kpI_Month.forEach((j: any) => {
          j.monthly.forEach((k: any) => {
            if (k.kpI_ID == kpiId) {
              k.kpI_ACTUAL = kpiActual;
              k.colorCode = this.kpiColor;
              k.slA_STATUS = this.getSLAStatusBasedOnColor(this.kpiColor);
              this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
              this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS = k.slA_STATUS;
            }
          });
        });
        i.kpI_week.forEach((j: any) => {
          const weeks = [j.week1, j.week2, j.week3, j.week4, j.week5];
          weeks.forEach((week: any) => {
            week.forEach((k: any) => {
              if (k.kpI_ID == kpiId) {
                k.kpI_ACTUAL = kpiActual;
                k.colorCode = this.kpiColor;
                k.slA_STATUS = this.getSLAStatusBasedOnColor(this.kpiColor);
                this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
                this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS = k.slA_STATUS;
              }
            });
          });
        });
      });
    }, error => {
      this._util.serviceError(error);
    });
  }

  getSLAStatusBasedOnColor(color) {
    if (color == '#f60000' || color == '#f9a400') {
      return 'Not Met';
    } else {
      return 'Met';
    }
  }

  formreset(detailsForm) {
    this.detail = new kpidetails();
    //detailsForm.reset();
  }

  ShowMonthTable() {
    if (this.detailmonthly != undefined)
      for (var i = 0; i < this.detailmonthly.length; i++) {
        if (this.detailmonthly[i].kpI_Month.length > 0)
          return true;
      }

    return false;
  }

  ShowQuarterlyTable() {
    if (this.detailmonthly != undefined)
      for (var i = 0; i < this.detailmonthly.length; i++) {
        if (this.detailmonthly[i].kpI_Quaterly.length > 0)
          return true;
      }

    return false;
  }
  ShowWeeklyTable() {
    if (this.detailmonthly != undefined)
      for (var i = 0; i < this.detailmonthly.length; i++) {
        if (this.detailmonthly[i].kpI_week.length > 0)
          return true;
      }
    return false;
  }

  freez: boolean = false;
  service_addKpiDetails(_detail) {
    this.freez = true;
    this._loading = true;
    this._appservice.AddKpiDetails(_detail).subscribe(data => {
      this.freez = false;
      alert("Added Successfully.");
      this._loading = false;
      this.LoadData();
    }, error => {
      this.freez = false;
      this._loading = false;
      this._util.serviceError(error);
    });
  }

  openDialog(l): void {
    const dialogRef = this.dialog.open(KPIDetailsPopUp, {
      width: '250px',
      data: { isNotApplicable: l.isflag, highlights: l.highlights }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && (result.highlights != null && result.highlights != undefined &&
        result.highlights != '' && result.isNotApplicable)) {
        l.slA_STATUS = 'NA';
        l.isflag = result.isNotApplicable;
        l.highlights = result.highlights;
      }
      else if (!result.isNotApplicable) {
        l.slA_STATUS = '';
        l.isflag = result.isNotApplicable;
        l.highlights = '';
      }
    });
  }

  enterBaseMeasure(kpiId): void {
    let baseMeasures = []; var slaStatus: any; let isNA: any;
    baseMeasures = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList;
    slaStatus = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS;
    if (slaStatus == "NA") {
      isNA = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].isflag;
    }
    let remarks = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].highlights;
    let kpiActual = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
    let detailId = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].id;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'kpiId': kpiId,
      'baseMeasureData': baseMeasures,
      'remarks': remarks,
      'isNA': isNA,
      'kpiActual': kpiActual,
      'month': this._util.tableMonth,
      'year': this._util.tableYear,
      'detailId': detailId,
      'custId': this.custId,
      'enableExclusion': false
    }

    dialogConfig.maxWidth = "60%";
    dialogConfig.width = "60%";
    const dialogRef = this.dialog.open(KpiProductDetailViewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result.data != undefined && result.data != null && result.data != '' && (result.data.kpI_ACTUAL != undefined || result.data.kpI_ACTUAL != null)) {
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = result.data.kpI_ACTUAL;
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].remarks = null;
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].iS_NOT_APPLICABLE = 0;
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList = result.data.kpiData;
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].capaStage = result.data[0] ? null : this.additionalData.filter(x => x.kpI_ID == kpiId)[0].capaStage;
        this.getKpiData(kpiId);
      }
      else if ((result == undefined || result.data == undefined || result == '' || result.data == null) && (kpiActual == '' || kpiActual == null)) {
        let baseData = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList;
        if (baseData.length > 0) {
          for (let b of baseData) {
            if (b.numerator == '' || b.numerator == null) {
              this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = '';
            }
          }
        }
      }
      else if (result == undefined || result.data == undefined || result == '' || result.data == null) {

      }
      else if (result.data[0]) {
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL = '';
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS = result.data[2];
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].highlights = result.data[1];
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].isflag = result.data[0];
        this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList = result.data[7];
        this.getKpiData(kpiId);
      }
    });
  }

  getKpiData(kpiId) {
    if (this.detailmonthly != undefined && this.detailmonthly != null) {
      this.detailmonthly.forEach((i: any) => {
        i.kpI_Quaterly.forEach((j: any) => {
          j.quarterly.forEach((k: any) => {
            if (k.kpI_ID == kpiId) {
              k.kpI_ACTUAL = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
              k.slA_STATUS = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS;
              k.highlights = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].highlights;
              k.isflag = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].isflag;
              k.baseMeasureDataList = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList;
              k.capaStage = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].capaStage;
              if (k.kpI_ACTUAL != null && k.kpI_ACTUAL != undefined && k.kpI_ACTUAL != '')
                this.getSLAStatus(k.kpI_ACTUAL, kpiId);
            }
          });
        });
        i.kpI_Month.forEach((j: any) => {
          j.monthly.forEach((k: any) => {
            if (k.kpI_ID == kpiId) {
              k.kpI_ACTUAL = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
              k.slA_STATUS = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS;
              k.highlights = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].highlights;
              k.isflag = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].isflag;
              k.baseMeasureDataList = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList;
              k.capaStage = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].capaStage;
              if (k.kpI_ACTUAL != null && k.kpI_ACTUAL != undefined && k.kpI_ACTUAL != '')
                this.getSLAStatus(k.kpI_ACTUAL, kpiId);
            }
          });
        });
        i.kpI_week.forEach((j: any) => {
          const weeks = [j.week1, j.week2, j.week3, j.week4, j.week5];
          weeks.forEach((week: any) => {
            week.forEach((k: any) => {
              if (k.kpI_ID == kpiId) {
                k.kpI_ACTUAL = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
                k.slA_STATUS = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].slA_STATUS;
                k.highlights = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].highlights;
                k.isflag = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].isflag;
                k.baseMeasureDataList = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].baseMeasureDataList;
                k.capaStage = this.additionalData.filter(x => x.kpI_ID == kpiId)[0].capaStage;
                if (k.kpI_ACTUAL != null && k.kpI_ACTUAL != undefined && k.kpI_ACTUAL != '')
                  this.getSLAStatus(k.kpI_ACTUAL, kpiId);
              }
            });
          });
        });
      });
    }
  }


}

@Component({
  selector: 'app-kpi-details-popup',
  template: `
  <div>
    <div style='float:left;font-weight:600;font-family:calibri;margin:5px'>Enter Highlights:</div>
    <mat-form-field style= 'margin : 5px'>
    <textarea matInput [(ngModel)] = "data.highlights" style="height:20px"></textarea>
    </mat-form-field>
    <mat-checkbox [(ngModel)] = "data.isNotApplicable"style= 'margin : 5px;font-size:12px'>Not Applicable</mat-checkbox>
  </div>
  <div mat-dialog-actions style= 'margin : 5px'>
    <button mat-button [mat-dialog-close]="data"><mat-icon>save</mat-icon></button>
    <button mat-button (click)="onNoClick()">Close</button> 
  </div>
      `
})
export class KPIDetailsPopUp {
  constructor(
    public dialogRef: MatDialogRef<KPIDetailsPopUp>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
