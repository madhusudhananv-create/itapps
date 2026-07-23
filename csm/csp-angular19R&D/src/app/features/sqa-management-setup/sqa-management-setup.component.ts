import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// TODO: Install Highcharts packages
// npm install highcharts highcharts-angular
// import * as Highcharts from 'highcharts';
// import * as highchartsPareto from 'highcharts/modules/pareto';
// import { HighchartsChartModule } from 'highcharts-angular';
// highchartsPareto(Highcharts);

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { SqaChartParamsWithFilterModel, SqaProjectReportsModel, SqaChartFilterModel } from '../../models/sqa-project-reports-model';
import { ParameterModel } from '../../models/parameter-model';

/**
 * SQA Management Setup Component
 * Handles chart configuration for SQA data analysis
 * 
 * Features:
 * - Create/Edit/Delete project charts
 * - Configure chart parameters (type, dates, axes)
 * - Add filters to charts
 * - Generate preview charts
 * - Manage system and project charts
 * 
 * Migrated from Angular 6 to Angular 19
 * All business logic, names, and styles preserved exactly from legacy
 */
@Component({
  selector: 'app-sqa-management-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTooltipModule
    // HighchartsChartModule // TODO: Add after installing highcharts-angular
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './sqa-management-setup.component.html',
  styleUrls: ['./sqa-management-setup.component.scss']
})
export class SqaManagementSetupComponent implements OnInit, OnChanges {
  // Highcharts = Highcharts; // TODO: Uncomment after installing highcharts
  Highcharts: any = {}; // Placeholder until highcharts is installed
  
  @Input('projId') projId: string = '';
  @Input('custId') custId: string = '';
  
  _loading = false;
  selectedParams: SqaChartParamsWithFilterModel = new SqaChartParamsWithFilterModel();
  selectedReportType: SqaProjectReportsModel = new SqaProjectReportsModel();
  parameters: ParameterModel[] = [];
  xAxisChartFields: string[] = [];

  showCharts: any[] = [];
  reportTypes: SqaProjectReportsModel[] = [];
  projectCharts: SqaChartParamsWithFilterModel[] = [];
  displayedColumns = ['index', 'category', 'subcategory', 'title', 'edit'];

  ddChartDataDumpType: string[] = ['Incident & Service Request', 'Incident', 'Service Request', 'CAST'];
  ddFilter = ['', 'equals', 'contains', 'does not contain'];
  ddFilterOperator: string[] = ['AND', 'OR'];
  ddChartUsers = ['SYSTEM', 'PROJECT'];
  ddChartUsers_quality = ['PROJECT'];
  HighChartTypes = ['Bar', 'Line', 'Pareto'];
  ddFrequencyFields = ['', 'Monthly', 'Daily'];
  parameterTypes = ['Incident', 'Service Request', 'Incident and Service Request'];
  
  ddChartFields = [
    '',
    'Count',
    'Assigned Engineer',
    'Category',
    'Closed Date',
    'Company',
    'Contact Channel',
    'Country',
    'Created Date',
    'End User Department',
    'Engineer Name',
    'FCR',
    'Location',
    'Priority',
    'Resolved Date',
    'Resolved Engineer',
    'Request Type',
    'SLA Status',
    'SLA Performance',
    'Status',
    'Severity',
    'Sub Category',
    'Urgency',
    'Work Group'
  ];
  
  reportGroups = ['Process performance', 'Find patterns'];
  ddChartFieldsyAxis = ['Count'];

  constructor(
    public _util: MyUtility,
    private _appservice: AppsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.LoadData();
  }

  ngOnChanges() {
    this.reportTypes = [];
    this.LoadData();
  }

  LoadData() {
    this.service_GetParametersByTypes(this.parameterTypes);
    this.service_GetSQAReportTypes(this.projId);
    this.service_GetProjectCharts(this.projId);
  }

  EditRow_onClick(row: SqaChartParamsWithFilterModel) {
    this.selectedParams = JSON.parse(JSON.stringify(row));
    if (this.selectedParams.filters.length == 0) {
      let newfilter: SqaChartFilterModel = new SqaChartFilterModel();
      this.selectedParams.filters.push(newfilter);
    }
    this.selectedReportType = this.reportTypes.filter(t => t.id == row.datA_DUMP_ID)[0];
  }

  SaveRow_onClick(chart: SqaChartParamsWithFilterModel) {
    if (this.selectedParams.id === chart.id) {
      if (this.validateReportGenerate()) {
        this.selectedParams.datA_DUMP_ID = this.selectedReportType.id;
        this.selectedParams.updateD_BY = localStorage.getItem("empid") || '';
        chart = this._util.CopyObject(this.selectedParams);
        this.service_UpdateProjectChart(chart);
      }
    }
    else {
      alert("Please click edit and make changes before saving.");
    }
  }

  DeleteRow_onClick(chart: SqaChartParamsWithFilterModel) {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to delete the chart?',
      'Delete Chart'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.service_DeleteProjectChart(chart);
      }
    });
  }

  AddFilter_onClick() {
    let newfilter: SqaChartFilterModel = new SqaChartFilterModel();
    this.selectedParams.filters.push(newfilter);
  }

  RemoveFilter_onClick(filter: SqaChartFilterModel) {
    const index: number = this.selectedParams.filters.indexOf(filter);
    if (index !== -1) {
      this.selectedParams.filters.splice(index, 1);
      this.service_DeleteFilter(filter);
    }
  }

  GenerateChart_onClick() {
    if (this.validateReportGenerate()) {
      this.selectedParams.customeR_ID = this.custId;
      this.selectedParams.projecT_ID = this.projId;
      this.selectedParams.datA_DUMP_ID = this.selectedReportType.id;
      this.service_GetSQAProjectChart(this.selectedParams);
    }
  }

  AddToProject_onClick() {
    if (this.validateReportGenerate()) {
      this.selectedParams.id = 0;
      this.selectedParams.customeR_ID = this.custId;
      this.selectedParams.projecT_ID = this.projId;
      this.selectedParams.datA_DUMP_ID = this.selectedReportType.id;
      this.selectedParams.datA_DUMP_TYPE = this.selectedReportType.datA_DUMP_TYPE;
      this.selectedParams.createD_BY = localStorage.getItem("empid") || '';
      this.selectedParams.createD_DATE = new Date();
      this.selectedParams.updateD_BY = localStorage.getItem("empid") || '';
      this.selectedParams.updateD_DATE = new Date();
      this.service_AddSQAProjectChart(this.selectedParams);
    }
  }

  ddDatadump_Onchange() {
    this.selectedParams.datA_DUMP_ID = this.selectedReportType.id;
  }

  validateReportGenerate(): boolean {
    if (this.projId === "" || this.projId === undefined) {
      alert("Please select the project");
      return false;
    }
    else if (this.selectedReportType === undefined || this.selectedReportType.datA_DUMP_NAME == "") {
      alert("Please select the Data Dump");
      return false;
    }
    else if (this.selectedParams.charT_TYPE == '') {
      alert("Please select a Chart");
      return false;
    }
    return true;
  }

  service_DeleteFilter(filter: SqaChartFilterModel) {
    this._appservice.DeleteSQAChartFilter(filter).subscribe(
      (data: any) => {
        // Filter deleted successfully
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_AddSQAProjectChart(params: SqaChartParamsWithFilterModel) {
    this._appservice.AddSQAProjectChart(params).subscribe(
      (data: any) => {
        this.projectCharts.push(params);
        alert("Added to Project Successfully");
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  getProjectCharts(): SqaChartParamsWithFilterModel[] {
    let usercharts = this.projectCharts.filter(t => t.charT_USER === 'PROJECT');
    return usercharts;
  }

  getSystemCharts(): SqaChartParamsWithFilterModel[] {
    let usercharts = this.projectCharts.filter(t => t.charT_USER === 'SYSTEM');
    return usercharts;
  }

  service_GetSQAProjectChart(params: SqaChartParamsWithFilterModel) {
    this._loading = true;
    this._appservice.GetSQAProjectChart(params).subscribe(
      (data: any) => {
        this.showCharts = [];
        this.showCharts.push(data);
        this._loading = false;
      },
      (error: any) => {
        this._util.serviceError(error);
        this._loading = false;
      }
    );
  }

  service_GetParametersByTypes(types: string[]) {
    this._appservice.GetParametersByTypes(types).subscribe(
      (data: any) => {
        this.parameters = data;
        this.xAxisChartFields = this.parameters.filter((t: any) => t.name === 'Incident').map((t: any) => t.options);
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_GetSQAReportTypes(projid: string) {
    this._appservice.GetSQAReportTypes(projid).subscribe(
      (data: any) => {
        this.selectedReportType = new SqaProjectReportsModel();
        this.reportTypes = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_GetProjectCharts(projid: string) {
    this._appservice.GetProjectCharts(projid).subscribe(
      (data: any) => {
        this.projectCharts = data;
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_UpdateProjectChart(params: SqaChartParamsWithFilterModel) {
    this._appservice.UpdateSQAProjectChart(params).subscribe(
      (data: any) => {
        alert("Updated Successfully");
        this.service_GetProjectCharts(this.projId);
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }

  service_DeleteProjectChart(params: SqaChartParamsWithFilterModel) {
    this._appservice.DeleteSQAProjectChart(params).subscribe(
      (data: any) => {
        this.service_GetProjectCharts(this.projId);
      },
      (error: any) => { this._util.serviceError(error); }
    );
  }
}
