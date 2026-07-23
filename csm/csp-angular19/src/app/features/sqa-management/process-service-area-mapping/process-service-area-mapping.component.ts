import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, Input } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin } from 'rxjs';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import {
  ProcessAreaModelNew,
  ProcessModelNew,
  ProcessServiceAreaMappingList,
  ServiceAreaModelNew,
  ProcessServiceAreaMapping
} from '../../../core/models/audit-checklist-based-model';

@Component({
  selector: 'app-process-service-area-mapping',
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
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './process-service-area-mapping.component.html',
  styleUrls: ['./process-service-area-mapping.component.scss']
})
export class ProcessServiceAreaMappingComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @Input() view: boolean = true;

  isServiceAreaMapped: boolean = true;
  bAddNewServiceArea: boolean = false;
  showServiceAreaTable: boolean = false; // Controls table visibility
  selectedServiceArea: ServiceAreaModelNew[] = [];
  selectedProcessArea: ProcessAreaModelNew[] = [];
  selectedProcessModel: ProcessModelNew = new ProcessModelNew();

  ProcessModelList: any;
  ServiceAreaList: ServiceAreaModelNew[] = [];
  ProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: any[] = [];
  OriginalProcessList: any[] = [];
  dataSource!: MatTableDataSource<ProcessServiceAreaMappingList>;
  dataSource1!: MatTableDataSource<any>;
  processServiceAreaMapping: ProcessServiceAreaMapping[] = [];
  newServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();
  checkedValue: boolean = false;
  isServiceAreaAdded: boolean = true;
  filterType: string = "";

  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('serviceAreaPaginator') serviceAreaPaginator!: MatPaginator;

  ProcessModelReferenceList: any;

  // Table column definitions
  displayedColumns = ["index", "serviceAreaName", "processArea", "processTitle", "processDescription", "clausE_REFERENCE"];
  displayedColumns1 = ["index", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "clausE_REFERENCE", "edit"];
  serviceAreaDisplayedColumns = ["index", "title", "description", "action"];
  
  // Column arrays for templates
  displayedColumnsViewMode = ['sno', 'servicE_AREA_NAME', 'procesS_AREA', 'procesS_TITLE', 'procesS_DESCRIPTION', 'procesS_MODEL_REFERENCE'];
  displayedColumnsServiceArea = ['sno', 'title', 'description', 'actions'];
  displayedColumnsEditMode = ['index', 'procesS_AREA_ID', 'title', 'description', 'procesS_MODEL_REFERENCE_LIST', 'select'];

  OriginalProcessAreaList: any;
  viewMode: boolean = true;
  editMode: boolean = false;
  mappingList: any[] = [];
  originalMappingList: any[] = [];
  selectedServiceArea1!: ServiceAreaModelNew;
  selectedProcessArea1: ProcessAreaModelNew[] = [];
  allMapping: ProcessServiceAreaMapping[] = [];

  isServiceAreaEditMode = false;
  serviceAreaDataSource!: MatTableDataSource<ServiceAreaModelNew>;
  filteredServiceAreaDataSource!: MatTableDataSource<ServiceAreaModelNew>;
  filterValue: string = '';

  EditToolTip: string = "Edit";
  DeleteToolTip: string = "Delete";

  searchValueSAL: string = "";
  MasterServiceAreaList: ServiceAreaModelNew[] = [];
  OriginalServiceAreaList: ServiceAreaModelNew[] = [];

  searchValuePAL: string = "";
  MasterProcessAreaList: ProcessAreaModelNew[] = [];
  OriginalMasterProcessAreaList: ProcessAreaModelNew[] = [];

  searchValueMSAL: string = "";
  MasterMapServiceAreaList: ServiceAreaModelNew[] = [];

  searchValueMPAL: string = "";
  MasterMapProcessAreaList: ProcessAreaModelNew[] = [];

  constructor(
    public _utility: MyUtility,
    private _appservice: AppsService,
    public _access: AccessControl
  ) { }

  iEditIndex = -1;

  ngOnInit() {
    if (this.ProcessAreaList.length == 0)
      this.ProcessAreaList.push(...this.selectedProcessArea);

    this.Service_GetProcessAreaList();
    this.Service_GetMappedProcessListByServiceArea();
    this.Service_GetProcessList();
    this.Service_GetProcessModelList();
    this.Service_GetServiceAreaProcessMapping();
    this.getAllProcessModelReferenceList();
    if (!this.view) {
      this.OpenMapScreen();
    }
  }

  ngOnChanges() {
    this.Service_GetProcessAreaList();
    this.Service_GetServiceAreaList();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.refreshTable(this.ProcessList);
      this.refreshServiceAreaTable(this.ServiceAreaList);
      this.refreshTable1(this.mappingList);
    });
  }

  ngAfterViewChecked() {
    // Reconnect paginators if they exist but are not connected to data sources
    if (this.viewMode) {
      if (this.dataSource && this.paginator && this.dataSource.paginator !== this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.filteredServiceAreaDataSource && this.serviceAreaPaginator && 
          this.filteredServiceAreaDataSource.paginator !== this.serviceAreaPaginator) {
        this.filteredServiceAreaDataSource.paginator = this.serviceAreaPaginator;
      }
    }
    
    if (this.editMode) {
      if (this.dataSource1 && this.paginator1 && this.dataSource1.paginator !== this.paginator1) {
        this.dataSource1.paginator = this.paginator1;
      }
    }
  }

  createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');

      if (this.filterType == "edit") {
        return searchTerms.every((term: string) => {
          const processArea = this.getProcessArea(data.procesS_AREA_ID).toLowerCase();
          return (
            processArea.includes(term) ||
            data.title.toLowerCase().includes(term) ||
            data.description.toLowerCase().includes(term)
          );
        });
      } else if (this.filterType == "view") {
        return searchTerms.every((term: string) => {
          return (
            data.procesS_AREA.toLowerCase().includes(term) ||
            data.servicE_AREA_NAME.toLowerCase().includes(term) ||
            data.procesS_TITLE.toLowerCase().includes(term)
          );
        });
      }
      return false;
    };
  }

  Service_GetServiceAreaProcessMapping() {
    this._appservice.getServiceAreaProcessMapping().subscribe({
      next: (data: any) => {
        this.allMapping = data;
        this.Service_GetServiceAreaList();
      },
      error: (error: any) => { this._utility.serviceError(error) }
    });
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe({
      next: (data: any) => {
        this.ServiceAreaList = data;
        this.MasterServiceAreaList = data;
        this.OriginalServiceAreaList = data;
        this.MasterMapServiceAreaList = data;
        this.determineIfMapped();
        this.refreshServiceAreaTable(this.ServiceAreaList);
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe({
      next: (data: any) => {
        this.ProcessAreaList = data;
        this.MasterProcessAreaList = data;
        this.OriginalMasterProcessAreaList = data;
        this.MasterMapProcessAreaList = data;
        this.OriginalProcessAreaList = data;
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe({
      next: (data: any) => {
        this.mappingList = data;
        this.originalMappingList = data;
        this.refreshTable1(this.mappingList);
      },
      error: (error: any) => { this._utility.serviceError(error) }
    });
  }

  Service_GetMappedProcessListByServiceArea() {
    this._appservice.getAllProcessListByServiceArea().subscribe({
      next: (data: any) => {
        this.OriginalProcessList = data;
        this.ProcessList = data;
        this.refreshTable(this.ProcessList);
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe({
      next: (data: any) => {
        this.ProcessModelList = data;
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  getAllProcessModelReferenceList() {
    this._appservice.getAllProcessModelReferenceList().subscribe({
      next: (data: any) => {
        this.ProcessModelReferenceList = data;
      },
      error: (error: any) => { this._utility.serviceError(error); }
    });
  }

  refreshTable(source: any) {
    this.dataSource = new MatTableDataSource<ProcessServiceAreaMappingList>(source);
    this.dataSource.filterPredicate = this.createFilter();
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  refreshServiceAreaTable(source: any) {
    this.serviceAreaDataSource = new MatTableDataSource<ServiceAreaModelNew>(source);
    this.filteredServiceAreaDataSource = this.serviceAreaDataSource;
    if (this.serviceAreaPaginator) {
      this.filteredServiceAreaDataSource.paginator = this.serviceAreaPaginator;
    }
    if (this.sort) {
      this.filteredServiceAreaDataSource.sort = this.sort;
    }
  }

  refreshTable1(source: any) {
    this.dataSource1 = new MatTableDataSource(source);
    this.dataSource1.filterPredicate = this.createFilter();
    if (this.paginator1) {
      this.dataSource1.paginator = this.paginator1;
    }
  }

  getProcessArea(id: number) {
    if (this.OriginalProcessAreaList != undefined) {
      let processA: ProcessAreaModelNew[] = this.OriginalProcessAreaList.filter((t: any) => t.id == id);
      if (processA != null && processA != undefined && processA.length > 0) {
        return processA[0].title;
      }
    }
    return '';
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

  OpenMapScreen() {
    this.viewMode = false;
    this.editMode = true;
    setTimeout(() => {
      this.refreshTable1(this.mappingList);
    });
  }

  determineIfMapped() {
    this.ServiceAreaList.forEach((x: any) => {
      let element = this.allMapping.find((y: any) => y.servicE_AREA_ID == x.id)
      if (element == undefined) {
        x.isMapped = false;
      } else {
        x.isMapped = true;
      }
    });
  }

  btnAddServiceArea_Onclick() {
    this.bAddNewServiceArea = true;
    this.showServiceAreaTable = true; // Show table when button is clicked
    this.newServiceArea = new ServiceAreaModelNew();
    this.Service_GetServiceAreaList();
    this.refreshServiceAreaTable(this.ServiceAreaList);
  }

  btnSaveServiceArea_Onclick() {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.newServiceArea.title == undefined || this.newServiceArea.title.trim() == "") {
      this._utility.showWarning("Please enter Service Tower Title");
      return;
    }
    if ((specialCharPattern.test(this.newServiceArea.title)) || numberPattern.test(this.newServiceArea.title)) {
      this._utility.showWarning('Please enter alphanumeric or numeric values along with special characters for title');
      return;
    }
    if ((specialCharPattern.test(this.newServiceArea.description)) || numberPattern.test(this.newServiceArea.description)) {
      this._utility.showWarning('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    if (!this.isServiceAreaEditMode)
      this.service_AddServiceArea(this.newServiceArea);
    else {
      this.service_UpdateServiceArea(this.newServiceArea);
    }
  }

  btnCancelServiceArea_Onclick() {
    this.bAddNewServiceArea = false;
    this.showServiceAreaTable = false; // Hide table when closing
    this.isServiceAreaEditMode = false;
  }

  btnClearServiceArea_Onclick() {
    this.isServiceAreaEditMode = false;
    this.newServiceArea = new ServiceAreaModelNew();
  }

  service_AddServiceArea(serviceArea: ServiceAreaModelNew) {
    this.isServiceAreaAdded = false;
    this._appservice.AddServiceAreaNew(serviceArea).subscribe({
      next: (data: any) => {
        this.Service_GetServiceAreaList();
        this._utility.showSuccess("Service Tower Added Successfully");
        this.isServiceAreaAdded = true;
        this.newServiceArea = new ServiceAreaModelNew();
      },
      error: (error: any) => { this._utility.serviceError(error); this.isServiceAreaAdded = true }
    });
  }

  service_UpdateServiceArea(serviceArea: ServiceAreaModelNew) {
    this.isServiceAreaAdded = false;
    this._appservice.UpdateServiceAreaNew(serviceArea).subscribe({
      next: (data: any) => {
        this.Service_GetServiceAreaList();
        this._utility.showSuccess("Service Tower Updated Successfully");
        this.isServiceAreaAdded = true;
        this.newServiceArea = new ServiceAreaModelNew();
      },
      error: (error: any) => {
        this._utility.serviceError(error);
        this.isServiceAreaAdded = true;
        this.Service_GetServiceAreaList();
      }
    });
  }

  service_DeleteServiceArea(serviceArea: ServiceAreaModelNew) {
    this.isServiceAreaAdded = false;
    this._utility.showDeleteConfirmation('Are you sure you want to delete the Service Tower ?').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.DeleteServiceAreaNew(serviceArea).subscribe({
          next: (data: any) => {
            this.Service_GetServiceAreaList();
            this._utility.showSuccess("Service Tower Deleted Successfully");
            this.newServiceArea = new ServiceAreaModelNew();
            this.isServiceAreaAdded = true;
          },
          error: (error: any) => {
            this._utility.serviceError(error);
            this.isServiceAreaAdded = true
            this.Service_GetServiceAreaList();
          }
        });
      } else {
        this.isServiceAreaAdded = true;
      }
    });
  }

  EditRow_onClick(model: ServiceAreaModelNew) {
    this.newServiceArea = model;
    this.isServiceAreaEditMode = true;
  }

  DeleteRow_onClick(model: ServiceAreaModelNew) {
    this.service_DeleteServiceArea(model);
  }

  SaveRow_onClick() {
    let uncheckedProcess = this.mappingList.filter((t: any) => t.bSelected == false);
    let checkedProcess = this.mappingList.filter((t: any) => t.bSelected);
    uncheckedProcess.forEach((x: any) => x.isactive = false);
    checkedProcess = checkedProcess.concat(uncheckedProcess);
    if (checkedProcess.length > 0 && this.selectedServiceArea1 != undefined) {
      this._utility.showWarningConfirmation(
        'Updating Service Tower & Process Area mapping will impact checklist questions during assessment. Do you want to continue updating the mapping?',
        'Confirm Update'
      ).subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.service_UpdateProcessServiceAreaMapping(this.selectedServiceArea1, checkedProcess);
        }
      });
    }
    else {
      this._utility.showWarning("Please choose Service Tower and Process Area")
    }
  }

  service_UpdateProcessServiceAreaMapping(serviceArea: ServiceAreaModelNew, processList: ProcessModelNew[]) {
    this.isServiceAreaMapped = false;
    this._appservice.UpdateProcessServiceAreaMapping(serviceArea, processList).subscribe({
      next: (data: any) => {
        this._utility.showSuccess("Saved successfully");
        
        // Refresh all data in parallel for faster performance
        forkJoin({
          mappedProcessList: this._appservice.getAllProcessListByServiceArea(),
          serviceAreaList: this._appservice.getServiceAreaList(),
          processList: this._appservice.getProcessList()
        }).subscribe({
          next: (results: any) => {
            // Update all data sources at once
            this.OriginalProcessList = results.mappedProcessList;
            this.ProcessList = results.mappedProcessList;
            this.refreshTable(this.ProcessList);
            
            this.ServiceAreaList = results.serviceAreaList.filter((x: any) => x.isactive !== false);
            
            this.mappingList = results.processList;
            this.originalMappingList = results.processList;
            this.refreshTable1(this.mappingList);
            
            this.determineIfMapped();
            this.isServiceAreaMapped = true;
            this.clear1();
          },
          error: (error: any) => {
            this._utility.serviceError(error);
            this.isServiceAreaMapped = true;
          }
        });
      },
      error: (error: any) => { 
        this._utility.serviceError(error); 
        this.isServiceAreaMapped = true; 
        this.clear1(); 
      }
    });
  }

  Clear_Click() {
    this.selectedServiceArea = [];
    this.selectedProcessArea = [];
    this.selectedProcessModel = new ProcessModelNew();
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.ProcessList.forEach((x: any) => x.bSelected = false);
    this.refreshTable(this.ProcessList);
  }

  CloseEditMode_OnClick() {
    this.clear1();
    this.viewMode = true;
    this.editMode = false;
    setTimeout(() => {
      this.refreshTable(this.ProcessList);
    });
  }

  clear1() {
    this.selectedProcessArea1 = [];
    this.selectedServiceArea1 = undefined as any;
    this.mappingList = this.originalMappingList;
    this.mappingList.forEach((x: any) => x.bSelected = false);
    this.refreshTable1(this.mappingList);
  }

  clearProcessAreaSelection() {
    this.selectedProcessArea1 = [];
    // Show all data when clearing selection
    this.mappingList = this.originalMappingList;
    this.mappingList.forEach((x: any) => x.bSelected = false);
    this.refreshTable1(this.mappingList);
  }

  clearProcessAreaSelectionView() {
    this.selectedProcessArea = [];
    this.OnfilterChange();
  }

  clearServiceAreaSelection() {
    this.selectedServiceArea = [];
    this.OnfilterChange();
  }

  clearServiceAreaSelectionMap() {
    this.selectedServiceArea1 = undefined as any;
    this.OnServiceAreafilterChange();
  }

  OnfilterChange() {
    this.retainOriginalValues();
    let processAreaIds: any = [];
    let serviceAreaIds: any = [];
    if (this.selectedServiceArea != undefined && this.selectedServiceArea.length > 0) {
      serviceAreaIds = this.selectedServiceArea.map((x: any) => x.id);
      this.ProcessList = this.OriginalProcessList.filter((x: any) => serviceAreaIds.indexOf(x.servicE_AREA_ID) > -1);

      processAreaIds = this.ProcessList.map((x: any) => x.procesS_AREA_ID);
      this.ProcessAreaList = this.OriginalProcessAreaList.filter((x: any) => processAreaIds.indexOf(x.id) > -1);

      if (this.selectedProcessArea != undefined && this.selectedProcessArea.length > 0) {
        processAreaIds = this.selectedProcessArea.map((x: any) => x.id);
        this.ProcessList = this.ProcessList.filter((x: any) => processAreaIds.indexOf(x.procesS_AREA_ID) > -1);
      }
    }
    else if (this.selectedProcessArea != undefined && this.selectedProcessArea.length > 0) {
      processAreaIds = this.selectedProcessArea.map((x: any) => x.id);
      this.ProcessList = this.OriginalProcessList.filter((x: any) => processAreaIds.indexOf(x.procesS_AREA_ID) > -1);
    }
    else {
      this.ProcessList = this.OriginalProcessList;
    }
    this.MasterProcessAreaList = this.ProcessAreaList;
    this.OriginalMasterProcessAreaList = this.ProcessAreaList; // Also update the backup for search filtering
    this.refreshTable(this.ProcessList);
  }

  retainOriginalValues() {
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.ProcessList.forEach((x: any) => x.bSelected = false);
  }

  OnServiceAreafilterChange() {
    this.mappingList = this.originalMappingList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.mappingList.forEach((x: any) => x.bSelected = false);
    let processIds: any = [];
    let processAreaIds: any = [];
    let tempProcess: any = [];
    if (this.selectedServiceArea1 && this.selectedServiceArea1.id > 0) {
      processIds = this.allMapping.filter((x: any) => x.servicE_AREA_ID == this.selectedServiceArea1.id && x.isactive).map((y: any) => y.procesS_ID);
      this.mappingList.forEach((x: any) => {
        if (processIds.indexOf(x.id) > -1) {
          x.bSelected = true;
          tempProcess.push(x);
        }
      })
      processAreaIds = tempProcess.map((x: any) => x.procesS_AREA_ID).filter((x: any, i: any, a: any) => a.indexOf(x) == i);
      this.selectedProcessArea1 = this.OriginalProcessAreaList.filter((x: any) => processAreaIds.indexOf(x.id) > -1);
    }

    this.mappingList = tempProcess;
    this.mappingList.sort((x: any, y: any) => Number(y.bSelected) - Number(x.bSelected));
    this.refreshTable1(this.mappingList);
  }

  OnProcessAreafilterChange() {
    this.mappingList = this.originalMappingList;
    this.mappingList.forEach((x: any) => x.bSelected = false);
    
    // If no process areas selected, show all data
    if (!this.selectedProcessArea1 || this.selectedProcessArea1.length === 0) {
      this.refreshTable1(this.mappingList);
      return;
    }
    
    let processIds: any = [];
    let processAreaIds: any = [];
    let tempProcess: any = [];

    processAreaIds = this.selectedProcessArea1.map((x: any) => x.id);
    processIds.push(...this.mappingList.filter((x: any) => processAreaIds.indexOf(x.procesS_AREA_ID) > -1).map((x: any) => x.id));

    this.mappingList.forEach((x: any) => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
        tempProcess.push(x);
      }
    });
    this.mappingList.sort((a: any, b: any) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshTable1(tempProcess);
  }

  applyFilter(event: string) {
    this.filterType = "edit";
    this.dataSource1.filter = event;
    if (event) {
      this.dataSource1.filterPredicate = (data, filter: string) =>
        this.createFilter()(data, filter) || this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(filter);
    } else {
      this.dataSource1.filterPredicate = this.createFilter();
    }
  }

  applyFilter1(event: string) {
    this.filterType = "view";
    this.dataSource.filter = event;
    if (event) {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }

  applyTableFilter() {
    const filterValue = this.filterValue.trim().toLowerCase();
    if (filterValue === '') {
      this.refreshServiceAreaTable(this.ServiceAreaList);
    }
    else {
      this.filteredServiceAreaDataSource.data = this.serviceAreaDataSource.data.filter((item: any) => {
        return item.title.toLowerCase().includes(filterValue);
      });
    }
  }

  applyFilterForServiceArea(filterValue: string) {
    // Filter for View mode Service Tower dropdown
    this.MasterServiceAreaList = this.OriginalServiceAreaList.filter((p: any) => 
      p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  applyFilterForProcessArea(filterValue: string) {
    // Filter for View mode Process Area dropdown
    this.MasterProcessAreaList = this.OriginalMasterProcessAreaList.filter((p: any) => 
      p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  applyFilterForMapServiceArea(filterValue: string) {
    this.ServiceAreaList = this.MasterMapServiceAreaList.filter((p: any) => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  applyFilterForMapProcessArea(filterValue: string) {
    this.ProcessAreaList = this.MasterMapProcessAreaList.filter((p: any) =>
      this.selectedProcessArea1.some((x: any) => x.title == p.title) ||
      p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  openedChangeSAL(opened: boolean) {
    if (!opened) {
      this.searchValueSAL = "";
      this.MasterServiceAreaList = this.OriginalServiceAreaList;
    }
  }

  openedChangePAL(opened: boolean) {
    if (!opened) {
      this.searchValuePAL = "";
      this.MasterProcessAreaList = this.OriginalMasterProcessAreaList;
    }
  }

  openedChangeMSAL(opened: boolean) {
    if (!opened) {
      this.searchValueMSAL = "";
      this.applyFilterForMapServiceArea(this.searchValueMSAL);
    }
  }

  openedChangeMPAL(opened: boolean) {
    if (!opened) {
      this.searchValueMPAL = "";
      this.applyFilterForMapProcessArea(this.searchValueMPAL);
    }
  }
}

