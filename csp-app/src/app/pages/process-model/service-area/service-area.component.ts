import { Component, OnInit } from '@angular/core';
import { ProcessAreaModelNew, ProcessModelNew, ProcessModelProcessMapping, ServiceAreaModelNew, ProcessServiceAreaMapping } from '../../../models/audit-checklist-based-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';

@Component({
  selector: 'app-service-area',
  templateUrl: './service-area.component.html',
  styleUrls: ['./service-area.component.scss']
})
export class ServiceAreaComponent implements OnInit {

  bAddNewServiceArea:Boolean = false;
  selectedServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();
  selectedProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  selectedProcessModel: ProcessModelNew = new ProcessModelNew();

  ProcessModelList;
  ServiceAreaList: ServiceAreaModelNew[] = [];
  ProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: ProcessModelNew[] = [];
  OriginalProcessList: ProcessModelNew[] = [];
  processServiceAreaMapping: ProcessServiceAreaMapping[] = [];
  newServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();

  displayedColumns = ["index", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "edit"];

  constructor(private _util: myUtility, private _appservice: AppsService) { }
  iEditIndex = -1;
  ngOnInit() {
    if (this.ProcessAreaList.length == 0)
      this.ProcessAreaList.push(this.selectedProcessArea);
    this.Service_GetServiceAreaList();
    this.Service_GetProcessAreaList();
    this.Service_GetProcessList();
    this.Service_GetProcessModelList();
  }
  ngOnChanges() {
    this.Service_GetProcessAreaList();
  }
  ddServiceAreaChange() {
    this.ProcessList.forEach((el) => { el.bSelected = false; })
    this.Service_GetProcessByServiceArea(this.selectedServiceArea.id);
  }
  ddProcessAreaChange() {
    if (this.selectedProcessArea == undefined)
      this.ProcessList = this.OriginalProcessList;
    else
      this.ProcessList = this.OriginalProcessList.filter(t => t.procesS_AREA_ID == this.selectedProcessArea.id);
  }
  ddProcessModelChange(){

  }
  EditRow_onClick(row, id) {
    this.iEditIndex = id;
  }
  SaveRow_onClick() {
    let checkedProcess = this.OriginalProcessList.filter(t => t.bSelected);
    this.service_UpdateProcessServiceAreaMapping(this.selectedServiceArea, checkedProcess);
    this.iEditIndex = -1;
  }
  CancelEdit_onClick() { this.iEditIndex = -1; }
  DeleteRow_onClick(row) { }
  getProcessArea(id) {
    let processA: ProcessAreaModelNew[] = this.ProcessAreaList.filter(t => t.id == id);
    if (processA != null && processA != undefined && processA.length > 0) {
      return processA[0].title;
    }
  }
  btnAddServiceArea_Onclick() {
    this.bAddNewServiceArea = true;
  }
  btnSaveServiceArea_Onclick() {
    this.service_AddServiceArea(this.newServiceArea);
  }
  btnCancelServiceArea_Onclick() {
    this.bAddNewServiceArea = false;
  }
  service_AddServiceArea(serviceArea: ServiceAreaModelNew) {
    this._appservice.AddServiceAreaNew(serviceArea).subscribe(data => {
      this.Service_GetServiceAreaList();
      alert("Process Area Added Successfully");
      this.bAddNewServiceArea = false;
      this.newServiceArea = new ServiceAreaModelNew();
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessByServiceArea(processModelId: number) {
    this._appservice.GetProcessByServiceArea(processModelId).subscribe(data => {
      this.processServiceAreaMapping = data;
      let ids: number[] = this.processServiceAreaMapping.map(x => x.procesS_ID);
      var filteredProcess = this.ProcessList.filter(function (itm) {
        return ids.indexOf(itm.id) > -1;
      });
      filteredProcess.forEach((el) => { el.bSelected = true; })

    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.OriginalProcessList = data;
      this.ProcessList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_UpdateProcessServiceAreaMapping(serviceArea: ServiceAreaModelNew, processList: ProcessModelNew[]) {
    this._appservice.UpdateProcessServiceAreaMapping(serviceArea, processList).subscribe(data => {
      //this.Service_GetProcessAreaList();
    }, error => { this._util.serviceError(error); });
  }
  Service_GetServiceAreaList(){
    this._appservice.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_UpdateProcessArea(processArea: ProcessAreaModelNew) {
    this._appservice.UpdateProcessArea(processArea).subscribe(data => {
      this.Service_GetProcessAreaList();
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe(data => {
      this.ProcessModelList = data;
    }, error => { this._util.serviceError(error); });
  }
  // service_UpdateProcessModel(processArea: ProcessAreaModelNew) {
  //   this._appservice.UpdateProcessArea(processArea).subscribe(data => {
  //     this.Service_GetProcessAreaList();
  //   }, error => { this._util.serviceError(error); });
  // }

}