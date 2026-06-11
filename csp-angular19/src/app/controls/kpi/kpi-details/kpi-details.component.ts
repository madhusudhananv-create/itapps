import { Component, OnInit, OnChanges, Input, ViewChild, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { trigger, state, style, transition, animate } from '@angular/animations';

// Services
import { MyUtility as myUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { KpiRagStatusService } from '../../../shared/kpi-rag-status.service';

// Components
import { KpiActionPlanComponent } from '../kpi-action-plan/kpi-action-plan.component';
import { KpiProductDetailViewComponent } from '../kpi-product-view/kpi-product-detail-view/kpi-product-detail-view.component';

// Model placeholder
class kpidetails {
  constructor() {}
}

export interface DialogData {
  isNotApplicable: Boolean;
  highlights: string;
  showApprovedMsg: Boolean;
  showComments: Boolean;
  showRejectedMsg: Boolean;
}

@Component({
  selector: 'app-kpi-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './kpi-details.component.html',
  styleUrls: ['./kpi-details.component.scss']
})
export class KpiDetailsComponent implements OnInit, OnChanges {
  public _util: any = inject(myUtility as any);
  private _appservice: any = inject(AppsService as any);
  public dialog: any = inject(MatDialog);
  public ragStatusService = inject(KpiRagStatusService);

  @Input('custId') custId: string = '';
  @Input('projId') projId: string = '';
  @Input('tabIndex') tabChange: Boolean = false;
  detailmonthly: any[] = [];
  weeklydate: Date = new Date();
  firstdate: Date = new Date();
  lastdate: Date = new Date();
  ind: number = 0;
  detailweekly: any = {};
  actual_period: Date = new Date();

  details: any[] = [];
  detail: any = {};


  _loading: boolean = false;

  month: any[] = [];
  kpiColor: any;
  colorCode: any[] = [];
  additionalData: any = [];
  kpiDetailsData: any[] = [];
  findingStatus: any = '';
  currentDate: Date = new Date();
  disableKPIEdit : boolean= false;

  constructor() { }

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
      this.detailmonthly = [];
      this._loading = true;
      this._appservice.getKPIDetailsMonthlyandWeekly(this.custId, this.projId, d).subscribe((data: any) => {
        this.detailmonthly = data;
        this.getColorforKPIDetails(this.detailmonthly)
        this.loadAdditionalData(this.detailmonthly)
        this.ShowMonthTable();
        this.ShowWeeklyTable();
        this.ShowQuarterlyTable();
        this.setWeekDates();
        this._loading = false;
      },
        (error: any) => {
          this._loading = false;
          this._util.serviceError(error);
        });
    }
  }

  getColorforKPIDetails(detailmonthly: any) {
    this.detailmonthly = detailmonthly;
    this.detailmonthly.forEach(i => {
      i.kpI_Month.forEach((j: any) => {
        j.monthly.forEach((k: any, index: any) => {
          k.colorCode = j.colorCode[index];
        });
      });
      i.kpI_Quaterly.forEach((j: any) => {
        j.quarterly.forEach((k: any, index: any) => {
          k.colorCode = j.colorCode[index];
        });
      });
      i.kpI_week.forEach((j: any) => {
        const weeks = [j.week1, j.week2, j.week3, j.week4, j.week5];
        weeks.forEach((week, index) => {
          week.forEach((k: any) => {
            k.colorCode = j.colorCode[index];
          });
        });
      });
    });
  }

  loadAdditionalData(detailmonthly: any) {
    this._loading = true;
    this._appservice.getKpiAdditionalData(detailmonthly).subscribe((data: any) => {
      this.additionalData = data;
      for (var i = 0; i < data.length; i++) {
        this.getKpiData(data[i].kpI_ID);
      }
      this._loading = false;
    },
      (error: any) => {
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
      this.detailmonthly = [];
      this._loading = true;
      this._appservice.getKPIDetailsMonthlyandWeekly(this.custId, this.projId, d).subscribe({
        next: (data: any) => {
          this.detailmonthly = data;
          this.getColorforKPIDetails(this.detailmonthly);
          this.loadAdditionalData(this.detailmonthly);
          this.ShowMonthTable();
          this.ShowWeeklyTable();
          this.ShowQuarterlyTable();
          this.setWeekDates();
          this._loading = false;
        },
        error: (error: any) => {
          this._loading = false;
          this._util.serviceError(error);
        }
      });
    }
  }

  ViewCAPA(kpiId: any, periodType: any, kpiActual: any) {
    this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
    let kpiDetails = this.additionalData.filter((x: any) => x.kpI_ID == kpiId && x.perioD_TYPE == periodType)[0];
    
    
    let kpiData = this.detailmonthly;
    let date: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.disableClose = false;
    dialogRef.data = {
      'editedRow': kpiDetails,
      'kpiData': kpiData,
      'selectedPeriod': date
    }
    dialogRef.maxWidth = "100%";
    dialogRef.width = "99%";
    dialogRef.height = "90%";
    dialogRef.hasBackdrop = true;
    dialogRef.panelClass = 'capa-dialog-container'; // Add custom class for dropdown positioning
    const dialog = this.dialog.open(KpiActionPlanComponent, dialogRef);

    dialog.afterClosed().subscribe((res: any) => {
      let keys = "capaforKPI" + kpiDetails;

      if (res != null && res != undefined && res.data != null && res.data != undefined) {
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId && x.perioD_TYPE == periodType)[0].capaStage = res.data;
      }
      else {
        res = localStorage.getItem(keys);
        if (res != undefined && res != null) {
          this.additionalData.filter((x: any) => x.kpI_ID == kpiId && x.perioD_TYPE == periodType)[0].capaStage = JSON.parse(res);
        }
      }
      this.getKpiData(kpiId);
      localStorage.removeItem(keys);
    })
  }

  WeekDates: any[] = [];
  setWeekDates() {
    if (this.detailmonthly != undefined)
      for (var i = 0; i < this.detailmonthly.length; i++) {
        if (this.detailmonthly[i].kpI_week.length > 0) {
          this.WeekDates = this.detailmonthly[i].kpI_week
          return
        }
      }
  }
 

  checkDateRestriction(d: any) {
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
    return [];
  }
  getMonthly() {
    if (this.detailmonthly != undefined)
      return this.detailmonthly.filter(t => t.frequency === "Monthly");
    return [];
  }

  SaveDetails(detailedit: any) {

    let week1: any;
    let week2: any;
    let week3: any;
    let week4: any;
    let week5: any;

    let kpiActualEmpty: number = 0;

    if (this.WeekDates != undefined && this.WeekDates.length > 0) {
      week1 = this._util.setLocaleDate(this.WeekDates[0].week1[0].period);
      week2 = this._util.setLocaleDate(this.WeekDates[0].week2[0].period);
      week3 = this._util.setLocaleDate(this.WeekDates[0].week3[0].period);
      week4 = this._util.setLocaleDate(this.WeekDates[0].week4[0].period);
      week5 = this._util.setLocaleDate(this.WeekDates[0].week5[0].period);
    }

    let d: String = (this._util.tableYear + "-" + this._util.tableMonth + '-01');
    let slaData = this.additionalData.filter((x: any) => x.slA_STATUS == null);
    if (slaData.length == this.additionalData.length) {
      this._util.showWarning("Please fill any KPI actual to save the data.");
      return false;
    }

    let actualNotMet = this.additionalData.filter((x: any) => x.kpI_ACTUAL != null && x.slA_STATUS == "Not Met");
    if (actualNotMet.length > 0) {
      for (var i = 0; i < actualNotMet.length; i++) {
        if (actualNotMet[i].capaStage.capA_SUBMISSION != null && actualNotMet[i].capaStage.capA_SUBMISSION.capa != null &&
          actualNotMet[i].capaStage.capA_SUBMISSION.capa.length == 0) {
          this.additionalData.filter((x: any) => x.kpI_ID == actualNotMet[i].kpI_ID)[0].iS_NOT_FILLED = true;
          this._util.showWarning('Please fill Corrective Action Plan for the Actual values where expected target was not met.');
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
              var isNumber = this.isNumeric(detailedit[i].kpI_Month[j].monthly[k].kpI_ACTUAL);
              if (isNumber == false) {
                this._util.showWarning('Please enter only numbers');
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
              var isNumber = this.isNumeric(detailedit[i].kpI_week[j].week1[k].kpI_ACTUAL);
              if (isNumber == false) {
                this._util.showWarning('Please enter only numbers');
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
              var isNumber = this.isNumeric(detailedit[i].kpI_week[j].week2[k].kpI_ACTUAL);
              if (isNumber == false) {
                this._util.showWarning('Please enter only numbers');
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
              var isNumber = this.isNumeric(detailedit[i].kpI_week[j].week3[k].kpI_ACTUAL);
              if (isNumber == false) {
                this._util.showWarning('Please enter only numbers');
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
              var isNumber = this.isNumeric(detailedit[i].kpI_week[j].week4[k].kpI_ACTUAL);
              if (isNumber == false) {
                this._util.showWarning('Please enter only numbers');
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
              var isNumber = this.isNumeric(detailedit[i].kpI_week[j].week5[k].kpI_ACTUAL);
              if (isNumber == false) {
                this._util.showWarning('Please enter only numbers');
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
      this._util.showWarning("KPI Achievements / Actuals not updated for all the KPI(s), please update the same to reflect the Project's KPI achievements in the dashboard.");
    }
    this.service_addKpiDetails(detailedit);
    kpiActualEmpty = 0 // reset the value 
    return true;
  }

  getSLAStatus(kpiActual: any, kpiId: any) {
    var isNumber = this.isNumeric(kpiActual);
    if (isNumber == false) {
      this._util.showWarning('Please enter only numbers');
      return false;
    }
    this._appservice.getColorforKPI(kpiActual, kpiId).subscribe({
      next: (data: any) => {
        this.kpiColor = data;
        this.detailmonthly.forEach((i: any) => {
          i.kpI_Quaterly.forEach((j: any) => {
            j.quarterly.forEach((k: any) => {
              if (k.kpI_ID == kpiId) {
                k.kpI_ACTUAL = kpiActual;
                k.colorCode = this.kpiColor;
                k.slA_STATUS = this.getSLAStatusBasedOnColor(this.kpiColor);
                this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
                this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS = k.slA_STATUS;
              }
            });
          });
          i.kpI_Month.forEach((j: any) => {
            j.monthly.forEach((k: any) => {
              if (k.kpI_ID == kpiId) {
                k.kpI_ACTUAL = kpiActual;
                k.colorCode = this.kpiColor;
                k.slA_STATUS = this.getSLAStatusBasedOnColor(this.kpiColor);
                this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
                this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS = k.slA_STATUS;
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
                  this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = kpiActual;
                  this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS = k.slA_STATUS;
                }
              });
            });
          });
        });
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
    return true;
  }

  getSLAStatusBasedOnColor(color: any) {
    if (color == '#f60000' || color == '#f9a400') {
      return 'Not Met';
    } else {
      return 'Met';
    }
  }

  formreset(detailsForm: any) {
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

  // ============================================
  // Helper Methods for Apple-Inspired Modern UI
  // ============================================

  /**
   * Get total count of KPIs in a goal
   */
  getTotalKPIs(goal: any): number {
    if (!goal || !goal.kpI_Month) return 0;
    
    return goal.kpI_Month.reduce((total: number, area: any) => {
      return total + (area.kpiWithTargets?.length || 0);
    }, 0);
  }

  /**
   * Get priority icon based on priority level
   */
  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      'Critical': 'error',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'check_circle'
    };
    return icons[priority] || 'label';
  }

  /**
   * Get status icon based on color code and status
   * Now uses centralized RAG status service for consistency
   */
  getStatusIcon(colorCode: string, status: string): string {
    if (status === 'NA') return 'remove_circle';
    return this.ragStatusService.getStatusIcon(colorCode);
  }

  /**
   * Get status label based on color code and status
   * Now uses centralized RAG status service for consistency
   */
  getStatusLabel(colorCode: string, status: string): string {
    if (status === 'NA') return 'N/A';
    return this.ragStatusService.getStatusLabel(colorCode);
  }

  /**
   * Get benchmark information for display
   * Shows users what the RAG status thresholds are
   */
  getBenchmarkInfo(): any {
    return this.ragStatusService.getBenchmarkDescription();
  }

  /**
   * Check if CAPA is required based on RAG status
   */
  requiresCAPA(colorCode: string): boolean {
    return this.ragStatusService.requiresCAPA(colorCode);
  }

  // ============================================
  // End of Helper Methods
  // ============================================

  freez: boolean = false;
  service_addKpiDetails(_detail: any) {
    this.freez = true;
    this._loading = true;
    this._appservice.AddKpiDetails(_detail).subscribe({
      next: (data: any) => {
        this.freez = false;
        this._util.showSuccess("Added Successfully.");
        this._loading = false;
        this.LoadData();
      },
      error: (error: any) => {
        this.freez = false;
        this._loading = false;
        this._util.serviceError(error);
      }
    });
  }

  openDialog(l: any): void {
    const dialogRef = this.dialog.open(KPIDetailsPopUp, {
      width: '250px',
      data: { isNotApplicable: l.isflag, highlights: l.highlights }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
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

  enterBaseMeasure(kpiId: any): void {
    let baseMeasures = []; var slaStatus: any; let isNA: any;
    baseMeasures = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList;
    slaStatus = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS;
    if (slaStatus == "NA") {
      isNA = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].isflag;
    }
    let remarks = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].highlights;
    let kpiActual = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
    let detailId = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].id;

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
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result != undefined && result.data != undefined && result.data != null && result.data != '' && (result.data.kpI_ACTUAL != undefined || result.data.kpI_ACTUAL != null)) {
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = result.data.kpI_ACTUAL;
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].remarks = null;
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].iS_NOT_APPLICABLE = 0;
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList = result.data.kpiData;
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].capaStage = result.data[0] ? null : this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].capaStage;
        this.getKpiData(kpiId);
      }
      else if ((result == undefined || result.data == undefined || result == '' || result.data == null) && (kpiActual == '' || kpiActual == null)) {
        let baseData = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList;
        if (baseData.length > 0) {
          for (let b of baseData) {
            if (b.numerator == '' || b.numerator == null) {
              this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = '';
            }
          }
        }
      }
      else if (result == undefined || result.data == undefined || result == '' || result.data == null) {

      }
      else if (result.data[0]) {
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL = '';
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS = result.data[2];
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].highlights = result.data[1];
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].isflag = result.data[0];
        this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList = result.data[7];
        this.getKpiData(kpiId);
      }
    });
  }

  getKpiData(kpiId: any) {
    if (this.detailmonthly != undefined && this.detailmonthly != null) {
      this.detailmonthly.forEach((i: any) => {
        i.kpI_Quaterly.forEach((j: any) => {
          j.quarterly.forEach((k: any) => {
            if (k.kpI_ID == kpiId) {
              k.kpI_ACTUAL = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
              k.slA_STATUS = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS;
              k.highlights = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].highlights;
              k.isflag = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].isflag;
              k.baseMeasureDataList = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList;
              k.capaStage = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].capaStage;
              if (k.kpI_ACTUAL != null && k.kpI_ACTUAL != undefined && k.kpI_ACTUAL != '')
                this.getSLAStatus(k.kpI_ACTUAL, kpiId);
            }
          });
        });
        i.kpI_Month.forEach((j: any) => {
          j.monthly.forEach((k: any) => {
            if (k.kpI_ID == kpiId) {
              k.kpI_ACTUAL = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
              k.slA_STATUS = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS;
              k.highlights = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].highlights;
              k.isflag = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].isflag;
              k.baseMeasureDataList = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList;
              k.capaStage = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].capaStage;
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
                k.kpI_ACTUAL = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].kpI_ACTUAL;
                k.slA_STATUS = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].slA_STATUS;
                k.highlights = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].highlights;
                k.isflag = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].isflag;
                k.baseMeasureDataList = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].baseMeasureDataList;
                k.capaStage = this.additionalData.filter((x: any) => x.kpI_ID == kpiId)[0].capaStage;
                if (k.kpI_ACTUAL != null && k.kpI_ACTUAL != undefined && k.kpI_ACTUAL != '')
                  this.getSLAStatus(k.kpI_ACTUAL, kpiId);
              }
            });
          });
        });
      });
    }
  }

  // Helper function to check if value is numeric
  isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

}

// Type declarations for models and components
declare const KpiGoalModel: any;
declare const kpi: any;

@Component({
  selector: 'app-kpi-details-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
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
















