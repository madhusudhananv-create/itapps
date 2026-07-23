import { Component, Input, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HighchartsChartComponent } from 'highcharts-angular';
import { Highcharts } from '../../../highcharts-init';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MonthandyearpickerComponent } from '../../../controls/monthandyearpicker/monthandyearpicker.component';

// Import and initialize Highstock modules for timeline/flags support
// Using require to avoid Vite optimization issues
declare var require: any;
try {
  const HighchartsStock = require('highcharts/highstock');
  HighchartsStock(Highcharts);
} catch (e) {
  console.warn('[DashboardSuccessJourney] Highstock module not available:', e);
}

@Component({
  selector: 'app-dashboard-success-journey',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    HighchartsChartComponent,
    MonthandyearpickerComponent
  ],
  templateUrl: './dashboard-success-journey.component.html',
  styleUrls: ['./dashboard-success-journey.component.scss']
})
export class DashboardSuccessJourneyComponent implements OnInit, OnChanges {
  @Input() custId: string = '';

  // Services
  private appService = inject(AppsService);
  private utilService = inject(MyUtility);

  // Component state
  Projects: any[] = [];
  projId: string = '';
  
  // Date picker variables
  pickerOption: any;
  pickerYear: any;
  pickerStartDate: Date | null = null;
  pickerEndDate: Date | null = null;

  // Chart
  chartOptions: any;

  ngOnInit() {
    // Use setTimeout to ensure @Input bindings are complete
    setTimeout(() => {
      if (this.custId) {
        this.LoadProject();
        this.LoadTimelineChart();
      }
    }, 0);
  }

  ngOnChanges() {
    this.LoadProject();
  }

  LoadProject() {
    const empId = localStorage.getItem('empid') || localStorage.getItem('email') || '';
    
    if (this.utilService.IsGAVS()) {
      this.appService.GetCustomerProjectsNameWithCustNM(this.custId, empId).subscribe({
        next: (data: any[]) => {
          this.Projects = data;
          if (this.Projects && this.Projects.length > 0) {
            this.projId = this.Projects[0].proJ_ID;
            this.LoadTimelineChart();
          }
        },
        error: (error: any) => {
          console.error('Error loading projects:', error);
          this.utilService.serviceError(error);
        }
      });
    } else {
      this.appService.GetCustomerProjectsNameForClient(this.custId, empId).subscribe({
        next: (data: any[]) => {
          this.Projects = data;
          if (this.Projects && this.Projects.length > 0) {
            this.projId = this.Projects[0].proJ_ID;
            this.LoadTimelineChart();
          }
        },
        error: (error: any) => {
          console.error('Error loading projects:', error);
          this.utilService.serviceError(error);
        }
      });
    }
  }

  ddProject_onChange() {
    this.LoadTimelineChart();
  }

  monthandyearpicker_onChange(event: any) {
    if (event) {
      const obj = typeof event === 'string' ? JSON.parse(event) : event;
      this.pickerOption = obj.Option;
      this.pickerYear = obj.Year;
      this.pickerStartDate = obj.StartDate;
      this.pickerEndDate = obj.EndDate;
    }
  }

  LoadTimelineChart() {
    this.chartOptions = undefined;
    
    if (this.projId && this.projId !== '') {
      this.Service_GetTimelineChart();
    }
  }

  Service_GetTimelineChart() {
    this.appService.GetTimelineChart(
      this.custId,
      this.projId,
      this.pickerStartDate,
      this.pickerEndDate
    ).subscribe({
      next: (data: any) => {
        
        // The API returns Highcharts options object
        if (data) {
          // Filter out flags series if highstock module isn't available
          if (data.series && Array.isArray(data.series)) {
            const hasFlagsSeries = data.series.some((s: any) => s.type === 'flags');
            const hasHighstock = typeof (Highcharts as any).seriesTypes?.flags !== 'undefined';
            
            if (hasFlagsSeries && !hasHighstock) {
              console.warn('[DashboardSuccessJourney] Removing flags series - Highstock not available');
              data.series = data.series.filter((s: any) => s.type !== 'flags');
            }
          }
          
          this.chartOptions = data;
        }
      },
      error: (error: any) => {
        console.error('Error loading timeline chart:', error);
        this.utilService.serviceError(error);
      }
    });
  }
}
