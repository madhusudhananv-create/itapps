import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HighchartsChartComponent } from 'highcharts-angular';
import { Highcharts } from '../../../../highcharts-init';

// Services
import { MyUtility } from '../../../../shared/my-utility';
import { AppsService } from '../../../../core/services/apps.service';

// Models  
import { DateSelectionModel } from '../../../../models/date-selection.model';

/**
 * Achievement Trend Dialog Component
 * Migrated from Angular 6 to Angular 19 standalone
 * 
 * Displays a Highcharts line graph showing achievement trend over time
 * for selected projects within a 6-month period
 */
@Component({
  selector: 'app-achievement-trend',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    HighchartsChartComponent
  ],
  templateUrl: './achievement-trend.component.html',
  styleUrls: ['./achievement-trend.component.scss']
})
export class AchievementTrendComponent implements OnInit {
  DateSelection: DateSelectionModel;
  lineGraphData: any;
  custId: string = '';
  projId: string = '';  // Single project ID, not array
  Highcharts = Highcharts;

  constructor(
    private dialogRef: MatDialogRef<AchievementTrendComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _util: MyUtility,
    private _appService: AppsService
  ) {
    this.DateSelection = new DateSelectionModel(this._util);
  }

  ngOnInit(): void {
    if (this.data != undefined) {
      this.custId = this.data.custid;
      // Backend expects single project ID string, not array
      this.projId = Array.isArray(this.data.projids) ? this.data.projids[0] : this.data.projids;
    }
    this.setStartAndEndDate(this.DateSelection);
    this.service_GetAchievementTrendByMonthLine();
  }

  /**
   * Set start and end dates for the trend chart (last 6 months)
   */
  setStartAndEndDate(DateSelection: DateSelectionModel): void {
    DateSelection.endDate = new Date();
    DateSelection.startDate.setMonth(DateSelection.endDate.getMonth() - 6);

    DateSelection.selectedEndMonth = this._util.getMonthAbr(DateSelection.endDate.getMonth());
    DateSelection.selectedEndYear = DateSelection.endDate.getFullYear();

    DateSelection.selectedStartMonth = this._util.getMonthAbr(DateSelection.startDate.getMonth());
    DateSelection.selectedStartYear = DateSelection.startDate.getFullYear();
  }

  /**
   * Fetch achievement trend data from API
   */
  service_GetAchievementTrendByMonthLine(): void {
    this._appService.GetAchievementTrendByMonthLine(
      this.custId,
      this.projId,  // Send single project ID string
      this.DateSelection.startDate,
      this.DateSelection.endDate
    ).subscribe({
      next: (data) => {
        
        // Fix chart type if backend returns 0 instead of "line"
        if (data && data.chart && (data.chart.type === 0 || data.chart.type === null)) {
          data.chart.type = 'line';
        }
        
        // Ensure chart object exists
        if (data && !data.chart) {
          data.chart = { type: 'line' };
        }
        
        this.lineGraphData = data;
      },
      error: (error) => {
        console.error('Error fetching achievement trend:', error);
        this.lineGraphData = null;
      }
    });
  }

  /**
   * Close the dialog
   */
  closePopup(): void {
    this.dialogRef.close();
  }
}
