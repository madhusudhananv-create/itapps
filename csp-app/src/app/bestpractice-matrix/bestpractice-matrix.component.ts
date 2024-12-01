import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppsService } from '../Services/apps.service';
import { myUtility } from '../Shared/myUtility';
import { ProjectModel } from '../models/ras/project-model';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-bestpractice-matrix',
  templateUrl: './bestpractice-matrix.component.html',
  styleUrls: ['./bestpractice-matrix.component.scss']
})

export class BestpracticeMatrixComponent implements OnInit {
  @Input("ProcessArea") input_processarea: string;
  @Input("ServiceArea") input_servicearea: string;
  @Input("DeptId") input_deptId: number;
  displayedColumns: string[] = ['position']
  constructor( @Inject(MAT_DIALOG_DATA) public matData: any, private _appservice: AppsService, public _util: myUtility, private dialogRef: MatDialogRef<BestpracticeMatrixComponent>, private _spinner: Ng4LoadingSpinnerService) { }
  matrixdata: any[] = [];
  itVertical: number = 0;
  projData: ProjectModel[];
  proj: ProjectModel;
  startDate: Date;
  minValue: Date;
  maxValue: Date;
  _loading: Boolean;
  endDate: Date = new Date();
  p: number = 1;
  legend: Boolean = false;
  statusChange: string;
  ddstatus: any = this.matData.status;
  ddProcessArea: string[];
  ddServiceArea: string[];
  lstStatus: string[] = [];
  ngOnInit() {
    if (this.matData.processArea == "all" && this.matData.dept_id == undefined) {
      this.input_processarea = "All"
      this.input_deptId = 4
    }
    else if (this.matData.processArea == "All" && this.matData.dept_id != undefined) {
      this.input_processarea = "All"
      this.input_deptId = this.matData.dept_id;
    }
    if (this.matData.serviceArea == "all" && this.matData.dept_id == undefined) {
      this.input_servicearea = "All"
      this.input_deptId = 4
    }
    else if (this.matData.serviceArea == "All" && this.matData.dept_id != undefined) {
      this.input_servicearea = "All"
      this.input_deptId = this.matData.dept_id;
    }
    if (this.matData.status == undefined) {
      this.ddstatus = "All"
    }

    this.getOrder();
    this.getDate();
    this.getAllProjName();
    this.getProcessArea();
    this.getServiceArea();
    this.getBPStatus();
  }
  getDate() {
    let b: Date = new Date();
    let m: Number = b.getMonth();
    let y: Number = b.getFullYear();
    if (m == 3 || m == 4 || m == 5) {
      let date: string = (y.toString()) + '-' + "04" + "-01"
      this.startDate = new Date(date);
    }
    else if (m == 6 || m == 7 || m == 8) {
      let date: string = (y.toString()) + '-' + "07" + "-01"
      this.startDate = new Date(date);
    }
    else if (m == 9 || m == 10 || m == 11) {
      let date: string = (y.toString()) + '-' + "10" + "-01"
      this.startDate = new Date(date);
    }
    else if (m == 0 || m == 1 || m == 2) {
      let date: string = (y.toString()) + '-' + "01" + "-01"
      this.startDate = new Date(date);
    }
  }
  getOrder() {
    if (this.input_deptId == 3)
      this.itVertical = 1

    else
      this.itVertical = 0;
  }
  getBPStatus() {
    this._appservice.GetParametersByType('BP_STATUS')
      .subscribe(
      data => {
        this.lstStatus = data.map(t => t.options);
      }, error => {
        this._util.serviceError(error);
      })
  }
  getProcessArea() {
    if (this.input_deptId == 3)
      this._appservice.GetParametersByType('BP_PROCESS_AREA_ADM')
        .subscribe(
        data => {
          this.ddProcessArea = data.map(t => t.options);
          this.ddProcessArea.unshift("All");
        }, error => {
          this._util.serviceError(error);
        })
    else
      this._appservice.GetParametersByType('BP_PROCESS_AREA_IMS')
        .subscribe(
        data => {
          this.ddProcessArea = data.map(t => t.options);
          this.ddProcessArea.unshift("All");
        }, error => {
          this._util.serviceError(error);
        })
  }
  getServiceArea() {
    if (this.input_deptId == 3)
      this._appservice.GetParametersByType('BP_SERVICE_AREA_ADM')
        .subscribe(data => {
          this.ddServiceArea = data.map(t => t.options);
          this.ddServiceArea.unshift("All");
        }, error => {
          this._util.serviceError(error);
        })
    else
      this._appservice.GetParametersByType('BP_SERVICE_AREA_IMS')
        .subscribe(data => {
          this.ddServiceArea = data.map(t => t.options);
          this.ddServiceArea.unshift("All");
        }, error => {
          this._util.serviceError(error);
        })
  }
  // addStartEvent(event: MatDatepickerInputEvent<Date>) {
  //   let s: Date
  //   s = event.value;
  //   this.minValue = event.value;
  //   this.startDate = s.toDateString();
  // }
  // cleardDate()
  // {
  //   this.s
  // }
  // addEndEvent(event: MatDatepickerInputEvent<Date>) {
  //   let s: Date
  //   s = event.value;
  //   this.maxValue = event.value;
  //   this.endDate = s.toDateString();
  // }
  getBestPracticeMatrix() {
    if (this.input_deptId != undefined) {
      this._loading = true;
      this._appservice.getBestPracticeMatrix(this.ddstatus, this.input_servicearea, this.input_processarea, this.input_deptId, new Date(this.startDate).toDateString(), new Date(this.endDate).toDateString()).subscribe(
        data => {
          this._loading = false
          this.matrixdata = data;
        },
        error => { this._util.serviceError(error); });
    }
  }
  enablestatus() {
    this.legend = true;
  }
  disablestatus() {
    this.legend = false;
  }
  getAllProjName() {
    this._appservice.getAllProjectsName().subscribe(
      data => {
        this.projData = data;
      },
      error => { this._util.serviceError(error); });
  }
  statusCheck() {
    if (this._util.IsEditable() && this.matrixdata.length != 0)
      return true;

    else return false;
  }
  selectedTab(event) {
    if (event.index == 1)
      this.input_deptId = 3;
    else
      this.input_deptId = 4;
    this.getBestPracticeMatrix();
    this.getProcessArea();
    this.getServiceArea();
    this.input_processarea = "All"
  }
  GetColor(status) {
    if (status === "Not Implemented")
      return "#ffcccc"
    else if (status === "Planned")
      return "#feeb84"
    else if (status == "Started")
      return "#bff2ff"
    else if (status === "Completed")
      return "#bfffbf"
    else if (status == "Cancelled/Rejected")
      return "#dddddd"
    else if (status == "Not Applicable")
      return "#9e9e9e"
  }
  GetProjName(projId) {
    this.proj = this.projData.filter(t => t.proJ_ID == projId)[0];
    return this.proj.proJ_NM;
  }
  CancelOnClick() {
    this.dialogRef.close();
  }
  OnChange(bp, mat, event) {
    if (event.checked == true) {
      mat.selected = true;
    }
    else if (event.checked == false)
      mat.selected = false;
  }
  SaveStatus(matrixdata) {
    if (this.statusChange == undefined) {
      alert("Please select any one of three options to apply")
      return;
    }
    this._appservice.addBestPracticesByMattrix(matrixdata, this.statusChange).subscribe(
      data => {
        this.getOrder();
        this.getBestPracticeMatrix();
        this.getAllProjName()
      },
      error => { this._util.serviceError(error); });
  }
}
