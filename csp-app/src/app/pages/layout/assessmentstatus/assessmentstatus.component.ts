import { Component, OnInit, ViewChild } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { TaskModel } from '../../../models/task-model';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DateSelectionModel } from '../../../models/DateSelection-model';
import { SharedService } from '../../../Shared/shared.service';

@Component({
  selector: 'app-assessmentstatus',
  templateUrl: './assessmentstatus.component.html',
  styleUrls: ['./assessmentstatus.component.scss']
})
export class AssessmentstatusComponent implements OnInit {

  filterCriteria: any;
  assessmentModel : AssessmentModel = new AssessmentModel();
  
  tasks : TaskModel[] = [];
  displayedColumns = ['index', 'proJ_NM', 'description', 'priority', 'scheduleD_START_DATE', 'duE_DATE', 'status', 'assigneD_TO', 'owneR_NAME'];
  dataSource = new MatTableDataSource(this.tasks);
  selectedCust : string;
  OpenStatus : boolean = true;
  ClosedStatus : boolean;
  DateSelection: DateSelectionModel = new DateSelectionModel(this._util);
  @ViewChild('paginator') paginator : MatPaginator
  constructor(private _appService : AppsService, public _util: myUtility, private route: ActivatedRoute, public _shared: SharedService) { }

  ngOnInit() 
  {
     this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
    });

    this.getAllTasks();
  }

  getAllTasks()
  {
    this.assessmentModel = new AssessmentModel();
    this.assessmentModel.cusT_ID = this.selectedCust;
    this.assessmentModel.starT_DATE = this.DateSelection.startDate.toDateString();
    this.assessmentModel.enD_DATE = this.DateSelection.endDate.toDateString();
    console.log(this.assessmentModel);
    this._appService.GetAuditsByStatus(this.assessmentModel).subscribe(
      data =>{
        this.tasks = data;
        console.log(this.tasks);
        this.refreshTable(this.tasks);
        this.filteredData();
      },
      (error) => {this._util.serviceError(error)}
    )
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

  getStatus(status : string)
  {
    return `${status.charAt(0)}${status.substr(1).toLowerCase()}`
  }

  refreshTable(data)
  {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  Filter_onChange($event) 
  {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData();
  }

  filteredData()
  {
    let tempData : TaskModel[] = [];
    if(this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0 && this.tasks != undefined && this.tasks.length > 0)
    {
      tempData = this.tasks.filter(x => this._shared.selectedProjects.indexOf(x.proJ_ID ) >= 0);
    }
    else if(this._shared.selectedProjects == undefined || this._shared.selectedProjects.length == 0)
    {
      tempData = this.tasks;
    }

    tempData = this._util.ApplyCriteriaRange(this.filterCriteria, tempData);

    if(tempData.length > 0)
    {
      if(this.ClosedStatus && !this.OpenStatus)
        tempData = tempData.filter(x => x.status == 'COMPLETED' || x.status == 'CANCELLED');
      else if(this.OpenStatus && !this.ClosedStatus)
        tempData = tempData.filter(x => x.status == 'PLANNED' || x.status == 'IN PROGRESS');
      else if(!this.OpenStatus && !this.ClosedStatus)
        tempData = [];
    }
  
    this.refreshTable(tempData);  
  }
}

export class AssessmentModel
{
  cusT_ID : string;
  starT_DATE: string;
  enD_DATE : string;
}
