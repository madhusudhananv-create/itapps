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
  
  // Filter dates from parent dashboard
  filterMonth: string = '';  // e.g., "Apr"
  filterYear: string = '';   // e.g., "2024"

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
      
      // Get filter dates from parent dashboard
      this.filterMonth = this.data.filterMonth || '';
      this.filterYear = this.data.filterYear || '';
    }
    this.setStartAndEndDate(this.DateSelection);
    this.service_GetAchievementTrendByMonthLine();
  }

  /**
   * Set start and end dates for the trend chart
   * 
   * CRITICAL FIX: Respects dashboard filter selection
   * - If user filtered to Apr-2024, shows trend ending at Apr-2024
   * - Backend recalculates START date based on database config (ACHIEVEMENT_TREND)
   * - Backend typically shows 6 months of data
   * 
   * @param DateSelection - Date selection model to populate
   */
  setStartAndEndDate(DateSelection: DateSelectionModel): void {
    // Use filter date if provided, otherwise use current date
    if (this.filterMonth && this.filterYear) {
      // Convert month abbreviation to month index (0-11)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(this.filterMonth);
      
      if (monthIndex >= 0) {
        const year = parseInt(this.filterYear);
        
        // Use the filtered month/year as END date
        // Set to LAST day of the month to include the entire month
        DateSelection.endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        
        // Calculate START date (backend will recalculate based on config, but we set it for consistency)
        // Typically 6 months before the filtered date
        DateSelection.startDate = new Date(DateSelection.endDate.getFullYear(), DateSelection.endDate.getMonth() - 6, 1);
      } else {
        // Fallback if month parsing fails
        DateSelection.endDate = new Date();
        DateSelection.startDate = new Date();
        DateSelection.startDate.setMonth(DateSelection.endDate.getMonth() - 6);
      }
    } else {
      // No filter provided - use current date
      DateSelection.endDate = new Date();
      DateSelection.startDate = new Date();
      DateSelection.startDate.setMonth(DateSelection.endDate.getMonth() - 6);
    }

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
