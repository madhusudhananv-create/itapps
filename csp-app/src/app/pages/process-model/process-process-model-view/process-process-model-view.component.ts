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
  selector: 'app-process-process-model-view',
  templateUrl: './process-process-model-view.component.html',
  styleUrls: ['./process-process-model-view.component.scss']
})
export class ProcessProcessModelViewComponent implements OnInit {

  selectedProcessArea: ProcessAreaModelNew[] = [];

  searchValuePML: string = "";
  MasterProcessModelListPML: ProcessModelNew[] = [];
  ProcessModelList = [];
  MasterProcessModelList = [];
  allMapping: ProcessModelProcessMapping[] = [];
  selectedProcessModel: ProcessModelNew[] = [];
  ProcessList: any[] = [];
  OriginalProcessList: any[] = [];
  OriginalProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessAreaList: ProcessAreaModelNew[] = [];
  searchValuePAL: string = "";
  MasterProcessAreaList1: ProcessAreaModelNew[] = [];
  OriginalmappingList: ProcessModelNew[];
  mappingList: ProcessModelNew[];

  dataSource: MatTableDataSource<any>;
  displayedColumns = ["index", "procesS_MODEL", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "clausE_REFERENCE"];

  @ViewChild('paginator') paginator: MatPaginator;
  ProcessModelReferenceList: any;

  constructor(private _util: myUtility, private _appservice: AppsService, private cdr: ChangeDetectorRef) { }

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
    this._appservice.getProcessModel().subscribe(data => {
      this.MasterProcessModelList = data;
      this.ProcessModelList = data;
      this.MasterProcessModelListPML = data;
      this.determineIfMapped()
    }, error => { this._util.serviceError(error); });
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

  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
      this.OriginalProcessAreaList = data;
      this.MasterProcessAreaList1 = data;

    }, error => { this._util.serviceError(error); });
  }

  Service_GetAllProcessListByProcessModel() {
    this._appservice.getAllProcessList().subscribe(data => {
      this.OriginalProcessList = data;
      this.ProcessList = data;
      this.refreshTable(this.ProcessList);
      this.clear();
    }, error => { this._util.serviceError(error); });
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.OriginalmappingList = data;
      this.mappingList = data;
    }, error => { this._util.serviceError(error); });
  }

  openedChangePML(opened: boolean) {
    this.searchValuePML = "";
    this.applyFilterForProcessModel(this.searchValuePML);
  }

  applyFilterForProcessModel(filterValue: string) {
    this.ProcessModelList = this.MasterProcessModelListPML.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
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

  OnfilterChange() {
    this.retainOriginalValues();
    let processModelIds = [];
    let processAreaIds = [];
    let tempProcess = [];
    let processIds = [];
    if (this.selectedProcessModel != undefined && this.selectedProcessModel.length > 0) {
      processModelIds = this.selectedProcessModel.map(x => x.id);
      this.ProcessList = this.OriginalProcessList.filter(x => processModelIds.indexOf(x.procesS_MODEL_ID) > -1);

      this.ProcessList.forEach(x => {
        if (processModelIds.indexOf(x.procesS_MODEL_ID) > -1) {
          x.bSelected = true;
          tempProcess.push(x);
        }
      })
      processAreaIds = tempProcess.map(x => x.procesS_AREA_ID).filter((x, i, a) => a.indexOf(x) == i);
      this.selectedProcessArea = this.OriginalProcessAreaList.filter(x => processAreaIds.indexOf(x.id) > -1);

      this.selectedProcessArea.forEach(x => {
        x.checked = true;
      });
      this.ProcessAreaList = this.selectedProcessArea;
      this.MasterProcessAreaList1 = this.selectedProcessArea;
    }
    else {
      this.selectedProcessArea = undefined;
      this.ProcessList = this.OriginalProcessList;
    }
    this.refreshTable(this.ProcessList);
  }

  retainOriginalValues() {
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
  }

  refreshTable(source) {
    this.dataSource = new MatTableDataSource(source);
    this.cdr.detectChanges();
    this.dataSource.paginator = this.paginator;
  }

  openedChangeFPAL(opened: boolean) {
    this.searchValuePAL = "";
    this.applyFilterForProcessArea(this.searchValuePAL);
  }

  applyFilterForProcessArea(filterValue: string) {
    this.ProcessAreaList = this.MasterProcessAreaList1.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  clear() {
    this.selectedProcessArea = [];
    this.selectedProcessModel = undefined;
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList
    this.refreshTable(this.ProcessList);
  }

  OnView_ProcessAreafilterChange() {
    this.retainOriginalValues();
    let processModelIds = [];
    let processAreaIds = [];
    let tempProcess = [];
    let processIds = [];
    if (this.selectedProcessArea != undefined && this.selectedProcessArea.length > 0) {
      processAreaIds = this.selectedProcessArea.map(x => x.id);
      this.ProcessList = this.OriginalProcessList.filter(x => processAreaIds.indexOf(x.procesS_AREA_ID) > -1);
    }
    else {
      this.ProcessList = this.OriginalProcessList;
    }

    this.refreshTable(this.ProcessList);
  }

  applyFilter1(event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value;
    this.cdr.detectChanges();
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

}
