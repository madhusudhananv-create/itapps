import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import {
  ProcessAreaModelNew,
  ProcessModelNew,
  ProcessModelProcessMapping
} from '../../../core/models/audit-checklist-based-model';

@Component({
  selector: 'app-process-process-model-mapping',
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
    MatCheckboxModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatOptionModule
  ],
  templateUrl: './process-process-model-mapping.component.html',
  styleUrl: './process-process-model-mapping.component.scss'
})
export class ProcessProcessModelMappingComponent implements OnInit, AfterViewInit {

  // ── Injected services ──────────────────────────────────────────────────
  private readonly _util        = inject(MyUtility);
  private readonly _appservice  = inject(AppsService);
  private readonly cdr          = inject(ChangeDetectorRef);

  // ── State flags ────────────────────────────────────────────────────────
  isProcessModelMapped: boolean = true;

  // ── Data lists ─────────────────────────────────────────────────────────
  ProcessModelList:       any[]                         = [];
  MasterProcessModelList: any[]                         = [];
  ProcessAreaList:        ProcessAreaModelNew[]          = [];
  ProcessList:            any[]                         = [];
  OriginalProcessList:    any[]                         = [];
  selectedProcessArea:    ProcessAreaModelNew[]          = [];
  selectedProcessModel:   ProcessModelNew[]              = [];
  selectedProcessModel1:  ProcessModelNew                = new ProcessModelNew();
  selectedProcessArea1:   ProcessAreaModelNew[]          = [];

  processModelProcessMapping: ProcessModelProcessMapping[]  = [];
  allMapping:                 ProcessModelProcessMapping[]  = [];
  OriginalProcessAreaList:    ProcessAreaModelNew[]          = [];
  ProcessAreaList1:           ProcessAreaModelNew[]          = [];
  MasterProcessAreaList1:     ProcessAreaModelNew[]          = [];

  OriginalmappingList:        ProcessModelNew[]              = [];
  mappingList:                ProcessModelNew[]              = [];

  // ── Search state ───────────────────────────────────────────────────────
  searchValue:        string = '';
  searchValuePAL:     string = '';
  searchValuePML:     string = '';
  SearchProcessAreaList: string = '';

  // ── Dropdown toggle flags ──────────────────────────────────────────────
  list:    boolean = false;
  listPAL: boolean = false;

  // ── Table config ───────────────────────────────────────────────────────
  displayedColumns1 = [
    'index',
    'procesS_AREA_ID',
    'procesS_NAME',
    'procesS_DESCRIPTION',
    'clausE_REFERENCE',
    'edit'
  ];

  dataSource1!: MatTableDataSource<any>;

  // ── Process model reference list ───────────────────────────────────────
  ProcessModelReferenceList: any;
  MasterProcessModelListPML: ProcessModelNew[] = [];

  // ── Tooltip text ───────────────────────────────────────────────────────
  ProcessModelToolTip: string =
    'To know the existing process area and processes that are mapped to a process model, ' +
    'first select a process model near to process model.';

  // ── Edit index for inline clause reference select ──────────────────────
  iEditIndex: number = -1;

  // ── ViewChild ──────────────────────────────────────────────────────────
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.ProcessAreaList.length === 0) {
      this.ProcessAreaList.push(...this.selectedProcessArea);
    }
    this.Service_GetProcessAreaList();
    this.Service_GetAllProcessListByProcessModel();
    this.Service_GetProcessList();
    this.getAllProcessModelReferenceList();
    this.Service_GetProcessModelProcessMapping();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.refreshTable1(this.mappingList);
    });
  }

  // ── API calls ──────────────────────────────────────────────────────────

  Service_GetProcessModelProcessMapping(): void {
    this._appservice.GetAllProcessProcessModelMapping().subscribe({
      next: (data: any) => {
        this.allMapping = data;
        this.Service_GetProcessModelList();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetAllProcessListByProcessModel(): void {
    this._appservice.getAllProcessList().subscribe({
      next: (data: any) => {
        this.OriginalProcessList = data;
        this.ProcessList = data;
        this.clear();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessList(): void {
    this._appservice.getProcessList().subscribe({
      next: (data: any) => {
        this.OriginalmappingList = data;
        this.mappingList = data;
        this.refreshTable1(this.mappingList);
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessAreaList(): void {
    this._appservice.getProcessAreaList().subscribe({
      next: (data: any) => {
        this.ProcessAreaList        = data;
        this.OriginalProcessAreaList = data;
        this.ProcessAreaList1        = data;
        this.MasterProcessAreaList1  = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessModelList(): void {
    this._appservice.getProcessModel().subscribe({
      next: (data: any) => {
        this.MasterProcessModelList    = data;
        this.ProcessModelList          = data;
        this.MasterProcessModelListPML = data;
        this.determineIfMapped();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  service_UpdateProcessMapping(processModel: ProcessModelNew, processList: ProcessModelNew[]): void {
    this.isProcessModelMapped = false;
    this._appservice.UpdateProcessMapping(processModel, processList).subscribe({
      next: () => {
        this._util.showSuccess('Saved Successfully');
        this.isProcessModelMapped = true;
        this.clear1();
        this.Service_GetAllProcessListByProcessModel();
        this.Service_GetProcessModelProcessMapping();
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.isProcessModelMapped = true;
      }
    });
  }

  service_UpdateProcessArea(processArea: ProcessAreaModelNew): void {
    this._appservice.UpdateProcessArea(processArea).subscribe({
      next: () => {
        this.Service_GetProcessAreaList();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getAllProcessModelReferenceList(): void {
    this._appservice.getAllProcessModelReferenceList().subscribe({
      next: (data: any) => {
        this.ProcessModelReferenceList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  // ── Table ──────────────────────────────────────────────────────────────

  refreshTable1(source: any[]): void {
    this.dataSource1 = new MatTableDataSource(source);
    this.dataSource1.paginator = this.paginator1;
    this.cdr.detectChanges();
  }

  // ── Clear / reset ──────────────────────────────────────────────────────

  clear(): void {
    this.selectedProcessArea  = [];
    this.selectedProcessModel = [];
    this.ProcessList = this.OriginalProcessList;
  }

  clear1(): void {
    this.selectedProcessModel1 = new ProcessModelNew();
    this.selectedProcessArea1  = [];
    this.mappingList = [...this.OriginalmappingList];
    this.mappingList.forEach((x: any) => x.bSelected = false);
    this.refreshTable1(this.mappingList);
  }

  // ── Save ───────────────────────────────────────────────────────────────

  SaveRow_onClick(): void {
    const checkedProcess = this.mappingList.filter((t: any) => t.bSelected);
    if (checkedProcess.length > 0 && this.selectedProcessModel1.id > 0) {
      this.service_UpdateProcessMapping(this.selectedProcessModel1, checkedProcess);
    } else {
      this._util.showError('Please select Process Model and Process Area');
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  getProcessArea(id: number): string {
    const processA = this.OriginalProcessAreaList.filter((t: any) => t.id === id);
    if (processA && processA.length > 0) {
      return processA[0].title;
    }
    return '';
  }

  getProcessModel(processId: number): string {
    const processModelIds = this.allMapping
      .filter((x: any) => x.procesS_ID === processId)
      .map((x: any) => x.procesS_MODEL_ID);

    if (processModelIds && processModelIds.length > 0) {
      const match = this.ProcessModelList.find((x: any) => x.id === processModelIds[0]);
      return match ? match.title : '';
    }
    return '';
  }

  getProcessModelReference(modelReferenceList: number[]): string {
    if (
      this.ProcessModelReferenceList &&
      this.ProcessModelReferenceList.length > 0 &&
      modelReferenceList &&
      modelReferenceList.length > 0
    ) {
      return this.ProcessModelReferenceList
        .filter((model: any) =>
          model.items.some((item: any) => modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST))
        )
        .map((model: any) => {
          const selectedNames = model.items
            .filter((item: any) => modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST))
            .map((item: any) => `${item.sectioN_REFERENCE}`)
            .join(', ');
          return `<strong>${model.procesS_MODEL_NAME}</strong> - ${selectedNames}`;
        })
        .join(', ');
    }
    return '';
  }

  determineIfMapped(): void {
    this.ProcessModelList.forEach((x: any) => {
      const element = this.allMapping.find((y: any) => y.procesS_MODEL_ID === x.id);
      x.isMapped = element !== undefined;
    });
  }

  // ── Filters ────────────────────────────────────────────────────────────

  applyProcessModelList(filterValue: string): void {
    this.ProcessModelList = this.MasterProcessModelList.filter((p: any) =>
      p.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  applyProcessAreaList1(filterValue: string): void {
    this.ProcessAreaList1 = this.MasterProcessAreaList1.filter((p: any) =>
      this.selectedProcessArea1.some((x: any) => x.title === p.title) ||
      p.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  applyFilterForProcessModel(filterValue: string): void {
    this.ProcessModelList = this.MasterProcessModelListPML.filter((p: any) =>
      p.title.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  ddProcessModelChange(): void {
    this.ProcessList.forEach((el: any) => { el.bSelected = false; });
  }

  // ── Dropdown open/close events ─────────────────────────────────────────

  openedChange(opened: boolean): void {
    this.searchValue = '';
    this.applyProcessModelList(this.searchValue);
  }

  openedChangePAL(opened: boolean): void {
    this.searchValuePAL = '';
    this.applyProcessAreaList1(this.searchValuePAL);
  }

  openedChangePML(opened: boolean): void {
    this.searchValuePML = '';
    this.applyFilterForProcessModel(this.searchValuePML);
  }

  toggleList(): void {
    this.list = !this.list;
  }

  toggleProcessAreaList(): void {
    this.listPAL = !this.listPAL;
    this.SearchProcessAreaList = '';
    this.applyProcessAreaList1(this.SearchProcessAreaList);
  }

  // ── Process model / area filter change ────────────────────────────────

  OnProcessModelfilterChange(): void {
    this.mappingList     = [...this.OriginalmappingList];
    this.ProcessAreaList1 = [...this.OriginalProcessAreaList];
    this.mappingList.forEach((x: any) => x.bSelected = false);

    let processIds:    number[] = [];
    let processAreaIds: number[] = [];
    const tempProcess:  any[]   = [];

    if (this.selectedProcessModel1.id > 0) {
      processIds = this.allMapping
        .filter((x: any) => x.procesS_MODEL_ID === this.selectedProcessModel1.id && x.isactive)
        .map((y: any) => y.procesS_ID);

      this.mappingList.forEach((x: any) => {
        if (processIds.indexOf(x.id) > -1) {
          x.bSelected = true;
          tempProcess.push(x);
        }
      });

      processAreaIds = tempProcess.map((x: any) => x.procesS_AREA_ID).filter(
        (x: any, i: number, a: any[]) => a.indexOf(x) === i
      );
      this.selectedProcessArea1 = this.OriginalProcessAreaList.filter((x: any) =>
        processAreaIds.indexOf(x.id) > -1
      );
      this.selectedProcessArea1.forEach((x: any) => { x.checked = true; });
    }

    this.mappingList = tempProcess;
    this.mappingList.sort((x: any, y: any) => Number(y.bSelected) - Number(x.bSelected));
    this.refreshTable1(this.mappingList);
  }

  OnProcessAreafilterChange(e: any): void {
    this.mappingList = [...this.OriginalmappingList];
    this.mappingList.forEach((x: any) => x.bSelected = false);

    const processAreaIds = this.selectedProcessArea1.map((x: any) => x.id);
    const processIds: number[] = this.mappingList
      .filter((x: any) => processAreaIds.indexOf(x.procesS_AREA_ID) > -1)
      .map((x: any) => x.id);

    const tempProcess: any[] = [];
    this.mappingList.forEach((x: any) => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
        tempProcess.push(x);
      }
    });

    this.mappingList = tempProcess;
    this.mappingList.sort((a: any, b: any) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshTable1(this.mappingList);
  }

  OnfilterModelChange(): void {
    // placeholder — reserved for future logic
  }
}

