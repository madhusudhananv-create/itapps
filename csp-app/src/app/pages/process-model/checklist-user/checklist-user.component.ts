import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProcessModel } from '../../../models/process-model'
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ProcessModelModel, ProcessSqaServiceArea, ProcessSqaProcess } from '../../../models/process-sqa-model';
import { ProcessAreaModel } from '../../../models/audit-checklist-based-model';
import { GAVSService } from '../../../models/innovation-model';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-checklist-user',
  templateUrl: './checklist-user.component.html',
  styleUrls: ['./checklist-user.component.scss']
})

export class ChecklistUserComponent implements OnInit {


  constructor(private _util: myUtility, private _appservice: AppsService, public _access: AccessControl) { }
  processModelDesc: string;
  modelList: ProcessModelModel[] = []
  processAreaList: ProcessSqaServiceArea[] = []
  gavsServiceArea: any;
  processModelId: number;
  serviceAreaID: number;
  processArea: ProcessSqaServiceArea = new ProcessSqaServiceArea()
  processes: ProcessSqaProcess = new ProcessSqaProcess()
  processList: ProcessSqaProcess[] = []
  model: ProcessModelModel = new ProcessModelModel()
  displayedColumns = ["index", "title", "description", "releaseVersion", "releaseDate", "Action"];
  ngOnInit() {
    this.LoadData();
    this.getServiceAreaProvided()
  }
  ngOnChanges() {
    this.LoadData();
  }
  SubmitModelForm(form) {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.model.title == undefined || this.model.title.trim() == "") {
      alert("Please enter Process Model");
      return;
    }
    if (this.model.releasE_DATE == undefined) {
      alert("Please enter Release Date");
      return;
    }
    if ((specialCharPattern.test(this.model.title)) || numberPattern.test(this.model.title)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    if ((specialCharPattern.test(this.model.description)) || numberPattern.test(this.model.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Industry Standard Reference');
      return;
    }
    if ((specialCharPattern.test(this.model.releasE_VERSION_REFERENCE)) || numberPattern.test(this.model.releasE_VERSION_REFERENCE)) {
      alert('Please enter alphanumeric or numeric values along with special characters for Release Version Reference');
      return;
    }
    if (form.valid) {
      if (this.model.id == 0) {
        this._appservice.addProcessModel(this.model).subscribe(data => {
          this.modelList.push(data)
          this.LoadData()
          alert("Added Successfully");
          this.model = new ProcessModelModel();
        }, error => {
          if (error.status === 409)
            alert(error.error);
          this._util.serviceError(error);
        });
      }
      else {
        this._appservice.updateProcessModel(this.model).subscribe(data => {
          //this.modelList.push(data)
          this.LoadData()
          alert("Updated Successfully");
          this.model = new ProcessModelModel();
        }, error => {
          if (error.status === 409)
            alert(error.error);
          this._util.serviceError(error);
        });
      }
    }
    else {
      alert("Please enter the mandatory fields")
    }
  }
  SubmitProcessArea(form) {
    if (form.valid) {
      if (this.processArea.id == 0) {
        this._appservice.addProcessArea(this.processArea).subscribe(data => {
          this.processAreaList.push(data)
          this.LoadData()
          alert("Added Successfully");
        }, error => { this._util.serviceError(error); });
      }
      else {
        this._appservice.updateProcessArea(this.processArea).subscribe(data => {
          //this.modelList.push(data)
          this.LoadData()
          alert("Updated Successfully");
        }, error => { this._util.serviceError(error); });
      }
    }
    else {
      alert("Please enter the mandatory fields")
    }
  }
  SubmitProcess(form) {
    if (form.valid) {
      if (this.processes.id == 0) {
        this._appservice.addProcesses(this.processes).subscribe(data => {
          this.processList.push(data)
          this.LoadData()
          alert("Added Successfully");
        }, error => { this._util.serviceError(error); });
      }
      else {
        this._appservice.updateProcesses(this.processes).subscribe(data => {
          //this.modelList.push(data)
          this.LoadData()
          alert("Updated Successfully");
        }, error => { this._util.serviceError(error); });
      }
    }
    else {
      alert("Please enter the mandatory fields")
    }
  }
  getServiceAreaProvided() {
    this._appservice.getServiceArea().subscribe(data => {
      this.gavsServiceArea = data;
    }, error => { this._util.serviceError(error); });
  }
  EditRow_onClick(model: ProcessModelModel) {
    this.model = model;
  }
  DeleteRow_onClick(model: ProcessModelModel) {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteProcessModel(model).subscribe(data => {
        this.LoadData();
        alert("Deleted Successfully");
      }, error => { this._util.serviceError(error); },
        () => { this._appservice.deleteProcessModelProcessMapping(model.id).subscribe() });
    }
  }
  EditRow_onClickArea(model: ProcessSqaServiceArea) {
    this.processArea = model;
  }
  DeleteRow_onClickArea(model: ProcessSqaServiceArea) {
    this._appservice.deleteProcessArea(this.processArea).subscribe(data => {
      this.LoadData()
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
  EditRow_onClickProcess(model: ProcessSqaProcess) {
    this.processes = model;
  }
  DeleteRow_onClickProcess(model: ProcessSqaProcess) {
    this._appservice.deleteProcesses(this.processes).subscribe(data => {
      this.LoadData()
      alert("Deleted Successfully");
    }, error => { this._util.serviceError(error); });
  }
  GetProcessModelName(modelId) {
    return this.modelList.find(t => t.id == modelId).title
  }
  GetServiceAreaName(serviceAreaId) {
    return this.gavsServiceArea.find(t => t.servicE_AREA_ID == serviceAreaId).servicE_AREA_NAME
  }
  LoadData() {
    this._appservice.GetProcessModel().subscribe(data => {
      this.modelList = data;
    }, error => { this._util.serviceError(error); });
  }
  ClearInputs(roWForm: FormGroup) {
    this.model = new ProcessModelModel()
    this.LoadData()
  }
  ClearInputsArea() {
    this.processArea = new ProcessSqaServiceArea()
    this.LoadData()
  }
  ClearInputsProcess() {
    this.processes = new ProcessSqaProcess()
    this.LoadData()
  }
  getProcessAreaForModelandServiceArea() {
    this._appservice.getProcessAreaForModelandSA(this.processArea.procesS_MODEL_ID, this.processArea.gavS_SERVICE_AREA).subscribe(data => {
      this.processAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  getProcessAreaForModelandServiceAreainProcess() {
    this._appservice.getProcessAreaForModelandSA(this.processModelId, this.serviceAreaID).subscribe(data => {
      this.processAreaList = data;
      this.processes = new ProcessSqaProcess()
    }, error => { this._util.serviceError(error); });
  }
  getProcessSQA(areaId) {
    this._appservice.getProcessSQA(areaId).subscribe(data => {
      this.processList = data;
    }, error => { this._util.serviceError(error); });
  }
  // service_addProcessModel(_roW) {
  //   this._appservice.AddProcessModel(_roW).subscribe(data => {
  //     this.rows.push(_roW);
  //   //  this.RefreshTable();
  //     alert("Added Successfully");
  //   }, error => { this._util.serviceError(error); });
  // }
  // service_UpdateProcessModel(_roW) {
  //   this._appservice.UpdateProcessModel(_roW).subscribe(data => {
  //   //  this.RefreshTable();
  //     alert("Updated Successfully");
  //   }, error => { this._util.serviceError(error); });
  // }
  // EditRow_onClick(row) {
  //   this.roW = row;
  // }
  // DeleteRow_onClick(row): void {
  //   if (confirm('Are you sure you want to delete the record?')) {
  //     this.service_DeleteProcessModel(row);
  //   } else {
  //   }
  // }
  // service_DeleteProcessModel(row) {
  //   this._appservice.DeleteProcessModel(row).subscribe(data => {
  //     this.rows.splice(this.rows.indexOf(row), 1);
  //    // this.RefreshTable();
  //     alert("Deleted Successfully");
  //   }, error => { this._util.serviceError(error); });
  // }
}


// PROCESS_MODEL_DESCRIPTION
