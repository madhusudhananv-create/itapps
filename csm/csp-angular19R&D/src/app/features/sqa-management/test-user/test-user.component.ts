/**
 * Test User Component - Migrated from Legacy
 * Manages Process Model Tests and their mapping to Controls
 * Features: Add/Edit/Delete tests, Map tests to controls
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

// Interfaces
interface ProcessModelTestsNew {
  id?: number;
  title: string;
  description: string;
  classification?: string;
  referencE_DOCUMENT?: string;
  filE_NAME_SERVER?: string;
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
}

interface ProcessModelControlNew {
  id: number;
  title: string;
  description: string;
  controL_TYPE: string;
  category: number;
  requiremenT_REFERENCE: string;
  isactive: boolean;
  classification: string;
  automation: string;
  assertion: string;
  controL_OWNER: string;
  [key: string]: any;
}

interface TestControlsMapping {
  procesS_MODEL_TESTS_NEW: ProcessModelTestsNew;
  procesS_MODEL_CONTROL_NEW: ProcessModelControlNew[];
}

@Component({
  selector: 'app-test-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './test-user.component.html',
  styleUrls: ['./test-user.component.scss']
})
export class TestUserComponent implements OnInit {
  
  // Data collections
  tests: TestControlsMapping[] = [];
  controls: ProcessModelControlNew[] = [];
  dataSource: MatTableDataSource<TestControlsMapping> = new MatTableDataSource<TestControlsMapping>();
  
  // Form controls
  selectedOptions = new FormControl();
  
  // Edit state
  iEditIndex: number = -1;
  title: string = '';
  description: string = '';
  controlmodel: ProcessModelControlNew[] = [];
  
  // Table columns
  displayedColumns = ['id', 'title', 'description', 'controls', 'action'];
  
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.Service_LoadData();
    this.Service_GetControlList();
  }

  Service_LoadData() {
    this._appService.getTestsControlData().subscribe({
      next: (data: any[]) => {
        this.tests = data;
        this.refreshTable(this.tests);
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  refreshTable(source: TestControlsMapping[]) {
    this.dataSource = new MatTableDataSource(source);
  }

  Service_GetControlList() {
    this._appService.getControlList().subscribe({
      next: (data: any[]) => {
        this.controls = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  displayAsAString(object: ProcessModelControlNew[]): string {
    if (object && object.length > 0) {
      return object.map(s => s.title).join(', ');
    }
    return "Not Mapped";
  }

  AddNewTestRow() {
    const newtest: TestControlsMapping = {
      procesS_MODEL_TESTS_NEW: {
        id: 0,
        title: '',
        description: '',
        isactive: true
      },
      procesS_MODEL_CONTROL_NEW: []
    };
    
    this.title = "";
    this.description = "";
    this.controlmodel = [];
    this.iEditIndex = this.tests.length;
    this.tests.push(newtest);
    this.refreshTable(this.tests);
  }

  compareFn(x: any, y: any): boolean {
    return x && y ? x.id === y.id : x === y;
  }

  SaveRow_onClick(element: TestControlsMapping) {
    if (!this.title || !this.description) {
      this._util.showError('Please enter test title and description');
      return;
    }

    const mapping: TestControlsMapping = {
      procesS_MODEL_TESTS_NEW: {
        id: element.procesS_MODEL_TESTS_NEW.id || 0,
        title: this.title,
        description: this.description,
        isactive: true
      },
      procesS_MODEL_CONTROL_NEW: this.controlmodel
    };

    if (mapping.procesS_MODEL_TESTS_NEW.id === 0) {
      this.Service_AddTestControls(mapping);
    } else {
      this.Service_UpdateTestControls(mapping);
    }
    this.iEditIndex = -1;
  }

  EditRow_onClick(element: TestControlsMapping, id: number) {
    this.iEditIndex = id;
    this.title = element.procesS_MODEL_TESTS_NEW.title;
    this.description = element.procesS_MODEL_TESTS_NEW.description;
    this.controlmodel = element.procesS_MODEL_CONTROL_NEW || [];
  }

  CancelEdit_onClick() {
    this.iEditIndex = -1;
    this.title = '';
    this.description = '';
    this.controlmodel = [];
  }

  Service_AddTestControls(element: TestControlsMapping) {
    this._appService.addTestControls(element).subscribe({
      next: (data: any) => {
        this._util.showSuccess('Test controls mapping done successfully');
        this.Service_LoadData();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_UpdateTestControls(element: TestControlsMapping) {
    this._appService.updateTestControls(element).subscribe({
      next: (data: any) => {
        this._util.showSuccess('Test controls mapping updated successfully');
        this.Service_LoadData();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  DeleteRow_OnClick(element: TestControlsMapping) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Test',
        message: 'Are you sure you want to delete this test?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!element.procesS_MODEL_TESTS_NEW || element.procesS_MODEL_TESTS_NEW.id === 0) {
          // Delete unsaved row
          this.tests.splice(this.tests.indexOf(element), 1);
          this.refreshTable(this.tests);
        } else {
          // Delete saved row
          this.Service_DeleteTestControls(element);
        }
      }
    });
  }

  Service_DeleteTestControls(deletedata: TestControlsMapping) {
    this._appService.deleteTestControls(deletedata).subscribe({
      next: (data: any) => {
        this._util.showSuccess('Deleted successfully');
        this.Service_LoadData();
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }
}
