import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppsService } from '../Services/apps.service';
import { myUtility } from '../Shared/myUtility';
import { InnovationModel } from '../models/innovation-model';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { ProjectModel } from '../models/ras/project-model';
@Component({
  selector: 'app-ideas-innovation-matrix',
  templateUrl: './ideas-innovation-matrix.component.html',
  styleUrls: ['./ideas-innovation-matrix.component.scss']
})

export class IdeasInnovationMatrixComponent implements OnInit {
  matrixdata:any[] = [];
  ddideatype:string[]
  ideasType:string = "Ideas";
  itVertical: number = 0;
  _loading:boolean;
  input_processarea:string;
  ddProcessArea:string[]
  input_deptId:number;
  statusChange:string
  filteredideasData:InnovationModel[];
  constructor(@Inject(MAT_DIALOG_DATA) public matData: any,private _appservice: AppsService, public _util: myUtility,private dialogRef: MatDialogRef<IdeasInnovationMatrixComponent>) { }
  startDate:Date;
  endDate:Date = new Date();
  projData: ProjectModel[];
  proj: ProjectModel;
  legend:boolean = false;
  ngOnInit() {

    if (this.matData.processArea == "all" && this.matData.dept_id == undefined) {
      this.input_processarea = "All"
      this.input_deptId = 4
    }
    else if (this.matData.processArea == "all" && this.matData.dept_id != undefined) {
      this.input_processarea = "All"
      this.input_deptId = this.matData.dept_id;
    }
    this.getIdeatype();
    this.getOrder();
    this.getDate()
    this.getAllProjName()
    this.getProcessArea();
  }
  getDate()
  {
    let b:Date = new Date();
    let m:Number = b.getMonth();
    let y:Number = b.getFullYear();
    if(m == 3 || m ==4 || m ==5)
    {
      let date : string = (y.toString())+'-'+"04"+"-01"
      this.startDate = new Date(date);
    }
    else if(m == 6 || m ==7 || m ==8)
    {
      let date : string = (y.toString())+'-'+"07"+"-01"
      this.startDate = new Date(date);
    }
    else if(m == 9 || m ==10 || m ==11)
    {
      let date : string = (y.toString())+'-'+"10"+"-01"
      this.startDate = new Date(date);
    }
    else if(m == 0 || m ==1 || m ==2)
    {
      let date : string = (y.toString())+'-'+"01"+"-01"
      this.startDate = new Date(date);
    }
  }
  getOrder() {
    if (this.input_deptId == 3)
      this.itVertical = 1

    else
      this.itVertical = 0;
  }
  enablestatus() {
    this.legend = true;
  }
  disablestatus() {
    this.legend = false;
  }
  getIdeasInnovation()
  {
    this._loading = true;
    this._appservice.getAllIdeasInnovations(this.input_processarea,this.input_deptId,this.startDate,this.endDate,this.ideasType).subscribe( data => {
      this._loading = false;
      this.matrixdata = data;
    },
    error => { this._util.serviceError(error); }
    )
  }
  OnChange(bp, mat, event) {
    if (event.checked == true) {
      mat.selected = true;
    }
    else if (event.checked == false)
      mat.selected = false;
  }
  GetColor(status) {
    if (status === "Not Implemented")
      return "#f03d3d"
    else if (status === "Planning")
      return "#feeb84"
    else if (status == "Execution")
      return "#3db1e7"
    else if (status === "Completed")
      return "#44c444"
    else if (status == "Identified")
      return "#aeafaf"
    else if (status == "Not Applicable")
    return "#242323"
  }
  selectedTab(event) {
    if (event.index == 1)
      this.input_deptId = 3;
    else
      this.input_deptId = 4;
    this.getIdeasInnovation();
    this.getProcessArea()
    this.input_processarea = "All"
  }
  getAllProjName() {
    this._appservice.getAllProjectsName().subscribe(
      data => {
        this.projData = data;
      },
      error => { this._util.serviceError(error); });
  }
  getIdeatype()
  {
    this._appservice.getIdeatype().subscribe( data => {
      this.ddideatype = data;
    },
    error => { this._util.serviceError(error); }
    )
  }
  GetProjName(projId) {
    this.proj = this.projData.filter(t => t.proJ_ID == projId)[0];
    return this.proj.proJ_NM;
  }
  getProcessArea() {
    if(this.input_deptId == 3)
    {
      this._appservice.getProcessAreaADM().subscribe(data => { this.ddProcessArea = data; }, error => { this._util.serviceError(error); })
    }
    else
    this._appservice.getProcessAreaIMS().subscribe(data => { this.ddProcessArea = data; }, error => { this._util.serviceError(error); })
  }
  addStartEvent( event: MatDatepickerInputEvent<Date>)
  {
      this.startDate = event.value;
  }
  addEndEvent( event: MatDatepickerInputEvent<Date>)
  {
    this.endDate =event.value;
  }
  CancelOnClick()
  {
    this.dialogRef.close();
  }
  statusCheck()
  {
    if(this._util.IsEditable() && (this.matrixdata.length != 0))
    return true;

    else return false;
  }
  SaveStatus(matrixdata) {
    this._appservice.addInnovationsByMattrix(matrixdata ,this.statusChange).subscribe(
      data => {
        this.getOrder();
        this.getIdeasInnovation();
        this.getAllProjName()
      },
      error => { this._util.serviceError(error); });
  }

}
