import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { KpiGoalModel } from '../../../models/kpi-goal-model';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { KpiSharedService } from '../../../controls/kpi/kpi-shared.service';

@Component({
  selector: 'app-kpi-goals',
  templateUrl: './kpi-goals.component.html',
  styleUrls: ['./kpi-goals.component.scss']
})
export class KpiGoalsComponent implements OnInit {
  @Input('custId') custId: string;
  @Input('projId') projId: string;
  //@Input('includeInternal') IncludeInternal: Boolean;
  errorStr : string = "";
  constructor(private _kpiService: KpiSharedService, private _util: myUtility, private _appservice: AppsService) { }

  get goals(): KpiGoalModel[] {
    return this._kpiService.goals;
  }
  set goals(val) {
    this._kpiService.goals = val;
  }
  get goal(): KpiGoalModel {
    return this._kpiService.goal;
  }
  set goal(val) {
    this._kpiService.goal = val;
  }

  //displayedColumns = ['index', 'description', 'starT_DATE', 'enD_DATE', 'displaY_ORDER', 'edit', 'delete'];
  displayedColumns = ['index', 'description', 'displaY_ORDER', 'starT_DATE', 'enD_DATE', 'edit', 'delete'];
  dataSource = new MatTableDataSource<any>(this.goals);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  ngOnInit() {

    this.LoadData();
    this.dataSource = new MatTableDataSource(this.goals);
  }
   ngOnChanges() {
     this.goal = new KpiGoalModel();
     this.LoadData();
     this.dataSource = new MatTableDataSource(this.goals);
   }
  SubmitForm_Goal(form) {
    if (!form.valid) {
      alert("Please enter required fields");
      return;
    } 
    if(this.CheckIfAlreadyExist())
    {
      alert("KPI Goal already exists");
      return;
    }
    if (this.goal.id === 0 || this.goal.id === undefined) {
      let dbGoal = this._util.CopyObject(this.goal);
      dbGoal.id = 0;
      if (this.goal.displaY_ORDER == undefined || this.goal.displaY_ORDER == null)
        this.goal.displaY_ORDER = 1;
      dbGoal.starT_DATE = this._util.setLocaleDate(this.goal.starT_DATE);
      dbGoal.enD_DATE = this._util.setLocaleDate(this.goal.enD_DATE);
      dbGoal.customeR_ID = this.custId;
      dbGoal.projecT_ID = this.projId;
      dbGoal.createD_BY = localStorage.getItem('empid');
      dbGoal.createD_DATE = new Date();
      dbGoal.updateD_BY = localStorage.getItem('empid');
      dbGoal.updateD_DATE = new Date();
      dbGoal.isactive = true;
      this.service_addKpiGoal(dbGoal);
      this.goal.description = '';
    }
    else {
      let dbGoal = this._util.CopyObject(this.goal);
      dbGoal.starT_DATE = this._util.setLocaleDate(this.goal.starT_DATE);
      dbGoal.enD_DATE = this._util.setLocaleDate(this.goal.enD_DATE);
      console.log(dbGoal);
      dbGoal.updateD_BY = localStorage.getItem('empid');
      dbGoal.updateD_DATE = new Date();
      this.service_updateKpiGoal(dbGoal);
      this.goal = new KpiGoalModel();
    }
    // this.goal = new KpiGoalModel();

  }


  EditRow_onClick(row) {
    this.goal = row;
  }
  DeleteRow_onClick(row): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this.service_deleteKpiGoal(row);
    } else {
    }
  }
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.goals);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  LoadData() {
    if (this.projId != undefined) {
      //, this.IncludeInternal
      this._appservice.GetKpiGoals(this.custId, this.projId).subscribe(data => {

        this.goals = data;
        this.SetSelectedGoal();
        this.setGoalExpiry(this.goals);
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
    }
  }
  CheckIfAlreadyExist(): boolean
  { 
    let item=null;
    if (this.goal.id === 0 || this.goal.id === undefined) 
    {
      item= this.goals.filter(x=>x.description.toLowerCase() === this.goal.description.toLowerCase());
    }
    else
    {
     item= this.goals.filter(x=>x.description.toLowerCase() === this.goal.description.toLowerCase() && x.id!== this.goal.id);
    }
    if(item.length>0)
    return true;
    else
    return false;
  }
  setGoalExpiry(goals: KpiGoalModel[]) {
    let currentDate = new Date();
    goals.forEach(goal => {
      if (new Date(goal.enD_DATE) < currentDate)
        goal.isExpired = true;
      else
        goal.isExpired = false;
    });

    goals.sort((a, b) => {
      if (!a.isExpired)
        return 1
      if (a.isExpired)
        return -1;
      return 0;
    });
  }
  SetSelectedGoal() {
    if (this.goals.length > 0) {
      this._kpiService.selectedGoal = this.goals[0];
    }
  }
  formreset(goalForm) {
    this.goal = new KpiGoalModel();
    this.LoadData();
    goalForm.submitted = false;
  }
  service_addKpiGoal(_goal) {
    if (_goal.projecT_ID == undefined || _goal.projecT_ID == null) {
      alert("Select Project to add KPI goal");
      return;
    }
    this._appservice.AddKpiGoal(_goal).subscribe(data => {
      this.goals.push(data);
      this.setGoalExpiry(this.goals);
      this.RefreshTable();
      alert("Added Successfully");
    }, error => { 
      if (error.status === 409)
        alert(error.error);
        this._util.serviceError(error); });
  }
  service_updateKpiGoal(_goal) {
    this._appservice.UpdateKpiGoal(_goal).subscribe(data => {
      this.setGoalExpiry(this.goals);
      this.RefreshTable();
      alert("Updated Successfully");
    }, error => {
      if (error.status === 409)
      alert(error.error);
      this._util.serviceError(error); });
  }
  service_deleteKpiGoal(row) {
    this._appservice.DeleteKpiGoal(row).subscribe(data => {
      
      this.goals.splice(this.goals.indexOf(row), 1);
      this.RefreshTable();
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error)
      this.errorStr = error.error
      alert(this.errorStr)
      this.errorStr = '';
    
    });
  }
}