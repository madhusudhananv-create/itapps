import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// TODO: Install Highcharts packages
// npm install highcharts highcharts-angular
// import { HighchartsChartModule } from 'highcharts-angular';
// import * as Highcharts from 'highcharts/highstock';
// import * as highchartsPareto from 'highcharts/modules/pareto';
// highchartsPareto(Highcharts);

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { SqaChartParamsWithFilterModel, SqaChartParamsModel } from '../../models/sqa-project-reports-model';

/**
 * SQA Management View Charts Component
 * Displays configured charts for SQA data analysis
 * 
 * Features:
 * - Filter charts by user type (SYSTEM/PROJECT)
 * - Filter charts by category/group
 * - Generate charts based on date range
 * - Display multiple charts with Highcharts
 * - Real-time loading progress indicator
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, API calls, names, and styles preserved exactly from legacy
 * 
 * TODO: After installing highcharts packages, uncomment:
 * - Highcharts imports above
 * - HighchartsChartModule in imports array
 * - Highcharts property assignment in class
 */
@Component({
  selector: 'app-sqa-management-viewcharts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule
    // HighchartsChartModule // TODO: Add after installing highcharts-angular
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './sqa-management-viewcharts.component.html',
  styleUrls: ['./sqa-management-viewcharts.component.scss']
})
export class SqaManagementViewchartsComponent implements OnInit, OnChanges {
  // Highcharts = Highcharts; // TODO: Uncomment after installing highcharts
  Highcharts: any = {}; // Placeholder until highcharts is installed
  
  @Input('projId') projId: string = '';
  @Input('custId') custId: string = '';
  
  starT_DATE: Date | undefined;
  enD_DATE: Date | undefined;
  _loadingCharts = false;
  ProjectVisualCharts: any[] = [];
  projectCharts: SqaChartParamsWithFilterModel[] = [];
  filteredCharts: SqaChartParamsWithFilterModel[] = [];
  displayedColumns = ['index', 'subcategory', 'title'];

  selectedChartUser = 'PROJECT';
  lstChartUsers = ['SYSTEM', 'PROJECT'];

  selectedChartGroup: string = '';
  lstChartGroups: string[] = [];

  updateFromInput = false;

  iChartCount = 0;
  iChartCurrent = 0;

  constructor(private _util: MyUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.service_GetProjectCharts(this.projId);
  }

  ngOnChanges() {
    this.service_GetProjectCharts(this.projId);
  }

  GenerateCharts_onClick(): boolean {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (this.starT_DATE === undefined || this.enD_DATE == undefined) {
      alert("Please select Start date and End dates");
      return false;
    }
    else {
      this.service_GetSQAProjectCharts(this.projId, this.starT_DATE, this.enD_DATE);
      return true;
    }
  }

  ChartUsers_onChange(event: string) {
    this.selectedChartGroup = '';
    this.lstChartGroups = this.projectCharts.filter(x => x.charT_USER === event).map(a => a.category);
    this.lstChartGroups = this.lstChartGroups.filter((x, i, a) => a.indexOf(x) == i);
    if (this.lstChartGroups.length > 0) {
      this.selectedChartGroup = this.lstChartGroups[0];
      this.ChartGroups_onChange(this.selectedChartGroup);
    }
    else {
      this.filteredCharts = [];
    }
  }

  ChartGroups_onChange(event: string) {
    this.filteredCharts = [];
    this.filteredCharts = this.projectCharts.filter(t => t.category === this.selectedChartGroup);
  }

  Refresh_onClick() {
    this.service_GetProjectCharts(this.projId);
  }

  service_GetSQAProjectCharts(projId: string, startdate: Date, enddate: Date) {
    this.iChartCount = 0;
    this.iChartCurrent = 0;
    this._loadingCharts = true;
    this.ProjectVisualCharts = [];
    this._appservice.GetSQAChartsParams(projId, startdate, enddate, this.selectedChartUser, this.selectedChartGroup, '').subscribe(data => {
      this.iChartCount = data.length;
      this.iChartCurrent = 1; 
      for (let v of data) {
        this.service_GetSQAChartFromParams(v);
      }
      this.stopLoading();
    }, error => {
      this._util.serviceError(error);
      this.stopLoading();
    });
  }

  stopLoading() {
    if (this.iChartCurrent > this.iChartCount) {
      this._loadingCharts = false;
    }
  }

  service_GetSQAChartFromParams(params: SqaChartParamsModel) {
    this._loadingCharts = true;
    this._appservice.GetSQAChartFromParams(params).subscribe(data => {
      this.ProjectVisualCharts.unshift(data);
      this.iChartCurrent += 1;
      this.stopLoading();
    }, error => {
      this._util.serviceError(error);
      this.stopLoading();
    });
  }

  service_GetProjectCharts(projid: string) {
    this._appservice.GetProjectCharts(projid).subscribe(data => {
      this.projectCharts = data;
      this.ChartUsers_onChange(this.selectedChartUser);
    }, error => { 
      this._util.serviceError(error);
      this.stopLoading();
    });
  }
}
