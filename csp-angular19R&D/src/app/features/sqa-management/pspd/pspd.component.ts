import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, Input, ViewChildren, QueryList, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ProjectSelectorComponent } from '../../../shared/components/project-selector/project-selector.component';
import { DropdownFilterComponent } from '../../../shared/components/dropdown-filter/dropdown-filter.component';
import { ServiceAreaModelNew } from '../../../core/models/audit-checklist-based-model';
import { ProcessModelModel } from '../../../core/models/process-sqa-model';
import { ServiceTowersProjectMappingModel, ProcessByServiceAreaModel, ProcessByProcessArea, ServiceAreaProjectMappingModel } from '../../../core/models/service-area-project-mapping-model';
import { ProjectServiceAreaProcessMappingModel, ServiceAreaProcessModleProcessCollection } from '../../../core/models/project-service-area-process-mapping-model';
import { environment } from '../../../../environments/environment';

/**
 * PSPD Component (Process Service Tower Project Definition)
 * Migrated from LEGACY-SOURCE/src/app/pages/process-model/pspd/pspd.component.ts
 * 
 * Features:
 * - Manage Service Towers mapping to projects
 * - Configure Process Models and Process Areas
 * - Map processes to service towers
 * - Support for process tailoring notes
 * - Handle findings-related process locking
 * 
 * Angular 19 Standalone Component
 */
@Component({
  selector: 'app-pspd',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    ProjectSelectorComponent,
    DropdownFilterComponent
  ],
  templateUrl: './pspd.component.html',
  styleUrls: ['./pspd.component.scss']
})
export class PspdComponent implements OnInit {
  private _appservice = inject(AppsService);
  public _util = inject(MyUtility);
  private _router = inject(Router);
  private _http = inject(HttpClient);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);

  ddData: any;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

  serviceAreaList: any = [];
  processModelList: ProcessModelModel[] = [];
  selectedServiceAreaToAdd!: ServiceAreaModelNew;
  selectedServiceArea!: ServiceAreaModelNew;
  selectedServiceAreas: ServiceAreaModelNew[] = [];
  serviceAreaProjectMappingList: ServiceTowersProjectMappingModel[] = [];
  ProcessByServiceAreaList: ProcessByServiceAreaModel[] = [];
  projectServiceAreaProcessMapping: ProjectServiceAreaProcessMappingModel[] = [];

  custId!: string;
  projId!: string;
  currentServiceAreaId!: number; // Store the current service area being edited
  selectedProcessModel: number[] = [];
  duplicateselectedProcessModel: number[] = [];
  ddprocessModelList: any;
  serviceArea: any = [];
  processDescription: any;
  gavsserviceArea: number[] = [];
  enableDiv: Boolean = false;
  falseflag: boolean = false;
  isCheck: boolean = false;
  isProcessMapped: boolean = true;
  sortedItems: any = [];
  todayDate: Date = new Date();

  projectFindings: ProjectServiceAreaProcessMappingModel[] = [];

  @ViewChildren('AllChecked') AllChecked!: QueryList<any>;

  ddServiceArea: any;

  constructor() { }

  ngOnInit() {
    this.Service_GetProcessModelList();
  }

  IsAllCheckedOnInitialLoad(list: ServiceAreaProcessModleProcessCollection[]): boolean {
    let element = list.find(x => x.bSelected == false);
    if (element == undefined)
      return true;
    else
      return false;
  }

  ngOnChanges() {
    this.emitChanges();
  }

  btnLoadData_OnClick() {
    if (this.projId == undefined) {
      // Removed alert - validation handled by UI
    }
    else {
      this.ClearDetails();
      this.Service_GetServiceAreaProjectMapping(this.projId);
    }
  }

  isRetired(rDate: Date): boolean {
    if (rDate != null) {
      return this.todayDate > new Date(rDate);
    }
    else
      return false;
  }

  checkallNew(event: MatCheckboxChange, processList: ProcessByProcessArea[]) {
    if (event.checked) {
      processList.forEach(x => {
        x.bSelected = true;
        x.processess.forEach(p => {
          p.bSelected = true;
        });
      });
    }
    else {
      processList.forEach(x => {
        x.isDisabled == true ? x.bSelected = true : x.bSelected = false;
        x.processess.forEach(p => {
          p.isDisabled == true ? p.bSelected = true : p.bSelected = false;
        });
      });
    }
  }

  unCheckheader(event: MatCheckboxChange, processModel: ProcessByServiceAreaModel, processArea: ProcessByProcessArea) {
    if (!event.checked) {
      processModel.iS_CHECKED = false;
      processArea.processess.forEach(x => {
        x.isDisabled == true ? x.bSelected = true : x.bSelected = false;
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

  unCheckProcess(event: MatCheckboxChange, processModel: ProcessByServiceAreaModel, processArea: ProcessByProcessArea,
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
    // Safety check: ensure we have a valid service area ID
    if (!this.currentServiceAreaId) {
      console.error('No service area selected for saving');
      return;
    }

    let mapping: ProjectServiceAreaProcessMappingModel[] = [];
    for (let l of this.ProcessByServiceAreaList) {
      for (let area of l.groupByProcessArea) {
        for (let item of area.processess) {
          if (item.bSelected || item.iS_DIRTY) {
            let map: ProjectServiceAreaProcessMappingModel = new ProjectServiceAreaProcessMappingModel();
            map.cusT_ID = this.custId;
            map.proJ_ID = this.projId;
            map.servicE_AREA_ID = this.currentServiceAreaId; // Use stored service area ID
            map.procesS_MODEL_ID = item.procesS_MODEL_ID;
            map.procesS_Area_ID = item.procesS_AREA_ID;
            map.procesS_ID = item.procesS_ID;
            map.procesS_TAILORING_NOTES = item.procesS_TAILORING_NOTES;

            if (this.projectServiceAreaProcessMapping != undefined && this.projectServiceAreaProcessMapping.length > 0) {
              let existingData = this.projectServiceAreaProcessMapping.filter(x => 
                x.procesS_MODEL_ID == map.procesS_MODEL_ID && x.procesS_ID == map.procesS_ID && x.isactive);
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
    this.selectedServiceArea = undefined!;
    this.currentServiceAreaId = undefined!; // Clear the stored service area ID
    this.ProcessByServiceAreaList = [];
  }

  btnAddServiceArea_OnClick() {
    if (this.projId == undefined) {
      // Removed alert - validation handled by UI
    }
    else if (this.selectedServiceAreaToAdd == undefined) {
      // Removed alert - validation handled by UI
    }
    else {
      let mapping: ServiceAreaProjectMappingModel = new ServiceAreaProjectMappingModel();
      mapping.cusT_ID = this.custId;
      mapping.proJ_ID = this.projId;
      mapping.servicE_AREA_ID = this.selectedServiceAreaToAdd.id;
      this.Service_AddServiceAreaProjectMapping(mapping);
    }
  }

  getServiceCatalogue(processModel: any) {
    this._appservice.getServiceAreaforModel(processModel).subscribe(
      data => {
        this.ddServiceArea = data;
      },
      error => { this._util.serviceError(error); }
    );
  }

  getDropDownParams() {
    this.service_getDropDownDataForAudit();
  }

  GetServiceArea(id: number): ServiceAreaModelNew {
    let sa = this.serviceAreaList.filter((t: any) => t.id == id);
    if (sa.length > 0) {
      return sa[0];
    }
    else
      return undefined!;
  }

  GetServiceAreaName(id: number): string {
    let sa = this.serviceAreaList.filter((t: any) => t.id == id);
    if (sa.length > 0) {
      return sa[0].title;
    }
    else
      return undefined!;
  }

  GetProcessModelName(id: number): string {
    let sa = this.processModelList.filter(t => t.id == id);
    if (sa.length > 0) {
      return sa[0].title;
    }
    else
      return '';
  }

  ddProcessModel_Onchange() {
    this.getDropDownParams();
  }

  ddServiceArea_Onchange() {
    this.getProcessDescription(this.custId, this.projId, this.selectedServiceArea);
  }

  logout() {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to log out?',
      'Logout'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        if (this._util.IsGAVS()) {
          this.service_Logout();
          let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + 
            '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
          window.location.href = loginurl;
        }
        else {
          this.service_Logout();
          this._router.navigateByUrl('/login');
        }
      }
    });
  }

  getApplicableProcessArea() {
    let gavsArea: string[] = [];
    this.gavsserviceArea.map(function (t) {
      gavsArea.push(t.toString());
    });
    this._appservice.getApplicableProcessAreaforServiceId(gavsArea).subscribe(
      data => {
        this.ddServiceArea = data;
      },
      error => { this._util.serviceError(error); }
    );
  }

  getProcessDescription(customerId: string, projectId: string, serviceArea: any) {
    this._appservice.getProcessModelDescription(customerId, projectId, serviceArea).subscribe(
      data => {
        this.processDescription = data;
        this.ClearAllSelection();
        if (this.processDescription.length != 0) {
          this.LoadDDData();
          this.getApplicableProcessArea();
        }
        this.enableDiv = true;
        this.isCheckAll();
      },
      error => { this._util.serviceError(error); }
    );
  }

  ClearAllSelection() {
    this.selectedProcessModel = [];
    this.selectedServiceAreas = [];
    this.gavsserviceArea = [];
  }

  LoadDDData() {
    this.selectedProcessModel = [];
    this.selectedServiceAreas = [];
    this.gavsserviceArea = [];
    for (let i in this.processDescription) {
      this.selectedProcessModel.push(this.processDescription[i].modeL_ID);
      this.ddProcessModel_Onchange();
      for (let j in this.processDescription[i].servicE_AREA) {
        this.selectedServiceAreas.push(this.processDescription[i].servicE_AREA[j].areA_ID);
      }
      for (let k in this.processDescription[i].gavS_SERVICE_AREA) {
        if (!this.gavsserviceArea.includes(this.processDescription[i].gavS_SERVICE_AREA[k]))
          this.gavsserviceArea.push(this.processDescription[i].gavS_SERVICE_AREA[k]);
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

  EditServiceArea(serviceAreaId: number) {
    this.currentServiceAreaId = serviceAreaId; // Store the service area ID
    this.selectedServiceArea = this.GetServiceArea(serviceAreaId);
    this.Service_GetProjectFindings(serviceAreaId);
    this.Service_GetProcessByServiceArea(serviceAreaId);
  }

  DeleteServiceArea(serviceAreaId: number) {
    this._util.showDeleteConfirmation(
      'Are you sure you want to delete this Service Tower?',
      'Confirm Delete'
    ).subscribe((result: boolean) => {
      if (result) {
        let map: any = {
          cusT_ID: this.custId,
          proJ_ID: this.projId,
          servicE_AREA_ID: serviceAreaId
        };
        this._appservice.DeleteServiceAreaProjectMapping(map).subscribe(data => {
          this._snackBar.open('Service Tower deleted successfully', '✕', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.btnLoadData_OnClick();
        }, error => { 
          this._util.serviceError(error);
          this._snackBar.open('Failed to delete Service Tower', '✕', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        });
      }
    });
  }

  project_onChange($event: string) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    this.enableDiv = false;
    this.selectedProcessModel = [];
    this.selectedServiceAreas = [];
    this.gavsserviceArea = [];
    this.ddServiceArea = [];
    this.serviceArea = [];
    this.serviceAreaProjectMappingList = [];
    this.Service_GetInscopeServiceList();
  }

  navigatetoProjectScope() {
    window.open('/layout/customerobjectivesnew/' + this.custId, '_blank');
  }

  emitChanges() {
    let str: any;
    str = this.processDescription;
    this.onChange.emit(str);
  }

  SendIdtoArray(s: any) {
    s.iS_DIRTY = true;
    if (s.applicable == true)
      s.applicable = false;
    else
      s.applicable = true;
    this.isCheckAll();
  }

  checkAll(eve: MatCheckboxChange) {
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
    this.emitChanges();
  }

  GetAuthHeader(): HttpHeaders {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    headers = headers.append('empId', localStorage.getItem("empid") || '');
    return headers;
  }

  Service_GetServiceAreaProjectMapping(projectId: string) {
    this.serviceAreaProjectMappingList = [];
    this._appservice.getServiceTowersProjectMapping(projectId).subscribe(data => {
      this.serviceAreaProjectMappingList = data;
      const serviceAreaIds = new Set(this.serviceAreaList.map((item: any) => item.id));
      this.serviceAreaProjectMappingList = this.serviceAreaProjectMappingList.filter(item => 
        serviceAreaIds.has(item.id));
      this.sortItems();
    }, error => { this._util.serviceError(error); });
  }

  sortItems() {
    const activeItems = this.serviceAreaProjectMappingList.filter(item => 
      !this.isRetired(item.retiremenT_DATE));
    const retiredItems = this.serviceAreaProjectMappingList.filter(item => 
      this.isRetired(item.retiremenT_DATE));
    this.sortedItems = [...activeItems, ...retiredItems];
  }

  Service_UpdateProjectServiceAreaProcessMapping(mapping: ProjectServiceAreaProcessMappingModel[]) {
    this.isProcessMapped = false;
    this._appservice.Service_UpdateProjectServiceAreaProcessMapping(mapping).subscribe(data => {
      this._snackBar.open('Process mapping updated successfully', '✕', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      this.isProcessMapped = true;
      this.selectedServiceArea = undefined!;
    }, error => { 
      this._util.serviceError(error); 
      this._snackBar.open('Failed to update process mapping', '✕', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.isProcessMapped = true;
    });
  }

  Service_GetProjectServiceAreaProcessMapping(projId: string, serviceAreaId: number) {
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

            if (this.projectFindings != undefined && this.projectFindings.length > 0) {
              finding = this.projectFindings.find(x => 
                x.procesS_MODEL_ID == item.procesS_MODEL_ID && x.procesS_ID == item.procesS_ID);
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
    }, error => { this._util.serviceError(error); });
  }

  Service_AddServiceAreaProjectMapping(mapping: ServiceAreaProjectMappingModel) {
    this._appservice.addServiceAreaProjectMapping(mapping).subscribe(data => {
      this._snackBar.open('Service Tower added successfully', '✕', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      this.selectedServiceAreaToAdd = undefined!; // Clear the dropdown selection
      this.Service_GetServiceAreaProjectMapping(this.projId);
    }, error => { 
      // Check if the error message indicates duplicate mapping
      const errorMessage = error?.error?.message || error?.error || error?.message || '';
      if (errorMessage.includes('exists already') || errorMessage.includes('SERVICE TOWER PROJECT MAPPING exists already')) {
        this._util.showWarningPopup(
          'SERVICE TOWER PROJECT MAPPING exists already.',
          'Duplicate Entry'
        );
      } else {
        this._util.serviceError(error);
        this._snackBar.open('Failed to add Service Tower', '✕', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  Service_GetInscopeServiceList() {
    this.serviceAreaList = [];
    this._appservice.getServiceTowersInscopeMappingList(this.projId).subscribe(data => {
      this.serviceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }

  service_saveProcessConfig(processDescription: any) {
    let header = new HttpHeaders({ 
      'Accept': 'application/json', 
      'token': this._util.AppSettings.token, 
      'empId': localStorage.getItem("empid") || '' 
    });
    let apiuri: string = environment.webapiuri + 'AddProjectProcessConfig';
    this._http.post(apiuri, processDescription, { headers: header })
      .subscribe(data => {
        this._snackBar.open('Process configuration saved successfully', '✕', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }, error => { 
        this._util.serviceError(error);
        this._snackBar.open('Failed to save process configuration', '✕', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      });
  }

  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 
      'Accept': 'application/json', 
      'token': this._util.AppSettings.token 
    });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header })
      .subscribe(data => {
        this.ddData = data;
        this.serviceArea = (this.ddData as any).servicE_AREA;
      }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessByServiceArea(serviceAreaId: number) {
    this.ProcessByServiceAreaList = [];
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

  Service_GetProjectFindings(serviceAreaId: number) {
    this._appservice.GetFindingsForProject(this.projId, serviceAreaId).subscribe(data => {
      this.projectFindings = data;
    }, error => { this._util.serviceError(error); });
  }

  /**
   * Check if any process in the process area is selected
   * Helper method for HTML template
   */
  hasSelectedProcess(processArea: ProcessByProcessArea): boolean {
    return processArea.processess && processArea.processess.some((p: any) => p.bSelected) || false;
  }

  /**
   * Compare function for mat-select to properly handle object comparison
   * Compares service area objects by their ID
   */
  compareServiceAreaObjects(obj1: any, obj2: any): boolean {
    return obj1 && obj2 && obj1.id === obj2.id;
  }
}
