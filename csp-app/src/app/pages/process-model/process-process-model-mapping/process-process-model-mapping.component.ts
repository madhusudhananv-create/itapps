import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { ProcessAreaModelNew, ProcessModel, ProcessModelNew, ProcessModelProcessMapping, ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter, startWith } from 'rxjs/operators';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-process-process-model-mapping',
  templateUrl: './process-process-model-mapping.component.html',
  styleUrls: ['./process-process-model-mapping.component.scss']
})
export class ProcessProcessModelMappingComponent implements OnInit {

  //bAddNewServiceArea: Boolean = false;
  selectedProcessArea: ProcessAreaModelNew[] = [];
  selectedProcessModel1 = new ProcessModelNew();
  selectedProcessArea1: ProcessAreaModelNew[] = [];

  isProcessModelMapped: boolean = true;
  ProcessModelList = [];
  MasterProcessModelList = [];
  ProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: any[] = [];
  selectedProcessModel: ProcessModelNew[] = [];

  OriginalProcessList: any[] = [];
  processModelProcessMapping: ProcessModelProcessMapping[] = [];
  checkedValue: boolean;
  viewMode: boolean = true;
  editMode: boolean = false;

  displayedColumns = ["index", "procesS_MODEL", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "clausE_REFERENCE"];
  displayedColumns1 = ["index", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "clausE_REFERENCE", "edit"];
  OriginalProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessAreaList1: ProcessAreaModelNew[] = [];
  MasterProcessAreaList1: ProcessAreaModelNew[] = [];
  allMapping: ProcessModelProcessMapping[] = [];
  searchValuePAL: string = "";
  //dataSource : MatTableDataSource<ProcessModelNew>;
  dataSource: MatTableDataSource<any>;
  dataSource1: MatTableDataSource<any>;


  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('paginator1') paginator1: MatPaginator;

  //  @ViewChild(MatPaginator) set Paginator1(mp1: MatPaginator) {
  //   this.paginator1 = mp1;
  //   this.dataSource1.paginator = this.paginator1;
  // }


  //@ViewChildren(MatPaginator) paginators = new QueryList<MatPaginator>();


  OriginalmappingList: ProcessModelNew[];
  mappingList: ProcessModelNew[];
  list: boolean = false;
  listPAL: boolean = false;
  searchValue: string = "";
  ProcessModelToolTip: string = "To know the existing process area and processes that are mapped to a process model, first select a process model near to process model."
  SearchProcessAreaList: string = "";



  searchValuePML: string = "";
  MasterProcessModelListPML: ProcessModelNew[] = [];
  ProcessModelReferenceList: any;


  constructor(private _util: myUtility, private _appservice: AppsService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.ProcessAreaList.length == 0)
      this.ProcessAreaList.push(...this.selectedProcessArea);
    this.Service_GetProcessAreaList();
    this.Service_GetAllProcessListByProcessModel();
    this.Service_GetProcessList();
    this.getAllProcessModelReferenceList();
    this.Service_GetProcessModelProcessMapping();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.refreshTable1(this.mappingList);
    });
  }

  Service_GetProcessModelProcessMapping() {
    this._appservice.GetAllProcessProcessModelMapping().subscribe(
      data => {
        this.allMapping = data;
        this.Service_GetProcessModelList();
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  clear() {
    this.selectedProcessArea = undefined;
    this.selectedProcessModel = undefined;
    this.ProcessList = this.OriginalProcessList;
  }

  clear1() {
    this.selectedProcessModel1 = new ProcessModelNew();
    this.selectedProcessArea1 = undefined;
    this.mappingList = this.OriginalmappingList;
    this.mappingList.forEach(x => x.bSelected = false);
    this.refreshTable1(this.mappingList);
  }

  applyProcessModelList(filterValue: string) {
    this.ProcessModelList = this.MasterProcessModelList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));

  }

  applyProcessAreaList1(filterValue: string) {

    this.ProcessAreaList1 = this.MasterProcessAreaList1.filter(p =>
      this.selectedProcessArea1.some(x => x.title == p.title) ||
      p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }


  toggleList() {
    if (this.list) {
      this.list = false;
    }
    else {
      this.list = true;
    }
  }

  toggleProcessAreaList() {
    if (this.listPAL) {
      this.listPAL = false;
    }
    else {
      this.listPAL = true;
    }

    this.SearchProcessAreaList = "";
    this.applyProcessAreaList1(this.SearchProcessAreaList);
  }

  openedChange(opened: boolean) {
    this.searchValue = "";
    this.applyProcessModelList(this.searchValue);
  }

  openedChangePAL(opened: boolean) {
    this.searchValuePAL = "";
    this.applyProcessAreaList1(this.searchValuePAL);
  }

  ddProcessModelChange() {
    this.ProcessList.forEach((el) => { el.bSelected = false; })
  }

  SaveRow_onClick() {
    let checkedProcess = this.mappingList.filter(t => t.bSelected);
    if (checkedProcess.length > 0 && this.selectedProcessModel1.id > 0) {
      this.service_UpdateProcessMapping(this.selectedProcessModel1, checkedProcess);
    }
    else {
      alert("Please select Process Model and Process Area");
    }
  }

  getProcessArea(id) {
    let processA: ProcessAreaModelNew[] = this.OriginalProcessAreaList.filter(t => t.id == id);
    if (processA != null && processA != undefined && processA.length > 0) {
      return processA[0].title;
    }
  }

  getProcessModel(processId) {
    let processModelId = this.allMapping.filter(x => x.procesS_ID == processId).map(x => x.procesS_MODEL_ID);
    if (processModelId != undefined && processModelId.length > 0)
      return this.ProcessModelList.filter(x => x.id == processModelId[0]).map(x => x.title)[0];
  }

  OnfilterModelChange() {

  }

  getAllProcessModelReferenceList() {
    this._appservice.getAllProcessModelReferenceList().subscribe(data => {
      this.ProcessModelReferenceList = data;
    }, error => { this._util.serviceError(error); });
  }

  getProcessModelReference(modelReferenceList: number[]): string {
    if (this.ProcessModelReferenceList && this.ProcessModelReferenceList.length > 0 &&
      modelReferenceList && modelReferenceList.length > 0) {
      const ProcessModelNames = this.ProcessModelReferenceList
        .filter(model => model.items.some(item => modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST)))
        .map(model => {
          const selectedNames = model.items
            .filter(item => modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST))
            .map(item => `${item.sectioN_REFERENCE}`)
            .join(', ');
          return `<strong>${model.procesS_MODEL_NAME}</strong> - ${selectedNames}`;
        })
        .join(', ');

      return ProcessModelNames;
    }
  }

  Service_GetAllProcessListByProcessModel() {
    this._appservice.getAllProcessList().subscribe(data => {
      this.OriginalProcessList = data;
      this.ProcessList = data;
      this.clear();
    }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.OriginalmappingList = data;
      this.mappingList = data;
      this.refreshTable1(this.mappingList);
    }, error => { this._util.serviceError(error); });
  }
  refreshTable1(source) {
    this.dataSource1 = new MatTableDataSource(source);
    this.dataSource1.paginator = this.paginator1;
  }

  service_UpdateProcessMapping(processModel: ProcessModelNew, processList: ProcessModelNew[]) {
    this.isProcessModelMapped = false;
    this._appservice.UpdateProcessMapping(processModel, processList).subscribe(data => {
      alert("Saved Successfully");
      this.isProcessModelMapped = true;
      this.clear1();
      this.Service_GetAllProcessListByProcessModel();
      this.Service_GetProcessModelProcessMapping();


    }, error => { this._util.serviceError(error); this.isProcessModelMapped = true });
  }
  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
      this.OriginalProcessAreaList = data;
      this.ProcessAreaList1 = data;
      this.MasterProcessAreaList1 = data;

    }, error => { this._util.serviceError(error); });
  }
  service_UpdateProcessArea(processArea: ProcessAreaModelNew) {
    this._appservice.UpdateProcessArea(processArea).subscribe(data => {
      this.Service_GetProcessAreaList();
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessModelList() {
    this._appservice.getProcessModel().subscribe(data => {
      this.MasterProcessModelList = data;
      this.ProcessModelList = data;
      this.MasterProcessModelListPML = data;

      this.determineIfMapped()
    }, error => { this._util.serviceError(error); });
  }


  determineIfMapped() {
    this.ProcessModelList.forEach(x => {
      let element = this.allMapping.find(y => y.procesS_MODEL_ID == x.id)
      if (element == undefined)
        x.isMapped = false;
      else
        x.isMapped = true;
    });
    // this.ProcessModelList.sort((a, b) => {
    //   return a.isMapped - b.isMapped
    // });
  }

  CloseEditMode_OnClick() {
    this.editMode = false;
    this.viewMode = true;
  }

  OnProcessModelfilterChange() {
    this.mappingList = this.OriginalmappingList;
    this.ProcessAreaList1 = this.OriginalProcessAreaList;
    this.mappingList.forEach(x => x.bSelected = false);
    let processIds = [];
    let processAreaIds = [];
    let tempProcess = []
    if (this.selectedProcessModel1.id > 0) {
      processIds = this.allMapping.filter(x => x.procesS_MODEL_ID == this.selectedProcessModel1.id && x.isactive).map(y => y.procesS_ID);
      this.mappingList.forEach(x => {
        if (processIds.indexOf(x.id) > -1) {
          x.bSelected = true;
          tempProcess.push(x);
        }
      })
      processAreaIds = tempProcess.map(x => x.procesS_AREA_ID).filter((x, i, a) => a.indexOf(x) == i);
      this.selectedProcessArea1 = this.OriginalProcessAreaList.filter(x => processAreaIds.indexOf(x.id) > -1);
      this.selectedProcessArea1.forEach(x => {
        x.checked = true;
      });

    }

    this.mappingList = tempProcess;
    this.mappingList.sort((x, y) => Number(y.bSelected) - Number(x.bSelected));
    this.refreshTable1(this.mappingList);
  }

  OnProcessAreafilterChange(e) {
    this.mappingList = this.OriginalmappingList;
    this.mappingList.forEach(x => x.bSelected = false);
    let processIds = [];
    let processAreaIds = [];
    let tempProcess = [];

    processAreaIds = this.selectedProcessArea1.map(x => x.id);
    processIds.push(...this.mappingList.filter(x => processAreaIds.indexOf(x.procesS_AREA_ID) > -1).map(x => x.id));

    this.mappingList.forEach(x => {
      if (processIds.indexOf(x.id) > -1) {
        x.bSelected = true;
        tempProcess.push(x);
      }
    });

    this.mappingList = tempProcess;
    this.mappingList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshTable1(this.mappingList);
  }

  applyFilterForProcessModel(filterValue: string) {
    this.ProcessModelList = this.MasterProcessModelListPML.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  openedChangePML(opened: boolean) {
    this.searchValuePML = "";
    this.applyFilterForProcessModel(this.searchValuePML);
  }









}
