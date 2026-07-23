import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { ProcessAreaModelNew, ProcessModelNew } from '../../../core/models/audit-checklist-based-model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-process-area',
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
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './process-area.component.html',
  styleUrls: ['./process-area.component.scss']
})
export class ProcessAreaComponent implements OnInit, AfterViewInit {
  selectedProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  bAddNewProcessArea: boolean = false;
  isProcessAreaAdded: boolean = true;
  ProcessAreaList: ProcessAreaModelNew[] = [];
  FilteredProcessAreaList: ProcessAreaModelNew[] = [];
  ProcessList: ProcessModelNew[] = [];
  ProcessModelReferenceList: any;
  overallProcessModelReferenceList: any;
  newProcessArea: ProcessAreaModelNew = new ProcessAreaModelNew();
  ProcessList_Map: any;
  displayedColumns = ["index", "procesS_AREA_ID", "title", "description", "clausE_REFERENCE", "action"];
  processAreaDisplayedColumns = ["index", "title", "description", "action"];
  
  iEditIndex = -1;
  dataSource = new MatTableDataSource<ProcessModelNew>(this.ProcessList);
  processAreaDataSource = new MatTableDataSource<ProcessAreaModelNew>(this.ProcessAreaList);
  isProcessAreaEditMode: boolean = false;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searcharea') searcharea!: ElementRef;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('processAreaPaginator') processAreaPaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
  numberPattern = /^[0-9\s]+$/;

  constructor(
    private _util: MyUtility, 
    private _appservice: AppsService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.service_GetProcessAreaList();
    this.service_GetProcessList();
    this.getAllProcessModelReferenceList();
    this.dataSource.filterPredicate = this.createFilter();
    this.ProcessList_Map = this.ProcessAreaList;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.createFilter();
      if (this.processAreaPaginator) {
        this.processAreaDataSource.paginator = this.processAreaPaginator;
      }
    }, 100);
  }

  getMappedColor(item: any): string {
    this.ProcessList_Map.forEach((area: any) => {
      area.isMapped = this.ProcessList.some(process => process.procesS_AREA_ID === area.id);
    });
    return item.isMapped ? 'green' : 'red';
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const searchTerms = filter.toLowerCase().split(' ');
      return searchTerms.every(term => {
        return (
          (data.description && data.description.toLowerCase().includes(term)) ||
          (data.title && data.title.toLowerCase().includes(term)) ||
          this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(term)
        );
      });
    };
    return filterFunction;
  }

  refreshProcessAreaTable(ProcessAreaList: ProcessAreaModelNew[]) {
    this.processAreaDataSource.data = [...this.ProcessAreaList];
    // Ensure paginator is connected after data update
    if (this.processAreaPaginator) {
      this.processAreaDataSource.paginator = this.processAreaPaginator;
      // Reset to first page after data update
      this.processAreaPaginator.firstPage();
    }
  }

  EditRow_onClick(row: ProcessModelNew, id: number) {
    this.FilteredProcessAreaList = this.ProcessAreaList;
    this.iEditIndex = id;
  }

  SaveRow_onClick(row: ProcessModelNew) {
    if (this.validateProcessFields(row)) {
      this.service_UpdateProcess(row);
      this.iEditIndex = -1;
    }
  }

  CancelEdit_onClick(row: ProcessModelNew) {
    this.iEditIndex = -1;
    if (row.id === 0 || row.id == undefined) {
      const index = this.ProcessList.indexOf(row);
      if (index > -1) {
        this.ProcessList.splice(index, 1);
      }
      this.dataSource.data = [...this.ProcessList];
    }
  }

  DeleteRow_onClick(row: ProcessModelNew) {
    if (row.id === 0) {
      const index = this.ProcessList.indexOf(row);
      if (index > -1) {
        this.ProcessList.splice(index, 1);
      }
      this.dataSource.data = [...this.ProcessList];
    } else {
      this.service_DeleteProcess(row);
    }
  }

  btnAddProcessArea_Onclick() {
    this.bAddNewProcessArea = true;
    this.isProcessAreaEditMode = false;
    this.service_GetProcessAreaList();
    this.newProcessArea = new ProcessAreaModelNew();
  }

  btnSaveProcessArea_Onclick() {
    if (this.newProcessArea.title == undefined || this.newProcessArea.title.trim() == "") {
      this._util.showError("Please enter Process Area");
      return;
    }
    if ((this.specialCharPattern.test(this.newProcessArea.title)) || this.numberPattern.test(this.newProcessArea.title)) {
      this._util.showError('Please enter alphanumeric or numeric values along with special characters for title');
      return;
    }
    if (this.newProcessArea.description && ((this.specialCharPattern.test(this.newProcessArea.description)) || this.numberPattern.test(this.newProcessArea.description))) {
      this._util.showError('Please enter alphanumeric or numeric values along with special characters for description');
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
    this.dataSource.data = [...this.ProcessList];
  }

  getProcessArea(id: number): string {
    if (this.ProcessAreaList != null && this.ProcessAreaList != undefined && this.ProcessAreaList.length > 0) {
      var process = this.ProcessAreaList && this.ProcessAreaList.find(x => x.id == id);
      if (process != null && process != undefined) {
        return process.title;
      } else {
        return '';
      }
    }
    return '';
  }

  getProcessModelReference(modelReferenceList: number[]): string {
    if (this.overallProcessModelReferenceList && this.overallProcessModelReferenceList.length > 0 &&
      modelReferenceList && modelReferenceList.length > 0) {
      const ProcessModelNames = this.overallProcessModelReferenceList
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

  resetFilterValue(opened: boolean, modelReferenceList: number[]) {
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.value = '';
      this.applyFilterForISO(this.searchInput.nativeElement.value, modelReferenceList);
    }
  }

  applyFilterForISO(value: string, modelReferenceList: number[]) {
    if (!this.overallProcessModelReferenceList || !this.overallProcessModelReferenceList.length) return;
  
    const searchTerm = value.toLowerCase();
    
    this.ProcessModelReferenceList = this.overallProcessModelReferenceList
      .map((iso: any) => {
        const searchedItems: any[] = [];
        const selectedItems: any[] = [];
        
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
      .filter((iso: any) => iso !== null);
  }

  applyFilter(event: string) {
    this.dataSource.filter = event;
    if (event) {
      this.dataSource.filterPredicate = (data, filter: string) =>
        this.createFilter()(data, filter) || this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(filter);
    } else {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }

  applyProcessAreaFilter(event: string) {
    const filterValue = event.toLowerCase();
    this.FilteredProcessAreaList = this.ProcessAreaList.filter(item =>
      item.title.toLowerCase().includes(filterValue)
    );
  }

  applyFilterProcessArea(event: string) {
    const filterValue = event.toLowerCase();
    this.ProcessList_Map = this.ProcessAreaList.filter(item =>
      item.title.toLowerCase().includes(filterValue)
    );
  }

  applySelectionFilter(event: MatSelectChange) {
    // Handle "All Process Areas" option (null value) to clear the filter
    if (!event.value || event.value === null) {
      this.dataSource.filter = '';
      this.dataSource.filterPredicate = this.createFilter();
    } else {
      this.dataSource.filter = event.value.title;
      if (event.value.title) {
        this.dataSource.filterPredicate = (data, filter: string) =>
          this.getProcessArea(data.procesS_AREA_ID).toLowerCase().includes(filter);
      }
    }
    this.refreshProcessAreaTable(this.ProcessAreaList);
  }

  getAllProcessModelReferenceList() {
    this._appservice.getAllProcessModelReferenceList().subscribe({
      next: (data: any) => {
        this.ProcessModelReferenceList = data;
        this.overallProcessModelReferenceList = data;
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_GetProcessList() {
    this._appservice.getProcessList().subscribe({
      next: (data: any) => {
        // Filter out soft-deleted (inactive) records
        this.ProcessList = data.filter((item: ProcessModelNew) => item.isactive !== false);
        this.dataSource.data = [...this.ProcessList];
        // Reset paginator to refresh the count display
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  containsAnyLetters(str: string): boolean {
    return /[a-zA-Z]/.test(str);
  }

  validateProcessFields(process: ProcessModelNew): boolean {
    if (process.procesS_AREA_ID == null || process.procesS_AREA_ID == 0) {
      this._util.showError('Please select Process Area');
      return false;
    }
    if (process.title == null || process.title.trim() == "") {
      this._util.showError('Please enter Process Title');
      return false;
    }
    if (!this.containsAnyLetters(process.title.trim())) {
      this._util.showError('Please enter valid Process Title');
      return false;
    }
    if (process.description == null || process.description.trim() == "") {
      this._util.showError('Please enter Process Description');
      return false;
    }
    if (!this.containsAnyLetters(process.description.trim())) {
      this._util.showError('Please enter valid Process Description');
      return false;
    }
    if (process.procesS_MODEL_REFERENCE_LIST == null || process.procesS_MODEL_REFERENCE_LIST.length == 0) {
      this._util.showError('Please select ISO Reference');
      return false;
    }
    return true;
  }

  service_UpdateProcess(process: ProcessModelNew) {
    this._appservice.UpdateProcess(process).subscribe({
      next: (data: any) => {
        this._util.showSuccess('Mapping done successfully');
        this.service_GetProcessAreaList();
        this.service_GetProcessList();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_DeleteProcess(process: ProcessModelNew) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Process Area Mapping',
        message: 'Are you sure you want to delete Process Area Mapping?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._appservice.DeleteProcessNew(process).subscribe({
          next: (data: any) => {
            this._util.showSuccess('Process Area Mapping Deleted successfully');
            this.service_GetProcessAreaList();
            this.service_GetProcessList();
          }, 
          error: (error) => { this._util.serviceError(error); }
        });
      }
    });
  }

  service_GetProcessAreaList() {
    this._appservice.getProcessAreaList().subscribe({
      next: (data: any) => {
        // Filter out soft-deleted (inactive) records
        const activeData = data.filter((item: ProcessAreaModelNew) => item.isactive !== false);
        this.ProcessAreaList = activeData;
        this.FilteredProcessAreaList = activeData;
        this.ProcessList_Map = activeData;
        this.refreshProcessAreaTable(this.ProcessAreaList);
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_AddProcessArea(processArea: ProcessAreaModelNew) {
    this.isProcessAreaAdded = false;
    this._appservice.AddProcessAreaNew(processArea).subscribe({
      next: (data: any) => {
        this.service_GetProcessAreaList();
        this.service_GetProcessList();
        this._util.showSuccess("Process Area Added Successfully");
        this.isProcessAreaAdded = true;
        this.bAddNewProcessArea = true;
        this.newProcessArea = new ProcessAreaModelNew();
      }, 
      error: (error) => { 
        this._util.serviceError(error); 
        this.isProcessAreaAdded = true;
      }
    });
  }

  service_UpdateProcessArea(processArea: ProcessAreaModelNew) {
    this._appservice.UpdateProcessArea(processArea).subscribe({
      next: (data: any) => {
        this.service_GetProcessAreaList();
        this._util.showSuccess("Process Area Updated Successfully");
        this.bAddNewProcessArea = true;
        this.isProcessAreaEditMode = false;
        this.newProcessArea = new ProcessAreaModelNew();
      }, 
      error: (error) => { this._util.serviceError(error); }
    });
  }

  service_DeleteProcessArea(processArea: ProcessAreaModelNew) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Process Area',
        message: 'Are you sure you want to delete the Process Area?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._appservice.DeleteProcessAreaNew(processArea).subscribe({
          next: (data: any) => {
            this._util.showSuccess("Process Area Deleted Successfully");
            // Refresh both lists to reflect the deletion
            this.service_GetProcessAreaList();
            this.service_GetProcessList();
            // Reset the form if it was open
            this.newProcessArea = new ProcessAreaModelNew();
          }, 
          error: (error) => { this._util.serviceError(error); }
        });
      }
    });
  }

  ProcessEditRow_onClick(model: ProcessAreaModelNew) {
    this.newProcessArea = { ...model };
    this.bAddNewProcessArea = true;
    this.isProcessAreaEditMode = true;
  }

  ProcessDeleteRow_onClick(model: ProcessAreaModelNew) {
    this.newProcessArea = model;
    this.service_DeleteProcessArea(model);
  }
}
