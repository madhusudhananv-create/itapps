import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatSelectChange } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { ProcessAreaModelNew, ProcessModel, ProcessModelNew } from '../../../models/audit-checklist-based-model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-process-area',
  templateUrl: './process-area.component.html',
  styleUrls: ['./process-area.component.scss'],
})
export class ProcessAreaComponent implements OnInit {
  selectedProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  bAddNewProcessArea: Boolean = false;
  isProcessAreaAdded: boolean = true;
  ProcessAreaList: ProcessAreaModelNew[] = [];
  FilteredProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: ProcessModelNew[] = [];
  @ViewChild(MatSort) sort: MatSort;
  ProcessModelReferenceList: any;
  overallProcessModelReferenceList: any;
  @ViewChild(MatSort) set content(sort: MatSort) {
    if (this.dataSource != undefined)
      this.dataSource.sort = sort;
  }
  newProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  ProcessList_Map: any;
  displayedColumns = ["index", "procesS_AREA_ID", "title", "description", "clausE_REFERENCE", "action"];
  processAreaDisplayedColumns = ["index", "title", "description", "action"];

  constructor(private _util: myUtility, private _appservice: AppsService) { }
  iEditIndex = -1;
  dataSource = new MatTableDataSource(this.ProcessList);
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searcharea') searcharea: ElementRef;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('processAreaPaginator') processAreaPaginator: MatPaginator;

  processAreaDataSource = new MatTableDataSource(this.ProcessAreaList);
  isProcessAreaEditMode: boolean = false;

  ngOnInit() {
    if (this.ProcessAreaList.length == 0)
      this.ProcessAreaList.push(this.selectedProcessArea);
    this.service_GetProcessAreaList();
    this.service_GetProcessList();
    this.getAllProcessModelReferenceList();
    this.dataSource.filterPredicate = this.createFilter();
    this.dataSource.filterPredicate = this.createFilter_map();
    this.ProcessList_Map = this.ProcessAreaList;
    
    
  }
  getMappedColor(item: any): string {
    
    this.ProcessList_Map.forEach(item => {
      item.isMapped = this.ProcessList.some(process => process.procesS_AREA_ID === item.id);
    });
    return item.isMapped ? 'green' : 'red';

  }

  ngOnChanges() {
    this.service_GetProcessAreaList();
    this.service_GetProcessAreaList();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.service_GetProcessAreaList();
    });
  }
  createFilter_map(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');
      return searchTerms.every(term => {
        return (
         
          this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(term)
        );
      });
    };
    return filterFunction;
  }
  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');

      return searchTerms.every(term => {
        return (

          data.description.toLowerCase().includes(term) ||
          data.title.toLowerCase().includes(term) ||
          this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(term)

        );
      });
    };

    return filterFunction;
  }

  refreshProcessAreaTable(ProcessAreaList) {
    this.processAreaDataSource = new MatTableDataSource(this.ProcessAreaList);
    this.processAreaDataSource.paginator = this.processAreaPaginator;
    this.processAreaDataSource.sort = this.sort;
  }

  EditRow_onClick(row, id) {
    this.FilteredProcessAreaList = this.ProcessAreaList;
    this.iEditIndex = id;
  }
  SaveRow_onClick(row) {
    if (this.validateProcessFields(row)) {
      this.service_UpdateProcess(row);
      this.iEditIndex = -1;
    }
  }
  CancelEdit_onClick(row) {
    this.iEditIndex = -1;
    if (row.id === 0 || row.id == undefined) {
      this.ProcessList.splice(this.ProcessList.indexOf(row), 1);
      this.dataSource = new MatTableDataSource(this.ProcessList);
      this.dataSource.paginator = this.paginator
    }
  }
  DeleteRow_onClick(row) {
    if (row.id === 0) {
      this.ProcessList.splice(this.ProcessList.indexOf(row), 1);
      this.dataSource = new MatTableDataSource(this.ProcessList);
      this.dataSource.paginator = this.paginator
    }
    else
      this.service_DeleteProcess(row);

  }
  btnAddProcessArea_Onclick() {
    this.bAddNewProcessArea = true;
    this.isProcessAreaEditMode = false;
    this.service_GetProcessAreaList();
    this.newProcessArea = new ProcessAreaModelNew();
  }
  btnSaveProcessArea_Onclick() {
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.newProcessArea.title == undefined || this.newProcessArea.title.trim() == "") {
      alert("Please enter Process Area");
      return;
    }
    if ((specialCharPattern.test(this.newProcessArea.title)) || numberPattern.test(this.newProcessArea.title)) {
      alert('Please enter alphanumeric or numeric values along with special characters for title');
      return;
    }
    if ((specialCharPattern.test(this.newProcessArea.description)) || numberPattern.test(this.newProcessArea.description)) {
      alert('Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }
    if (!this.isProcessAreaEditMode)
      this.service_AddProcessArea(this.newProcessArea);
    else
      this.service_UpdateProcessArea(this.newProcessArea);
  }

  btnClearProcessArea_Onclick() {
    this.isProcessAreaEditMode = false;
    this.newProcessArea = new ProcessAreaModelNew();
  }


  btnCancelProcessArea_Onclick() {
    this.bAddNewProcessArea = false;
    this.isProcessAreaEditMode = false;
    this.newProcessArea = new ProcessAreaModelNew();
  }
  btnAddProcess_Onclick() {
    var filtered = this.ProcessList.filter(x => (x.procesS_AREA_ID == 0)
      && (x.title == null || x.title == undefined || x.title === ""));

    if (filtered.length > 0) return;
    this.iEditIndex = 0;
    this.ProcessList.unshift(new ProcessModelNew());
    this.dataSource = new MatTableDataSource(this.ProcessList);
    this.dataSource.paginator = this.paginator;
  }

  getProcessArea(id) {
    if (this.ProcessAreaList != null && this.ProcessAreaList != undefined && this.ProcessAreaList.length > 0) {
      var process = this.ProcessAreaList && this.ProcessAreaList.find(x => x.id == id);
      if (process != null && process != undefined) {
        return process.title;
      }
      else {
        return '';
      }
    }
  }

  getProcessModelReference(modelReferenceList: number[]): string {
    if (this.overallProcessModelReferenceList && this.overallProcessModelReferenceList.length > 0 &&
      modelReferenceList && modelReferenceList.length > 0) {
      const ProcessModelNames = this.overallProcessModelReferenceList
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

  resetFilterValue(opened: boolean, modelReferenceList: number[]) {
    this.searchInput.nativeElement.value = '';
    this.applyFilterForISO(this.searchInput.nativeElement.value, modelReferenceList);
  }

  applyFilterForISO(value: string, modelReferenceList: number[]) {
    if (!this.overallProcessModelReferenceList || !this.overallProcessModelReferenceList.length) return;
  
    const searchTerm = value.toLowerCase();
    
    this.ProcessModelReferenceList = this.overallProcessModelReferenceList
      .map(iso => {
        const searchedItems: typeof iso.items = [];
        const selectedItems: typeof iso.items = [];
        
        for (const item of iso.items) {
          const isSelected = modelReferenceList.includes(item.procesS_MODEL_REFERENCE_LIST);
          const matchesSearch = item.sectioN_REFERENCE.toLowerCase().includes(searchTerm);
          
          if (matchesSearch && !isSelected) {
            searchedItems.push(item);
          } else if (isSelected) {
            selectedItems.push(item);
          }
        }
        
        return searchedItems.length || selectedItems.length
          ? { ...iso, items: [...searchedItems, ...selectedItems] }
          : null;
      })
      .filter((iso): iso is NonNullable<typeof iso> => iso !== null);
  }

  applyFilter(event) {
    this.dataSource.filter = event;
    if (event) {
      this.dataSource.filterPredicate = (data, filter: string) =>
        this.createFilter()(data, filter) || this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(filter);
    } else {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }
  applyProcessAreaFilter(event) {
    const filterValue = event.toLowerCase();

    // Filter the original list and update filteredProcessAreaView
    this.FilteredProcessAreaList = this.ProcessAreaList.filter(item =>
      item.title.toLowerCase().includes(filterValue)
    );
  }
  applyFilterProcessArea(event) {
    const filterValue = event.toLowerCase();
    this.ProcessList_Map = this.ProcessAreaList.filter(item =>
      item.title.toLowerCase().includes(filterValue)
    );
  }
  applySelectionFilter(event: MatSelectChange) {    
    this.dataSource.filter = event.value.title;
    if (event.value.title) {
      this.dataSource.filterPredicate = (data, filter: string) =>
        this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(filter) || this.createFilter_map()(data, filter) ;
    }
    this.refreshProcessAreaTable(this.dataSource.filter = event.value.title);
  }

  getAllProcessModelReferenceList() {
    this._appservice.getAllProcessModelReferenceList().subscribe(data => {
      this.ProcessModelReferenceList = data;
      this.overallProcessModelReferenceList = data;
    }, error => { this._util.serviceError(error); });
  }

  service_GetProcessList() {
    this._appservice.getProcessList().subscribe(data => {
      this.ProcessList = data;
      this.dataSource = new MatTableDataSource(this.ProcessList);
      this.dataSource.paginator = this.paginator;
    }, error => { this._util.serviceError(error); });
  }
  containsAnyLetters(str): boolean {
    return /[a-zA-Z]/.test(str);
  }
  validateProcessFields(process: ProcessModelNew): boolean {
    if (process.procesS_AREA_ID == null || process.procesS_AREA_ID == 0) {
      alert('Please select Process Area');
      return false;
    }
    if (process.title == null || process.title.trim() == "") {
      alert('Please enter Process Title');
      return false;
    }
    if (!this.containsAnyLetters(process.title.trim())) {
      alert('Please enter valid Process Title');
      return false;
    }
    if (process.description == null || process.description.trim() == "") {
      alert('Please enter Process Description');
      return false;
    }
    if (!this.containsAnyLetters(process.description.trim())) {
      alert('Please enter valid Process Description');
      return false;
    }
    if (process.procesS_MODEL_REFERENCE_LIST == null || process.procesS_MODEL_REFERENCE_LIST.length == 0) {
      alert('Please select ISO Reference');
      return false;
    }
    return true;
  }

  service_UpdateProcess(process: ProcessModelNew) {
    this._appservice.UpdateProcess(process).subscribe(data => {
      alert('Mapping done successfully');
      this.service_GetProcessAreaList();
      this.service_GetProcessList();
    }, error => { this._util.serviceError(error); });
  }
  service_DeleteProcess(process: ProcessModelNew) {
    if (confirm('Are you sure you want to delete Process Area Mapping?')) {
      this._appservice.DeleteProcess(process).subscribe(data => {
        alert('Process Area Mapping Deleted successfully');
        this.service_GetProcessAreaList();
        this.service_GetProcessList();
      }, error => { this._util.serviceError(error); });
    }
  }
  service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe(data => {
      this.ProcessAreaList = data;
      this.FilteredProcessAreaList = data;
      this.ProcessList_Map = data;
      this.dataSource = new MatTableDataSource(this.ProcessList);
      
       
      this.dataSource.paginator = this.paginator;

      this.refreshProcessAreaTable(this.ProcessAreaList);
    }, error => { this._util.serviceError(error); });
  }

  service_AddProcessArea(processArea: ProcessAreaModelNew) {
    this.isProcessAreaAdded = false;
    this._appservice.AddProcessAreaNew(processArea).subscribe(data => {
      this.service_GetProcessAreaList();
      this.service_GetProcessList();
      alert("Process Area Added Successfully");
      this.isProcessAreaAdded = true;
      this.bAddNewProcessArea = true;
      this.newProcessArea = new ProcessAreaModelNew();
    }, error => { this._util.serviceError(error); this.isProcessAreaAdded = true });
  }

  service_UpdateProcessArea(processArea: ProcessAreaModelNew) {
    this._appservice.UpdateProcessArea(processArea).subscribe(data => {
      this.service_GetProcessAreaList();
      alert("Process Area Updated Successfully");
      this.bAddNewProcessArea = true;
      this.isProcessAreaEditMode = false;
      this.newProcessArea = new ProcessAreaModelNew();
    }, error => { this._util.serviceError(error); });
  }

  service_DeleteProcessArea(processArea: ProcessAreaModelNew) {
    if (confirm('Are you sure you want to delete the Process Area ?')) {
      this._appservice.DeleteProcessArea(processArea).subscribe(data => {
        this.service_GetProcessAreaList();
        alert("Process Area Deleted Successfully");
        this.bAddNewProcessArea = true;
        this.newProcessArea = new ProcessAreaModelNew();
      }, error => { this._util.serviceError(error); });
    }
  }

  ProcessEditRow_onClick(model: ProcessAreaModelNew) {
    this.newProcessArea = model;
    this.bAddNewProcessArea = true;
    this.isProcessAreaEditMode = true;
  }

  ProcessDeleteRow_onClick(model: ProcessAreaModelNew) {
    this.newProcessArea = model;
    this.service_DeleteProcessArea(model);
  }


}
