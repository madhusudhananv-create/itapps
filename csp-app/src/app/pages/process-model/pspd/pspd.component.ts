import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewEncapsulation, Input, ViewChild, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { CustomerProjectIds } from '../../../models/customer-projects-model';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { getMatIconFailedToSanitizeLiteralError, MatCheckbox, MatCheckboxChange } from '@angular/material';
import { ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { ProcessModelModel } from '../../../models/process-sqa-model';
import { ServiceAreaProjectMappingModel, ProcessByServiceAreaModel, ProcessByProcessArea, ServiceTowersProjectMappingModel } from '../../../models/service-area-project-mapping-model';
import { ProjectServiceAreaProcessMappingModel } from '../../../models/project-service-area-process-mapping-model';
import { element } from 'protractor';
import { ServiceAreaProcessModleProcessCollection } from './../../../models/service-area-project-mapping-model';
import { ThemeService } from 'ng2-charts';


@Component({
  selector: 'app-pspd',
  templateUrl: './pspd.component.html',
  styleUrls: ['./pspd.component.scss']
})
export class PspdComponent implements OnInit {
  ddData: any;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

  serviceAreaList :any =[];
  processModelList: ProcessModelModel[] = [];
  selectedServiceAreaToAdd: ServiceAreaModelNew;
  selectedServiceArea: ServiceAreaModelNew;
  selectedServiceAreas: ServiceAreaModelNew[] = []
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];
  ProcessByServiceAreaList: ProcessByServiceAreaModel[] = [];
  projectServiceAreaProcessMapping: ProjectServiceAreaProcessMappingModel[] = []

  custId: string;
  projId: string;
  mobileQuery: MediaQueryList;
  selectedProcessModel: number[] = [];
  duplicateselectedProcessModel: number[] = [];
  //selectedServiceArea: number[] = [];
  ddprocessModelList: any;
  serviceArea: any = [];
  processDescription: any;
  gavsserviceArea: number[];
  enableDiv: Boolean = false;
  falseflag: boolean = false;
  isCheck: boolean = false;
  isProcessMapped: boolean = true;


  projectFindings: ProjectServiceAreaProcessMappingModel[] = [];

  @ViewChildren('AllChecked') AllChecked;
  private _mobileQueryListener: () => void;
  constructor(private _appservice: AppsService, public _util: myUtility, private _router: Router, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private _formBuilder: FormBuilder, private _http: HttpClient) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ddServiceArea: any;
  ngOnInit() {
    this.Service_GetProcessModelList();

    // this.getDropDownParams()
  }



  IsAllCheckedOnInitialLoad(list: ServiceAreaProcessModleProcessCollection[]) {
    let element = list.find(x => x.bSelected == false);
    if (element == undefined)
      return true;
    else
      return false;
  }


  ngOnChanges() {
    this.emitChanges()
    //this.Service_GetServiceAreaProjectMapping();
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  btnLoadData_OnClick() {
    if (this.projId == undefined) {
      alert("Please select a Customer and a Project to get details")
    }
    else {
      this.ClearDetails();
      this.Service_GetServiceAreaProjectMapping(this.projId);
    }
  }

  checkallNew(event: MatCheckboxChange, processList: ProcessByProcessArea[]) {
    if (event.checked) {
      processList.forEach(x => {
        x.bSelected = true
        x.processess.forEach(x => {
          x.bSelected = true;
        })
      });

    }
    else {
      processList.forEach(x => {
        x.isDisabled == true ? x.bSelected = true : x.bSelected = false
        x.processess.forEach(x => {
          x.isDisabled == true ? x.bSelected = true : x.bSelected = false
        })
      });
    }
  }

  unCheckheader(event: MatCheckboxChange, processModel: ProcessByServiceAreaModel, processArea: ProcessByProcessArea) {
    if (!event.checked) {
      processModel.iS_CHECKED = false;
      processArea.processess.forEach(x => {
        //x.bSelected = false;
        x.isDisabled == true ? x.bSelected = true : x.bSelected = false
      });
    }
    else {
      processArea.processess.forEach(x => {
        x.bSelected = true;
      });

      let checkedCount = processModel.groupByProcessArea.filter(x => x.bSelected == true).length;
      if (processModel.groupByProcessArea.length == checkedCount)
        processModel.iS_CHECKED = true;
      else
        processModel.iS_CHECKED = false;

      let disabledCount = processModel.groupByProcessArea.filter(x => x.isDisabled == true).length;
      if (processModel.groupByProcessArea.length == disabledCount)
        processModel.isDisabled = true;
      else
        processModel.isDisabled = false;
    }
  }

  unCheckProcess(event, processModel: ProcessByServiceAreaModel, processArea: ProcessByProcessArea,
    process: ServiceAreaProcessModleProcessCollection) {
    if (!event.checked) {
      processModel.iS_CHECKED = false;
      processArea.bSelected = false;
    }
    else {
      let checkedCount = processArea.processess.filter(x => x.bSelected == true).length;
      if (processArea.processess.length == checkedCount) {
        processModel.iS_CHECKED = true;
        processArea.bSelected = true;
      }
      else {
        processModel.iS_CHECKED = false;
        processArea.bSelected = false;
      }
    }
  }

  btnSaveData_OnClick() {

    let mapping: ProjectServiceAreaProcessMappingModel[] = [];
    for (let l of this.ProcessByServiceAreaList) {
      for (let area of l.groupByProcessArea) {
        for (let item of area.processess) {
          if (item.bSelected || item.iS_DIRTY) {
            let map: ProjectServiceAreaProcessMappingModel = new ProjectServiceAreaProcessMappingModel();
            map.cusT_ID = this.custId;
            map.proJ_ID = this.projId;
            map.servicE_AREA_ID = this.selectedServiceArea.id;
            map.procesS_MODEL_ID = item.procesS_MODEL_ID;
            map.procesS_Area_ID = item.procesS_AREA_ID;
            map.procesS_ID = item.procesS_ID;
            map.procesS_TAILORING_NOTES = item.procesS_TAILORING_NOTES;

            if (this.projectServiceAreaProcessMapping != undefined && this.projectServiceAreaProcessMapping.length > 0) {

              let existingData = this.projectServiceAreaProcessMapping.filter(x => x.procesS_MODEL_ID == map.procesS_MODEL_ID && x.procesS_ID == map.procesS_ID && x.isactive);
              if (existingData != undefined && existingData.length > 0) {
                map.id = existingData[0].id;
              }
            }

            mapping.push(map);
          }
        }
      }
    }
    if (mapping.length > 0)
      this.Service_UpdateProjectServiceAreaProcessMapping(mapping);
  }
  ClearDetails() {
    this.selectedServiceArea = undefined;
    this.ProcessByServiceAreaList = [];
  }

  btnAddServiceArea_OnClick() {
    if (this.projId == undefined) {
      alert("Please select 'Customer' and 'Project' to add the Process Model");
    }
    else if (this.selectedServiceAreaToAdd == undefined) {
      alert("Please select a 'Service Tower' to Add");
    }
    else {
      let mapping: ServiceAreaProjectMappingModel = new ServiceAreaProjectMappingModel();
      mapping.cusT_ID = this.custId;
      mapping.proJ_ID = this.projId;
      mapping.servicE_AREA_ID = this.selectedServiceAreaToAdd.id;
      this.Service_AddServiceAreaProjectMapping(mapping);
    }
  }
  getServiceCatalogue(processModel) {
    this._appservice.getServiceAreaforModel(processModel).subscribe(
      data => {
        this.ddServiceArea = data;
      },
      error => { this._util.serviceError(error); }
    )
  }
  getDropDownParams() {
    this.service_getDropDownDataForAudit()
  }

  GetServiceArea(id): ServiceAreaModelNew {
    let sa = this.serviceAreaList.filter(t => t.id == id);
    if (sa.length > 0) {
      return sa[0];
    }
    else
      return undefined;
  }
  GetServiceAreaName(id) {
    let sa = this.serviceAreaList.filter(t => t.id == id);
    if (sa.length > 0) {   
      return sa[0].title;
    }
     else
       return undefined;
  }
  GetProcessModelName(id) {
    let sa = this.processModelList.filter(t => t.id == id);
    if (sa.length > 0) {
      return sa[0].title;
    }
    else
      return '';
  }

  ddProcessModel_Onchange() {
    //this.getServiceCatalogue(this.selectedProcessModel);
    this.getDropDownParams()
    //this.emitChanges();
  }
  ddServiceArea_Onchange() {
    this.getProcessDescription(this.custId, this.projId, this.selectedServiceArea);
  }


  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        window.location.href = loginurl;
      }
      else {
        this.service_Logout();
        this._router.navigateByUrl('/login');
      }
    }
  }
  getApplicableProcessArea() {
    let gavsArea: string[] = [];
    this.gavsserviceArea.map(function (t) {
      gavsArea.push(t.toString())
    })
    this._appservice.getApplicableProcessAreaforServiceId(gavsArea).subscribe(
      data => {
        this.ddServiceArea = data;
      },
      error => { this._util.serviceError(error); }
    )
  }
  getProcessDescription(customerId, projectId, serviceArea) {
    this._appservice.getProcessModelDescription(customerId, projectId, serviceArea).subscribe(
      data => {
        this.processDescription = data;
        this.ClearAllSelection()
        if (this.processDescription.length != 0) {
          this.LoadDDData();
          this.getApplicableProcessArea()
        }
        this.enableDiv = true
        this.isCheckAll();
      },
      error => { this._util.serviceError(error); }
    )
  }
  ClearAllSelection() {
    this.selectedProcessModel = [];
    this.selectedServiceAreas = [];
    this.gavsserviceArea = []

  }
  LoadDDData() {
    this.selectedProcessModel = [];
    this.selectedServiceAreas = [];
    this.gavsserviceArea = [];
    for (let i in this.processDescription) {
      this.selectedProcessModel.push(this.processDescription[i].modeL_ID);
      this.ddProcessModel_Onchange();
      for (let j in this.processDescription[i].servicE_AREA) {
        this.selectedServiceAreas.push(this.processDescription[i].servicE_AREA[j].areA_ID)
      }
      for (let k in this.processDescription[i].gavS_SERVICE_AREA) {
        if (!this.gavsserviceArea.includes(this.processDescription[i].gavS_SERVICE_AREA[k]))
          this.gavsserviceArea.push(this.processDescription[i].gavS_SERVICE_AREA[k])
      }

    }
  }
  isCheckAll() {
    for (let i in this.processDescription) {
      for (let j in this.processDescription[i].servicE_AREA) {
        for (let k in this.processDescription[i].servicE_AREA[j].procesS_NAME) {
          if (this.processDescription[i].servicE_AREA[j].procesS_NAME[k].applicable == false) {
            this.isCheck = false;
            return;
          }
          else
            this.isCheck = true;
        }
      }
    }
  }
  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }
  EditServiceArea(serviceAreaId) {

    this.selectedServiceArea = this.GetServiceArea(serviceAreaId);
    this.Service_GetProjectFindings(serviceAreaId);
    //this.projectFindings=this._appservice.GetFindingsForProjectPSPDSetting(this.projId);
    this.Service_GetProcessByServiceArea(serviceAreaId);

  }


  DeleteServiceArea(serviceAreaId) {

    if (confirm('Are you sure you want to delete this Service Tower ?')) {
      let map: ProjectServiceAreaProcessMappingModel = new ProjectServiceAreaProcessMappingModel();
      map.cusT_ID = this.custId;
      map.proJ_ID = this.projId;
      map.servicE_AREA_ID = serviceAreaId;
      this._appservice.DeleteServiceAreaProjectMapping(map).subscribe(data => {
        alert("Service Tower Deleted Successfully");
        this.btnLoadData_OnClick();
      }, error => { this._util.serviceError(error); });
    }
  }


  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.enableDiv = false;
    this.selectedProcessModel = [];
    this.selectedServiceAreas = [];
    this.gavsserviceArea = []
    this.ddServiceArea = [];
    this.serviceArea = [];
    this.serviceAreaProjectMappingList = [];
    this.Service_GetInscopeServiceList();
  }
  navigatetoProjectScope()
  {
    window.open('/layout/customerobjectivesnew/'+this.custId,'_blank');    
  }
  emitChanges() {
    let str: any;
    str = this.processDescription;
    this.onChange.emit(str);
  }
  SendIdtoArray(s) {
    s.iS_DIRTY = true;
    if (s.applicable == true)
      s.applicable = false;
    else
      s.applicable = true;
    this.isCheckAll()
  }

  onSelectionChange(selectedValue: any) {
    this.selectedServiceAreaToAdd = selectedValue;
  }

  checkAll(eve) {
    if (eve.checked == true) {
      for (let i in this.processDescription) {
        for (let j in this.processDescription[i].servicE_AREA) {
          for (let k in this.processDescription[i].servicE_AREA[j].procesS_NAME) {
            this.processDescription[i].servicE_AREA[j].procesS_NAME[k].applicable = true;
          }
        }
      }
    }
    else {
      for (let i in this.processDescription) {
        for (let j in this.processDescription[i].servicE_AREA) {
          for (let k in this.processDescription[i].servicE_AREA[j].procesS_NAME) {
            this.processDescription[i].servicE_AREA[j].procesS_NAME[k].applicable = false;
          }
        }
      }
    }
  }
  SaveProcessConfig() {
    this.service_saveProcessConfig(this.processDescription);
    this.emitChanges()
  }
  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem("empid"));
    return headers;
  }
  Service_GetServiceAreaProjectMapping(projectId) {
    this.serviceAreaProjectMappingList = undefined;
    this._appservice.getServiceTowersProjectMapping(projectId).subscribe(data => {
      this.serviceAreaProjectMappingList = data;      
      const serviceAreaIds = new Set(this.serviceAreaList.map(item => item.id));
      this.serviceAreaProjectMappingList = this.serviceAreaProjectMappingList.filter(item => serviceAreaIds.has(item.id));
      if (!(data.length > 0))
        alert("Please configure Service Tower applicable for the project with the help of your QA SPOC");
    }, error => { this._util.serviceError(error); });
  }
  Service_UpdateProjectServiceAreaProcessMapping(mapping: ProjectServiceAreaProcessMappingModel[]) {
    this.isProcessMapped = false;
    this._appservice.Service_UpdateProjectServiceAreaProcessMapping(mapping).subscribe(data => {
      alert("Updated Successfully");
      this.isProcessMapped = true;
      this.selectedServiceArea = undefined;
    }, error => { this._util.serviceError(error); this.isProcessMapped = true, alert(error.error); });
  }

  Service_GetProjectServiceAreaProcessMapping(projId, serviceAreaId) {

    this._appservice.GetProjectServiceAreaProcessMapping(projId, serviceAreaId).subscribe(data => {
      this.projectServiceAreaProcessMapping = data;
      let element, finding;
      for (let l of this.ProcessByServiceAreaList) {
        for (let area of l.groupByProcessArea) {
          for (let item of area.processess) {
            element = this.projectServiceAreaProcessMapping.
              find(t => t.procesS_MODEL_ID === item.procesS_MODEL_ID && t.procesS_ID === item.procesS_ID);
            if (element != undefined) {
              item.bSelected = true;
              item.procesS_TAILORING_NOTES = element.procesS_TAILORING_NOTES;
            }

            if (this.projectFindings != undefined || this.projectFindings.length > 0) {
              finding = this.projectFindings.find(x => x.procesS_MODEL_ID == item.procesS_MODEL_ID && x.procesS_ID == item.procesS_ID);
              if (finding != undefined && item.bSelected == true) {
                item.isDisabled = true;

              }
              else {
                item.isDisabled = false;
              }
            }

          }
        }
      }

      for (var model of this.ProcessByServiceAreaList) {
        for (var area of model.groupByProcessArea) {
          var checkedCount = area.processess.filter(x => x.bSelected == true).length;
          if (checkedCount == area.processess.length) {
            area.bSelected = true;
          }
          else {
            area.bSelected = false;
          }

          var disabledCount = area.processess.filter(x => x.isDisabled == true).length;
          if (disabledCount == area.processess.length && area.bSelected == true) {
            area.isDisabled = true;
          }
          else {
            area.isDisabled = false;
          }

        }
        var modelCheckedCount = model.groupByProcessArea.filter(x => x.bSelected == true).length;
        if (modelCheckedCount == model.groupByProcessArea.length) {
          model.iS_CHECKED = true;
        }
        else {
          model.iS_CHECKED = false;
        }

        var modelDisabledCount = model.groupByProcessArea.filter(x => x.isDisabled == true).length;
        if (modelDisabledCount == model.groupByProcessArea.length && model.iS_CHECKED == true) {
          model.isDisabled = true;
        }
        else {
          model.isDisabled = false;
        }

      }



      // this.ProcessByServiceAreaList.forEach(x => {
      //   if(this.IsAllCheckedOnInitialLoad(x.items))
      //     x.iS_CHECKED = true;
      //   else
      //     x.iS_CHECKED = false;
      // });
      // let ids: number[] = this.processServiceAreaMapping.map(x => x.procesS_ID);
      // var filteredProcess = this.ProcessList.filter(function (itm) {
      //   return ids.indexOf(itm.id) > -1;
      // });
      // filteredProcess.forEach((el) => { el.bSelected = true; })
    }, error => { this._util.serviceError(error); });
  }
  Service_AddServiceAreaProjectMapping(mapping) {
    this._appservice.addServiceAreaProjectMapping(mapping).subscribe(data => {
      this.Service_GetServiceAreaProjectMapping(this.projId);
    }, error => { this._util.serviceError(error); });
  } 
  Service_GetInscopeServiceList()
  {
    this.serviceAreaList = [];
    this._appservice.getServiceTowersInscopeMappingList(this.projId).subscribe(data => {
      this.serviceAreaList = data;
    }, error => { this._util.serviceError(error); });
    
  }
  service_saveProcessConfig(processDescription) {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'AddProjectProcessConfig';
    this._http.post(apiuri, processDescription, { headers: header })
      .subscribe(data => {
        alert("Saved Successfully");
      }, error => { this._util.serviceError(error); });
  }
  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header })
      .subscribe(data => {
        this.ddData = data;
        this.serviceArea = this.ddData.servicE_AREA;
      }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessByServiceArea(serviceAreaId) {
    //debugger;
    this.ProcessByServiceAreaList = undefined;
    this._appservice.GetProcessByServiceAreaGrouped(serviceAreaId).subscribe(data => {
      this.ProcessByServiceAreaList = data;      

      this.Service_GetProjectServiceAreaProcessMapping(this.projId, serviceAreaId);
    }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessModelList() {
    this._appservice.getProcessModelList().subscribe(data => {
      this.processModelList = data;
    }, error => { this._util.serviceError(error); });
  }

  Service_GetProjectFindings(serviceAreaId) {
    this._appservice.GetFindingsForProject(this.projId, serviceAreaId).subscribe(data => {

      this.projectFindings = data;

    }, error => { this._util.serviceError(error); });
  }


}
