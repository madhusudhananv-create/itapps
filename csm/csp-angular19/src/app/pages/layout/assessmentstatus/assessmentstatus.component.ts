import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AppsService, AssessmentModel } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { TaskModel } from '../../../core/models/task-model';
import { DateSelectionModel } from '../../../models/date-selection-model';
import { SharedData } from '../../../shared/shared-data';
import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';

@Component({
  selector: 'app-assessmentstatus',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSortModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    PortfolioProjectSelectorComponent,
    TableFilterComponent
  ],
  templateUrl: './assessmentstatus.component.html',
  styleUrls: ['./assessmentstatus.component.scss']
})
export class AssessmentstatusComponent implements OnInit {
  filterCriteria: any;
  assessmentModel: AssessmentModel = new AssessmentModel();
  
  tasks: TaskModel[] = [];
  displayedColumns = ['index', 'proJ_NM', 'description', 'priority', 'scheduleD_START_DATE', 'duE_DATE', 'status', 'assigneD_TO', 'owneR_NAME'];
  dataSource = new MatTableDataSource(this.tasks);
  selectedCust: string = '';
  OpenStatus: boolean = true;
  ClosedStatus: boolean = false;
  DateSelection: DateSelectionModel;
  
  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(
    private _appService: AppsService,
    public _util: UtilityService,
    private route: ActivatedRoute,
    public _shared: SharedData,
    private _router: Router
  ) {
    this.DateSelection = new DateSelectionModel(this._util);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
      
      // If month and year are provided in route params, use them to set the date range
      if (params['month'] && params['year']) {
        const month = params['month'];
        const year = parseInt(params['year']);
        
        this.DateSelection.selectedStartMonth = month;
        this.DateSelection.selectedStartYear = year;
        this.DateSelection.selectedEndMonth = month;
        this.DateSelection.selectedEndYear = year;
        
        // Update the actual date range
        this.DateSelection.startDate = new Date(
          year,
          this._util.getMonthNum(month),
          1
        );
        this.DateSelection.endDate = new Date(
          year,
          this._util.getMonthNum(month) + 1,
          0
        );
      }
    });

    this.getAllTasks();
  }

  getAllTasks() {
    this.assessmentModel = new AssessmentModel();
    this.assessmentModel.cusT_ID = this.selectedCust;
    this.assessmentModel.starT_DATE = this.DateSelection.startDate.toDateString();
    this.assessmentModel.enD_DATE = this.DateSelection.endDate.toDateString();
    
    this._appService.GetAuditsByStatus(this.assessmentModel).subscribe(
      data => {
        this.tasks = data;
        this.refreshTable(this.tasks);
        this.filteredData();
      },
      (error) => { this._util.serviceError(error); }
    );
  }

  saveDates() {
    this.DateSelection.startDate = new Date(
      this.DateSelection.selectedStartYear,
      this._util.getMonthNum(this.DateSelection.selectedStartMonth),
      1
    );
    this.DateSelection.endDate = new Date(
      this.DateSelection.selectedEndYear,
      this._util.getMonthNum(this.DateSelection.selectedEndMonth) + 1,
      0
    );
  }

  getStatus(status: string) {
    return `${status.charAt(0)}${status.substr(1).toLowerCase()}`;
  }

  refreshTable(data: TaskModel[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  Filter_onChange($event: any) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData();
  }

  filteredData() {
    let tempData: TaskModel[] = [];
    
    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0 && this.tasks != undefined && this.tasks.length > 0) {
      tempData = this.tasks.filter(x => this._shared.selectedProjects.indexOf(x.proJ_ID) >= 0);
    }
    else if (this._shared.selectedProjects == undefined || this._shared.selectedProjects.length == 0) {
      tempData = this.tasks;
    }

    tempData = this._util.ApplyCriteriaRange(this.filterCriteria, tempData);

    if (tempData.length > 0) {
      if (this.ClosedStatus && !this.OpenStatus)
        tempData = tempData.filter(x => x.status == 'COMPLETED' || x.status == 'CANCELLED');
      else if (this.OpenStatus && !this.ClosedStatus)
        tempData = tempData.filter(x => x.status == 'PLANNED' || x.status == 'IN PROGRESS');
      else if (!this.OpenStatus && !this.ClosedStatus)
        tempData = [];
    }
  
    this.refreshTable(tempData);  
  }
}
