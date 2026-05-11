import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ProcessAreaModelNew, ProcessModelNew, ProcessModelProcessMapping } from '../../../core/models/audit-checklist-based-model';

@Component({
  selector: 'app-process-process-model-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './process-process-model-view.component.html',
  styleUrls: ['./process-process-model-view.component.scss']
})
export class ProcessProcessModelViewComponent implements OnInit, AfterViewInit {

  selectedProcessArea: ProcessAreaModelNew[] = [];

  searchValuePML: string = "";
  MasterProcessModelListPML: ProcessModelNew[] = [];
  ProcessModelList: ProcessModelNew[] = [];
  MasterProcessModelList: ProcessModelNew[] = [];
  allMapping: ProcessModelProcessMapping[] = [];
  selectedProcessModel: ProcessModelNew[] = [];
  ProcessList: any[] = [];
  OriginalProcessList: any[] = [];
  OriginalProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessAreaList: ProcessAreaModelNew[] = [];
  searchValuePAL: string = "";
  MasterProcessAreaList1: ProcessAreaModelNew[] = [];
  OriginalmappingList: ProcessModelNew[] = [];
  mappingList: ProcessModelNew[] = [];

  dataSource!: MatTableDataSource<any>;
  displayedColumns = ["index", "procesS_MODEL", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "clausE_REFERENCE"];

  @ViewChild('paginator') paginator!: MatPaginator;
  ProcessModelReferenceList: any;

  constructor(
    private _util: MyUtility,
    private _appservice: AppsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.ProcessAreaList.length == 0)
      this.ProcessAreaList.push(...this.selectedProcessArea);
    this.Service_GetProcessAreaList();
    this.Service_GetAllProcessListByProcessModel();
    this.Service_GetProcessList();
    this.Service_GetProcessModelProcessMapping();
    this.getAllProcessModelReferenceList();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.refreshTable(this.ProcessList);
    });
  }

  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe({
      next: (data: any) => {
        this.MasterProcessModelList = data;
        this.ProcessModelList = data;
        this.MasterProcessModelListPML = data;
        this.determineIfMapped();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessModelProcessMapping() {
    this._appservice.GetAllProcessProcessModelMapping().subscribe({
      next: (data: any) => {
        this.allMapping = data;
        this.Service_GetProcessModelList();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe({
      next: (data: any) => {
        this.ProcessAreaList = data;
        this.OriginalProcessAreaList = data;
        this.MasterProcessAreaList1 = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetAllProcessListByProcessModel() {
    this._appservice.getAllProcessList().subscribe({
      next: (data: any) => {
        this.OriginalProcessList = data;
        this.ProcessList = data;
        this.refreshTable(this.ProcessList);
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe({
      next: (data: any) => {
        this.OriginalmappingList = data;
        this.mappingList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  openedChangePML(opened: boolean) {
    this.searchValuePML = "";
    this.applyFilterForProcessModel(this.searchValuePML);
  }

  applyFilterForProcessModel(filterValue: string) {
    this.ProcessModelList = this.MasterProcessModelListPML.filter((p: any) =>
      p.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  determineIfMapped() {
    this.ProcessModelList.forEach((x: any) => {
      let element = this.allMapping.find((y: any) => y.procesS_MODEL_ID == x.id);
      if (element == undefined)
        x.isMapped = false;
      else
        x.isMapped = true;
    });
  }

  OnfilterChange() {
    this.retainOriginalValues();
    let processModelIds: any = [];
    let processAreaIds: any = [];
    let tempProcess: any = [];
    
    if (this.selectedProcessModel != undefined && this.selectedProcessModel.length > 0) {
      processModelIds = this.selectedProcessModel.map((x: any) => x.id);
      this.ProcessList = this.OriginalProcessList.filter((x: any) => processModelIds.indexOf(x.procesS_MODEL_ID) > -1);

      this.ProcessList.forEach((x: any) => {
        if (processModelIds.indexOf(x.procesS_MODEL_ID) > -1) {
          x.bSelected = true;
          tempProcess.push(x);
        }
      });
      
      processAreaIds = tempProcess.map((x: any) => x.procesS_AREA_ID).filter((x: any, i: any, a: any) => a.indexOf(x) == i);
      this.selectedProcessArea = this.OriginalProcessAreaList.filter((x: any) => processAreaIds.indexOf(x.id) > -1);

      this.selectedProcessArea.forEach((x: any) => {
        x.checked = true;
      });
      this.ProcessAreaList = this.selectedProcessArea;
      this.MasterProcessAreaList1 = this.selectedProcessArea;
    } else {
      this.selectedProcessArea = [];
      this.ProcessList = this.OriginalProcessList;
    }
    this.refreshTable(this.ProcessList);
  }

  retainOriginalValues() {
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
  }

  createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');
      return searchTerms.every((term: string) => {
        return (
          (data.procesS_AREA || '').toLowerCase().includes(term) ||
          (data.procesS_MODEL_NAME || '').toLowerCase().includes(term) ||
          (data.procesS_TITLE || '').toLowerCase().includes(term) ||
          (data.procesS_DESCRIPTION || '').toLowerCase().includes(term)
        );
      });
    };
  }

  refreshTable(source: any) {
    this.dataSource = new MatTableDataSource(source);
    this.dataSource.filterPredicate = this.createFilter();
    this.dataSource.filter = ''; // Clear any existing filter
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.cdr.detectChanges();
  }

  openedChangeFPAL(opened: boolean) {
    this.searchValuePAL = "";
    this.applyFilterForProcessArea(this.searchValuePAL);
  }

  applyFilterForProcessArea(filterValue: string) {
    this.ProcessAreaList = this.MasterProcessAreaList1.filter((p: any) =>
      p.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  clear() {
    this.selectedProcessArea = [];
    this.selectedProcessModel = [];
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.refreshTable(this.ProcessList);
  }

  OnView_ProcessAreafilterChange() {
    this.retainOriginalValues();
    let processAreaIds: any = [];
    
    if (this.selectedProcessArea != undefined && this.selectedProcessArea.length > 0) {
      processAreaIds = this.selectedProcessArea.map((x: any) => x.id);
      this.ProcessList = this.OriginalProcessList.filter((x: any) => processAreaIds.indexOf(x.procesS_AREA_ID) > -1);
    } else {
      this.ProcessList = this.OriginalProcessList;
    }

    this.refreshTable(this.ProcessList);
  }

  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (filterValue) {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }

  getAllProcessModelReferenceList() {
    this._appservice.getAllProcessModelReferenceList().subscribe({
      next: (data: any) => {
        this.ProcessModelReferenceList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getProcessModelReference(modelReferenceList: number[]): string {
    if (this.ProcessModelReferenceList && this.ProcessModelReferenceList.length > 0 &&
      modelReferenceList && modelReferenceList.length > 0) {
      const ProcessModelNames = this.ProcessModelReferenceList
        .filter((model: any) => model.items.some((item: any) => modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST)))
        .map((model: any) => {
          const selectedNames = model.items
            .filter((item: any) => modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST))
            .map((item: any) => `${item.sectioN_REFERENCE}`)
            .join(', ');
          return `<strong>${model.procesS_MODEL_NAME}</strong> - ${selectedNames}`;
        })
        .join(', ');

      return ProcessModelNames;
    }
    return '';
  }
}
