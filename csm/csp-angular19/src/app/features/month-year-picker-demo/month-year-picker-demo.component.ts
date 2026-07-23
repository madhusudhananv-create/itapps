/**
 * Month and Year Picker Demo Component
 * Demonstrates integration of MonthandyearpickerComponent
 * 
 * Features:
 * - Quarter selection with slider
 * - Year selection dropdown
 * - Two modes: Quarter or Year-to-Quarter
 * - Date range output (StartDate, EndDate)
 * 
 * Usage Example for Integration:
 * This component shows how to integrate the MonthandyearpickerComponent
 * into any feature that needs quarterly or year-based filtering
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MonthandyearpickerComponent } from '../../controls/monthandyearpicker/monthandyearpicker.component';

@Component({
  selector: 'app-month-year-picker-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MonthandyearpickerComponent
  ],
  template: `
    <div class="demo-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Month and Year Picker Component</mat-card-title>
          <mat-card-subtitle>Interactive Quarter and Year Selection</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- The Month and Year Picker Component -->
          <div class="picker-section">
            <h3>Date Range Selector:</h3>
            <app-monthandyearpicker 
              (onChange)="onDateRangeChange($event)">
            </app-monthandyearpicker>
          </div>

          <!-- Display Selected Values -->
          <div class="results-section" *ngIf="selectedData">
            <h3>Selected Date Range:</h3>
            <div class="result-item">
              <strong>Mode:</strong> {{ selectedData.Option }}
            </div>
            <div class="result-item">
              <strong>Year:</strong> {{ selectedData.Year }}
            </div>
            <div class="result-item">
              <strong>Start Date:</strong> {{ selectedData.StartDate }}
            </div>
            <div class="result-item">
              <strong>End Date:</strong> {{ selectedData.EndDate }}
            </div>
          </div>

          <!-- Integration Instructions -->
          <div class="instructions-section">
            <h3>How to Integrate:</h3>
            <ol>
              <li>Import MonthandyearpickerComponent into your component</li>
              <li>Add to component imports array</li>
              <li>Use in template: <code>&lt;app-monthandyearpicker (onChange)="handler($event)"&gt;</code></li>
              <li>Parse the JSON event data to get date range</li>
              <li>Use StartDate and EndDate for API calls or filtering</li>
            </ol>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .picker-section {
      margin: 20px 0;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .results-section {
      margin: 20px 0;
      padding: 20px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }

    .result-item {
      padding: 8px 0;
      font-size: 14px;
    }

    .result-item strong {
      display: inline-block;
      width: 120px;
    }

    .instructions-section {
      margin: 20px 0;
      padding: 20px;
      background-color: #fff3e0;
      border-radius: 4px;
    }

    .instructions-section ol {
      margin: 10px 0;
      padding-left: 20px;
    }

    .instructions-section li {
      margin: 8px 0;
    }

    .instructions-section code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    h3 {
      color: #1976d2;
      margin-bottom: 15px;
    }
  `]
})
export class MonthYearPickerDemoComponent implements OnInit {
  selectedData: any = null;

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Handle date range change from picker
   * @param event JSON string containing Option, Year, StartDate, EndDate
   */
  onDateRangeChange(event: string): void {
    try {
      this.selectedData = JSON.parse(event);
      
      // Example: Use these values for API calls
      // this.loadDataForDateRange(this.selectedData.StartDate, this.selectedData.EndDate);
    } catch (error) {
      console.error('Error parsing date range:', error);
    }
  }

  /**
   * Example method showing how to use the date range
   * This would typically call a service to fetch filtered data
   */
  loadDataForDateRange(startDate: string, endDate: string): void {
    // Example API call:
    // this.dataService.getData(startDate, endDate).subscribe(...)
  }
}
