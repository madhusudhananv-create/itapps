import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { myUtility } from '../../../../Shared/myUtility';
import { environment } from '../../../../../environments/environment';
import { AppsService } from '../../../../Services/apps.service';
import { AccessControl } from '../../../../Shared/accessControl';
import { ActivatedRoute } from '@angular/router';
import { enumRoles } from '../../../../Shared/enum';
import { SharedService } from '../../../../Shared/shared.service';
import { TasksEventsDetails } from '../../../../models/dashboard-details-model';
import { debug } from 'console';


@Component({
  selector: 'app-task-event',
  templateUrl: './task-event-page.component.html',
  styleUrls: ['./task-event-page.component.scss']
})
export class TaskEventPageComponent implements OnInit {
  selectedCust: string;
  input: TasksEventsDetails[];
  private sub: any;
  tempObject: any;
  portfolio: string[] = [];
  displayedColumns = ['index', 'description', 'projectName', 'taskType', 'priority', 'taskCategory', 'dueDate', 'status'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  tempData1: TasksEventsDetails[];
  tempData: TasksEventsDetails[];
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  projNames: any[];
  allproj: boolean = false;
  selectedProject: string = "All Projects";
  projects: string[] = [];
  toggletext: string = "Hide";
  selectedOption: string = "1";
  AllChecked: boolean;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  period: string = 'TM';
  periodTitle: string;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(private _http: Http, private _util: myUtility, private _shared: SharedService, private _appservice: AppsService, private _access: AccessControl, private route: ActivatedRoute,) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.input);
    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
      if (params['period'] != undefined && params['period'] != null)
        this.period = params['period'];
      this.GetPeriodTitle();
      if (params['projid'] != undefined) {
        this._shared.selectedProjects.push(params['projid']);
      }
    });
    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;


    this.GetTasksEventsDetails(this.selectedCust);

    if (!this._util.IsPremier(this.selectedCust))
      this.displayedColumns = ['index', 'description', 'projectName', 'taskType', 'priority', 'taskCategory', 'dueDate', 'status'];
  }

  ngOnChanges() {
    this.RefreshTableForProject(this.input);
  }
  GetPeriodTitle() {
    switch (this.period) {
      case 'TM': this.periodTitle = 'Events & Tasks Due This Month'; break;
      case 'TW': this.periodTitle = 'Events & Tasks Due This Week'; break;
      case 'NM': this.periodTitle = 'Events & Tasks Due Next Month'; break;
      case 'NW': this.periodTitle = 'Events & Tasks Due Next Week'; break;
      case 'OD': this.periodTitle = 'Over Due Events & Tasks'; break;
      default: this.periodTitle = 'Over All Events & Tasks'; break;
    }
  }
  GetTasksEventsDetails(custid) {
    this._appservice.GetTasksEventsDetails(custid, this.allproj, this.period).subscribe(
      data => {
        this.input = data;
        this.RefreshTableForProject(this.input);
      },
      error => {
        this._util.serviceError(error);
      },
      () => {
        if (this.input.length == 0)
          this.bShowFilter = false;

        this.projects = (this.input.map(x => x.projectName)).filter((x, i, a) => a.indexOf(x) == i).sort();
        if (!this.projects.includes("All Projects"))
          this.projects.unshift("All Projects");
      }
    )
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  getAllProjectsForCustomer() {

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allproj).subscribe(
      data => {
        this.projNames = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }
  filteredData: any;
  filterCriteria: any;

  filterData(projectId: any, allchecked: any, pastDue: any, dueforClosure: any) {

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.input);
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter(x => this._shared.selectedProjects.indexOf(x.projectID) >= 0);
    }
    if (allchecked) {

    }
    else {
      this.filteredData = this.filteredData.filter(x => x.status != 'Occured' && x.status != 'Closed');

      if (pastDue && dueforClosure) { }
      else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      }
      else if (pastDue) {
        this.filteredData = this.filteredData.filter(x => new Date(x.dueDate) < currentDate);
      }
      else if (dueforClosure) {
        this.filteredData = this.filteredData.filter(x => new Date(x.dueDate) >= currentDate);
      }
    }

    this.RefreshTableForProject(this.filteredData);
  }


  showFilteredRows() {
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
  }

  levelmode: boolean = false;
  impactmode: boolean = false;
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;

  EnableLevel() {
    this.levelmode = true;
  }
  DisableLevel() {
    this.levelmode = false;
  }
  EnableImpact() {
    this.impactmode = true;
  }
  DisableImpact() {
    this.impactmode = false;
  }

  Project_OnClick() {
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
  }


  RefreshTableForProject(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  bShowFilter: boolean = false;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
    if (this.bShowFilter)
      this.toggletext = "Hide";
    else
      this.toggletext = "Show";
    // this.RefreshTableForProject(this.input);  
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedProject, this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
    return;
  }
  showAll($event) {
    //.AllChecked = $event;
  }
  projectSelected($event) {
    this.filterData(Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }
}

