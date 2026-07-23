/**
 * Objective User Component - Migrated from Legacy
 * Manages Process Objectives and their mapping to Processes
 * Allows filtering by Process Model, Process Area, and Service Tower
 */

import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import {
  ObjectiveNew,
  ProcessObjectiveMapping,
  ServiceAreaModelNew,
  ProcessServiceAreaMapping,
  ProcessModelProcessMapping,
  ProcessAreaModelNew,
  ProcessModelNew
} from '../../../core/models/audit-checklist-based-model';

@Component({
  selector: 'app-objective-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './objective-user.component.html',
  styleUrls: ['./objective-user.component.scss']
})
export class ObjectiveUserComponent implements OnInit {
  
  // Data collections
  selectedProcessModel: ProcessModelNew | undefined;
  selectedProcessArea: ProcessAreaModelNew | undefined;
  ServiceAreaList: ServiceAreaModelNew[] = [];
  bAddNewObjective: boolean = false;
  ProcessList: ProcessModelNew[] = [];
  iEditIndex = -1;

  ObjectivesList: ObjectiveNew[] = [];
  selectedObjective: ObjectiveNew | undefined;
  newObjective: ObjectiveNew = new ObjectiveNew();

  ProcessAreaList: ProcessAreaModelNew[] = [];
  originalProcessAreaList: ProcessAreaModelNew[] = [];

  processObjectiveMapping: ProcessObjectiveMapping[] = [];
  dataSource: MatTableDataSource<ProcessModelNew> = new MatTableDataSource<ProcessModelNew>();

  displayedColumns = ["index", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "edit"];
  ProcessModelList: ProcessModelNew[] = [];
  processModelProcessMapping: ProcessModelProcessMapping[] = [];
  tempList: ProcessModelNew[] = [];
  allMapping: ProcessModelProcessMapping[] = [];
  allServiceAreaMapping: ProcessServiceAreaMapping[] = [];
  originalServiceAreaList: ServiceAreaModelNew[] = [];
  selectedServiceArea: ServiceAreaModelNew | undefined;
  allObjectivesMapping: ProcessObjectiveMapping[] = [];
  originalObjectivesList: ObjectiveNew[] = [];
  
  @ViewChild('paginator') paginator!: MatPaginator;

  private _util = inject(MyUtility);
  private _appservice = inject(AppsService);

  ngOnInit() {
    this.Service_GetProcessList();
    this.Service_GetProcessAreaList();
    this.Service_GetProcessModelList();
    this.Service_GetServiceAreaList();
    this.Service_GetProcessModelProcessMapping();
    this.Service_GetServiceAreaProcessMapping();
    this.Service_GetObjectivesProcessMapping();
  }

  async Service_GetObjectivesProcessMapping() {
    this._appservice.getAllProcessObjectiveMapping().subscribe({
      next: (data: any[]) => {
        this.allObjectivesMapping = data;
        this.Service_GetObjectivesList();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessModelProcessMapping() {
    this._appservice.GetAllProcessProcessModelMapping().subscribe({
      next: (data: any[]) => {
        this.allMapping = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetServiceAreaProcessMapping() {
    this._appservice.getServiceAreaProcessMapping().subscribe({
      next: (data: any[]) => {
        this.allServiceAreaMapping = data;
        this.Service_GetServiceAreaList();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getServiceAreaForAModel() {
    if (!this.selectedProcessModel) return;
    
    this.ProcessList.forEach(x => x.bSelected = false);
    const processIds = this.allMapping
      .filter(x => x.procesS_MODEL_ID === this.selectedProcessModel!.id)
      .map(y => y.procesS_ID);

    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });
    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  getProcessAreaForServiceArea() {
    if (!this.selectedServiceArea) return;
    
    this.ProcessList.forEach(x => x.bSelected = false);
    const processIds = this.allServiceAreaMapping
      .filter(x => x.servicE_AREA_ID === this.selectedServiceArea!.id)
      .map(x => x.procesS_ID);

    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });
    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  getObjectivesForProcessArea() {
    if (!this.selectedProcessArea) return;
    
    this.ProcessList.forEach(x => x.bSelected = false);
    const processIds = this.ProcessList
      .filter(x => x.procesS_AREA_ID === this.selectedProcessArea!.id)
      .map(y => y.id);

    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });
    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  btnAddObjective_Onclick() {
    this.bAddNewObjective = true;
    this.newObjective = new ObjectiveNew();
  }

  btnCancelObjective_Onclick() {
    this.bAddNewObjective = false;
  }

  btnSaveObjective_Onclick() {
    if (this.newObjective.title && this.newObjective.description) {
      this.service_AddObjective(this.newObjective);
    } else {
      this._util.showError("Please enter required fields");
      return;
    }
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe({
      next: (data: any[]) => {
        this.ServiceAreaList = data as any;
        this.originalServiceAreaList = data as any;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  ddProcessModelChange() {
    if (this.selectedProcessModel) {
      this.Service_GetProcessByProcessModel(this.selectedProcessModel.id);
    }
  }

  Service_GetProcessByProcessModel(processModelId: number) {
    // Implementation kept as per legacy
  }

  service_AddObjective(objective: ObjectiveNew) {
    this._appservice.AddObjectiveNew(objective).subscribe({
      next: (data: any) => {
        this.Service_GetObjectivesList();
        this._util.showSuccess("Objective Added Successfully");
        this.bAddNewObjective = false;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe({
      next: (data: any[]) => {
        this.ProcessModelList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetObjectivesList() {
    this._appservice.getObjectivesList().subscribe({
      next: (data: any[]) => {
        this.ObjectivesList = data;
        this.originalObjectivesList = data;
        this.determineIfMapped();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  determineIfMapped() {
    this.ObjectivesList.forEach(x => {
      const element = this.allObjectivesMapping.find(y => y.objectiveS_ID === x.id);
      x.isMapped = element !== undefined;
    });
    this.ObjectivesList.sort((a, b) => {
      return Number(a.isMapped) - Number(b.isMapped);
    });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe({
      next: (data: any[]) => {
        this.ProcessList = data;
        this.refreshtable(this.ProcessList);
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  refreshtable(data: ProcessModelNew[]) {
    this.dataSource = new MatTableDataSource(data);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe({
      next: (data: any[]) => {
        this.ProcessAreaList = data;
        this.originalProcessAreaList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  clear() {
    this.selectedProcessArea = undefined;
    this.selectedProcessModel = undefined;
    this.selectedServiceArea = undefined;
    this.selectedObjective = undefined;
    this.ProcessAreaList = this.originalProcessAreaList;
    this.ServiceAreaList = this.originalServiceAreaList;
    this.ObjectivesList = this.originalObjectivesList;
    this.ProcessList.forEach(x => x.bSelected = false);
    this.refreshtable(this.ProcessList);
  }

  getProcessArea(id: number): string {
    const processA = this.originalProcessAreaList.filter(t => t.id === id);
    if (processA && processA.length > 0) {
      return processA[0].title;
    }
    return '';
  }

  SaveRow_onClick() {
    const checkedProcess = this.ProcessList.filter(t => t.bSelected);
    if (checkedProcess.length > 0 && this.selectedObjective) {
      this.service_UpdateProcessObjectiveMapping(this.selectedObjective, checkedProcess);
    } else {
      this._util.showError("Please choose required fields");
      return;
    }
  }

  service_UpdateProcessObjectiveMapping(objective: ObjectiveNew, checkedProcess: ProcessModelNew[]) {
    this._appservice.UpdateProcessObjectiveMapping(objective, checkedProcess).subscribe({
      next: (data: any) => {
        this._util.showSuccess("Objective - Process Mapping done Successfully");
        this.newObjective = new ObjectiveNew();
      },
      error: (error: any) => { this._util.serviceError(error); },
      complete: async () => {
        this.clear();
        await this.Service_GetObjectivesProcessMapping();
        this.determineIfMapped();
      }
    });
  }

  ddObjectiveChange() {
    if (!this.selectedObjective) return;
    
    this.ProcessList.forEach((el) => { el.bSelected = false; });
    const processIds = this.allObjectivesMapping
      .filter(x => x.objectiveS_ID === this.selectedObjective!.id)
      .map(y => y.procesS_ID);
      
    this.ProcessList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
      }
    });

    this.ProcessList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshtable(this.ProcessList);
  }

  Service_GetProcessByObjective(Objectiveid: number) {
    this._appservice.GetProcessByObjective(Objectiveid).subscribe({
      next: (data: any[]) => {
        this.processObjectiveMapping = data;
        const ids: number[] = this.processObjectiveMapping.map(x => x.procesS_ID);
        const filteredProcess = this.ProcessList.filter(itm => ids.indexOf(itm.id) > -1);
        filteredProcess.forEach((el) => { el.bSelected = true; });
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }
}
