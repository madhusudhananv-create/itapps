import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, Input } from '@angular/core';
import { ProcessAreaModelNew, ProcessModelNew, ProcessModelProcessMapping, ProcessServiceAreaMappingList, ServiceAreaModelNew, ProcessServiceAreaMapping } from '../../../models/audit-checklist-based-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { AccessControl } from '../../../Shared/accessControl';

@Component({
  selector: 'app-process-service-area-mapping',
  templateUrl: './process-service-area-mapping.component.html',
  styleUrls: ['./process-service-area-mapping.component.scss']
})
export class ProcessServiceAreaMappingComponent implements OnInit, AfterViewInit {

  @Input("view") view: boolean = true;

  isServiceAreaMapped: boolean = true;
  bAddNewServiceArea: Boolean = false;
  selectedServiceArea: ServiceAreaModelNew[] = [];
  selectedProcessArea: ProcessAreaModelNew[] = [];
  selectedProcessModel: ProcessModelNew = new ProcessModelNew();

  ProcessModelList;
  ServiceAreaList: ServiceAreaModelNew[] = [];
  ProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: any[] = [];
  OriginalProcessList: any[] = [];
  dataSource: MatTableDataSource<ProcessServiceAreaMappingList>;
  dataSource1: MatTableDataSource<any>;
  processServiceAreaMapping: ProcessServiceAreaMapping[] = [];
  newServiceArea: ServiceAreaModelNew = new ServiceAreaModelNew();
  checkedValue: boolean = false;
  isServiceAreaAdded: boolean = true;
  filterType : string="";
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('serviceAreaPaginator') serviceAreaPaginator: MatPaginator;
  ProcessModelReferenceList: any;
  @ViewChild(MatSort) set content(sort: MatSort) {
    if (this.dataSource != undefined)
      this.dataSource.sort = sort;
  }
  displayedColumns = ["index", "serviceAreaName", "processArea", "processTitle", "processDescription", "clausE_REFERENCE"];
  displayedColumns1 = ["index", "procesS_AREA_ID", "procesS_NAME", "procesS_DESCRIPTION", "clausE_REFERENCE", "edit"];
  serviceAreaDisplayedColumns = ["index", "title", "description", "action"];

  OriginalProcessAreaList: any;
  viewMode: boolean = true;
  editMode: boolean = false;
  mappingList: any[];
  originalMappingList: any[];
  selectedServiceArea1: ServiceAreaModelNew;
  selectedProcessArea1: ProcessAreaModelNew[] = [];
  allMapping: ProcessServiceAreaMapping[] = [];

  isServiceAreaEditMode = false;
  serviceAreaDataSource: MatTableDataSource<ServiceAreaModelNew>;
  filteredServiceAreaDataSource : MatTableDataSource<ServiceAreaModelNew>;
  filterValue: string = '';

  EditToolTip: string = "Edit";
  DeleteToolTip: string = "Delete";

  searchValueSAL: string = "";
  MasterServiceAreaList: ServiceAreaModelNew[] = [];

  searchValuePAL: string = "";
  MasterProcessAreaList: ProcessAreaModelNew[] = [];


  searchValueMSAL: string = "";
  MasterMapServiceAreaList: ServiceAreaModelNew[] = [];

  searchValueMPAL: string = "";
  MasterMapProcessAreaList: ProcessAreaModelNew[] = [];

  constructor(private _util: myUtility, private _appservice: AppsService, public _access: AccessControl) { }
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
    });
  }
  createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');
     
      if (this.filterType == "edit") {
        return searchTerms.every(term => {
          const processArea = this.getProcessArea(data.procesS_AREA_ID).toLowerCase();
          return (
            processArea.includes(term) ||
            data.title.toLowerCase().includes(term) ||
            data.description.toLowerCase().includes(term)
          );
        });
      } else if (this.filterType == "view") {
        return searchTerms.every(term => {
          return (
            data.procesS_AREA.toLowerCase().includes(term) ||
            data.servicE_AREA_NAME.toLowerCase().includes(term)||
            data.procesS_TITLE.toLowerCase().includes(term)
          );
        });
      }
      return false;
    };
  }
  Service_GetServiceAreaProcessMapping() {
    this._appservice.getServiceAreaProcessMapping().subscribe(data => {
      this.allMapping = data;
      this.Service_GetServiceAreaList();
    },
      (error) => { this._util.serviceError(error) })
  }

  Service_GetServiceAreaProcessMappingRefreshData() {
    this._appservice.getServiceAreaProcessMapping().subscribe(data => {
      this.allMapping = data;
      this.determineIfMapped();
    },
      (error) => { this._util.serviceError(error) })
  }

  Service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.mappingList = data;
      this.originalMappingList = data;
      this.refreshTable1(this.mappingList);
    },
      (error) => { this._util.serviceError(error) })
  }

  refreshTable(source) {
    this.dataSource = new MatTableDataSource<ProcessServiceAreaMappingList>(source);
    this.dataSource.filterPredicate = this.createFilter();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  refreshServiceAreaTable(source) {
    this.serviceAreaDataSource = new MatTableDataSource<ServiceAreaModelNew>(source);
    this.filteredServiceAreaDataSource = this.serviceAreaDataSource;
    this.filteredServiceAreaDataSource.paginator = this.serviceAreaPaginator;
    this.filteredServiceAreaDataSource.sort = this.sort;
  }

  SaveRow_onClick() {
    let uncheckedProcess = this.mappingList.filter(t => t.bSelected == false);
    let checkedProcess = this.mappingList.filter(t => t.bSelected);
    uncheckedProcess.forEach(x => x.isactive = false);
    checkedProcess = checkedProcess.concat(uncheckedProcess);
    if (checkedProcess.length > 0 && this.selectedServiceArea1 != undefined) {
      if (confirm('Updating Service Tower & Process Area mapping will impact checklist questions during assessment. Do you want to continue updating the mapping? '))
        this.service_UpdateProcessServiceAreaMapping(this.selectedServiceArea1, checkedProcess);
    }
    else {
      alert("Please choose Service Tower and Process Area")
    }
  }

  Clear_Click() {
    this.selectedServiceArea = [];
    this.selectedProcessArea = [];
    this.selectedProcessModel = new ProcessModelNew();
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.ProcessList.forEach(x => x.bSelected = false);
    this.refreshTable(this.ProcessList);
  }

  CancelEdit_onClick() { this.iEditIndex = -1; }

  getProcessArea(id) {
    if (this.OriginalProcessAreaList != undefined) {
      let processA: ProcessAreaModelNew[] = this.OriginalProcessAreaList.filter(t => t.id == id);
      if (processA != null && processA != undefined && processA.length > 0) {        
        return processA[0].title;
      }
    }    
  }

  btnAddServiceArea_Onclick() {
    this.bAddNewServiceArea = true;
    this.newServiceArea = new ServiceAreaModelNew();
    this.Service_GetServiceAreaList();
    this.refreshServiceAreaTable(this.ServiceAreaList);
  }

  btnSaveServiceArea_Onclick() {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.newServiceArea.title == undefined || this.newServiceArea.title.trim() == "") {
      alert("Please enter Service Tower Title");
      return;
    }
    if ((specialCharPattern.test(this.newServiceArea.title)) || numberPattern.test(this.newServiceArea.title)) {
      alert('Please enter alphanumeric or numeric values along with special characters for title');
      return;
    }
    if ((specialCharPattern.test(this.newServiceArea.description)) || numberPattern.test(this.newServiceArea.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
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
    this.isServiceAreaEditMode = false;
  }

  btnClearServiceArea_Onclick() {
    this.isServiceAreaEditMode = false;
    this.newServiceArea = new ServiceAreaModelNew();
  }

  service_AddServiceArea(serviceArea: ServiceAreaModelNew) {
    this.isServiceAreaAdded = false;
    this._appservice.AddServiceAreaNew(serviceArea).subscribe(data => {
      this.Service_GetServiceAreaList();
      alert("Service Tower Added Successfully");
      this.isServiceAreaAdded = true;
      this.newServiceArea = new ServiceAreaModelNew();
    }, error => { this._util.serviceError(error); this.isServiceAreaAdded = true });
  }

  service_UpdateServiceArea(serviceArea: ServiceAreaModelNew) {
    this.isServiceAreaAdded = false;
    this._appservice.UpdateServiceAreaNew(serviceArea).subscribe(data => {
      this.Service_GetServiceAreaList();
      alert("Service Tower Updated Successfully");
      this.isServiceAreaAdded = true;
      this.newServiceArea = new ServiceAreaModelNew();
    }, error => {
      this._util.serviceError(error); this.isServiceAreaAdded = true;
      this.Service_GetServiceAreaList();
    });
  }

  service_DeleteServiceArea(serviceArea: ServiceAreaModelNew) {
    this.isServiceAreaAdded = false;
    if (confirm('Are you sure you want to delete the Service Tower ?')) {
      this._appservice.DeleteServiceAreaNew(serviceArea).subscribe(data => {
        this.Service_GetServiceAreaList();
        alert("Service Tower Deleted Successfully");
        this.newServiceArea = new ServiceAreaModelNew();
      }, error => {
        this._util.serviceError(error); this.isServiceAreaAdded = true
        this.Service_GetServiceAreaList();
      });
    }
    this.isServiceAreaAdded = true;
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

  Service_GetMappedProcessListByServiceArea() {
    this._appservice.getAllProcessListByServiceArea().subscribe(data => {
      this.OriginalProcessList = data;
      this.ProcessList = data;
      this.refreshTable(this.ProcessList);
    }, error => { this._util.serviceError(error); });
  }

  service_UpdateProcessServiceAreaMapping(serviceArea: ServiceAreaModelNew, processList: ProcessModelNew[]) {
    this.isServiceAreaMapped = false;
    this._appservice.UpdateProcessServiceAreaMapping(serviceArea, processList).subscribe(data => {
      alert("Saved successfully");
    }, error => { this._util.serviceError(error); this.isServiceAreaMapped = true; this.clear1(); },

      () => {
        this.determineIfMapped();
        this.isServiceAreaMapped = true;
        this.clear1();
        this.Service_GetMappedProcessListByServiceArea();
        this.Service_GetServiceAreaProcessMappingRefreshData();
        this.Service_GetProcessList();
      }
    );
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(data => {
      this.ServiceAreaList = data;
      this.MasterServiceAreaList = data;
      this.MasterMapServiceAreaList = data;
      this.determineIfMapped();
      this.refreshServiceAreaTable(this.ServiceAreaList);
    }, error => { this._util.serviceError(error); });
  }
  Service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
      this.MasterProcessAreaList = data;
      this.MasterMapProcessAreaList = data;
      this.OriginalProcessAreaList = data;
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

  retainOriginalValues() {
    this.ProcessList = this.OriginalProcessList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.ProcessList.forEach(x => x.bSelected = false);
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

  OnfilterChange() {
    this.retainOriginalValues();
    let processAreaIds = [];
    let serviceAreaIds = [];
    if (this.selectedServiceArea != undefined && this.selectedServiceArea.length > 0) {
      serviceAreaIds = this.selectedServiceArea.map(x => x.id);
      this.ProcessList = this.OriginalProcessList.filter(x => serviceAreaIds.indexOf(x.servicE_AREA_ID) > -1);

      processAreaIds = this.ProcessList.map(x => x.procesS_AREA_ID);
      this.ProcessAreaList = this.OriginalProcessAreaList.filter(x => processAreaIds.indexOf(x.id) > -1);

      if (this.selectedProcessArea != undefined && this.selectedProcessArea.length > 0) {
        processAreaIds = this.selectedProcessArea.map(x => x.id);
        this.ProcessList = this.ProcessList.filter(x => processAreaIds.indexOf(x.procesS_AREA_ID) > -1);
      }
    }
    else if (this.selectedProcessArea != undefined && this.selectedProcessArea.length > 0) {
      processAreaIds = this.selectedProcessArea.map(x => x.id);
      this.ProcessList = this.OriginalProcessList.filter(x => processAreaIds.indexOf(x.procesS_AREA_ID) > -1);
    }
    else {
      this.ProcessList = this.OriginalProcessList;
    }
    this.MasterProcessAreaList = this.ProcessAreaList;
    this.refreshTable(this.ProcessList);
  }

  OpenMapScreen() {
    this.viewMode = false;
    this.editMode = true;
    this.refreshTable1(this.mappingList);
  }

  refreshTable1(source) {
    this.dataSource1 = new MatTableDataSource(source);
	this.dataSource1.filterPredicate = this.createFilter();
    this.dataSource1.paginator = this.paginator1
  }

  applyFilter(event) {
    this.filterType = "edit";
    this.dataSource1.filter = event;   
    if (event) {
      this.dataSource1.filterPredicate = (data, filter: string) =>
        this.createFilter()(data, filter) ||  this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(filter);
    } else { 
      this.dataSource1.filterPredicate = this.createFilter();
    }
  }

  applyFilter1(event) {
    this.filterType = "view";
    this.dataSource.filter = event;
    if (event) {     
      this.dataSource.filterPredicate = this.createFilter();
    }  
   
  }

  CloseEditMode_OnClick() {
    this.clear1();
    this.refreshTable(this.ProcessList);
  }

  clear1() {
    this.selectedProcessArea1 = undefined;
    this.selectedServiceArea1 = undefined;
    this.mappingList = this.originalMappingList;
    this.mappingList.forEach(x => x.bSelected = false);
    this.refreshTable1(this.mappingList);
  }

  OnServiceAreafilterChange() {
    this.mappingList = this.originalMappingList;
    this.ProcessAreaList = this.OriginalProcessAreaList;
    this.mappingList.forEach(x => x.bSelected = false);
    let processIds = [];
    let processAreaIds = [];
    let tempProcess = [];
    if (this.selectedServiceArea1.id > 0) {
      processIds = this.allMapping.filter(x => x.servicE_AREA_ID == this.selectedServiceArea1.id && x.isactive).map(y => y.procesS_ID);
      this.mappingList.forEach(x => {
        if (processIds.indexOf(x.id) > -1) {
          x.bSelected = true;
          tempProcess.push(x);
        }
      })
      processAreaIds = tempProcess.map(x => x.procesS_AREA_ID).filter((x, i, a) => a.indexOf(x) == i);
      this.selectedProcessArea1 = this.OriginalProcessAreaList.filter(x => processAreaIds.indexOf(x.id) > -1);
    }

    this.mappingList = tempProcess;
    this.mappingList.sort((x, y) => Number(y.bSelected) - Number(x.bSelected));
    this.refreshTable1(this.mappingList);
  }

  determineIfMapped() {
    this.ServiceAreaList.forEach(x => {
      let element = this.allMapping.find(y => y.servicE_AREA_ID == x.id)
      if (element == undefined)
        x.isMapped = false;
      else
        x.isMapped = true;
    });
    // this.ServiceAreaList.sort((a, b) => {
    //   return Number(a.isMapped) - Number(b.isMapped)
    // });
  }

  OnProcessAreafilterChange() {
    this.mappingList = this.originalMappingList;
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
    this.mappingList.sort((a, b) => Number(b.bSelected) - Number(a.bSelected));
    this.refreshTable1(tempProcess);
  }

  EditRow_onClick(model: ServiceAreaModelNew) {
    this.newServiceArea = model;
    this.isServiceAreaEditMode = true;
  }

  DeleteRow_onClick(model: ServiceAreaModelNew) {
    this.service_DeleteServiceArea(model);
  }

  applyFilterForServiceArea(filterValue: string) {
    this.ServiceAreaList = this.MasterServiceAreaList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  openedChangeSAL(opened: boolean) {
    this.searchValueSAL = "";
    this.applyFilterForServiceArea(this.searchValueSAL);
  }

  applyFilterForProcessArea(filterValue: string) {
    this.ProcessAreaList = this.MasterProcessAreaList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }


  applyFilterForMapProcessArea(filterValue: string) {
    this.ProcessAreaList = this.MasterMapProcessAreaList.filter(p =>
      this.selectedProcessArea1.some(x => x.title == p.title) ||
      p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  openedChangePAL(opened: boolean) {
    this.searchValuePAL = "";
    this.applyFilterForProcessArea(this.searchValuePAL);
  }

  applyFilterForMapServiceArea(filterValue: string) {
    this.ServiceAreaList = this.MasterMapServiceAreaList.filter(p => p.title.toLowerCase().includes(filterValue.toLowerCase()));
  }

  openedChangeMSAL(opened: boolean) {
    this.searchValueMSAL = "";
    this.applyFilterForMapServiceArea(this.searchValueMSAL);
  }

  openedChangeMPAL(opened: boolean) {
    this.searchValueMPAL = "";
    this.applyFilterForMapProcessArea(this.searchValueMPAL);
  }
  applyTableFilter() {
    const filterValue = this.filterValue.trim().toLowerCase();
    if (filterValue === '') {
      this.refreshServiceAreaTable(this.ServiceAreaList);
    } 
    else{
      this.filteredServiceAreaDataSource.data = this.serviceAreaDataSource.data.filter(item => {
        return item.title.toLowerCase().includes(filterValue);
      });
    }

  }

}