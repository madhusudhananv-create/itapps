/**
 * Control User Component - Migrated from Legacy
 * Manages Process Controls and their mapping to Risks
 * Features: Add/Edit/Delete controls, Control categorization, Control-Risk mapping
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

// Interfaces
interface ControlCategory {
  id?: number;
  description: string;
  procesS_MODEL_ID: number;
  [key: string]: any;
}

interface ControlReference {
  id?: number;
  description: string;
  controL_CATEGORY_ID: number;
  [key: string]: any;
}

interface ProcessModelControlNew {
  id?: number;
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

interface ProcessModelRisksNew {
  id: number;
  title: string;
  description: string;
  [key: string]: any;
}

interface ControlRisksMappingModel {
  procesS_MODEL_CONTROL_NEW: ProcessModelControlNew;
  procesS_MODEL_RISKS_NEW: ProcessModelRisksNew[];
  procesS_MODELVIEW_FOR_CONTROL?: any;
  [key: string]: any;
}

interface Classify {
  id: number;
  title: string;
  [key: string]: any;
}

interface ProcessModelNew {
  id: number;
  title: string;
  [key: string]: any;
}

@Component({
  selector: 'app-control-user',
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
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './control-user.component.html',
  styleUrls: ['./control-user.component.scss']
})
export class ControlUserComponent implements OnInit {
  
  // View states
  viewmode: boolean = true;
  editmode: boolean = false;
  showAddCategory: boolean = false;
  showAddReference: boolean = false;
  
  // Data collections
  ProcessModel: ProcessModelNew[] = [];
  controlcategories: ControlCategory[] = [];
  controlreferences: ControlReference[] = [];
  originalControlCategories: ControlCategory[] = [];
  originalControlReferences: ControlReference[] = [];
  RiskList: ProcessModelRisksNew[] = [];
  classifications: Classify[] = [];
  controlRisksMapping: ControlRisksMappingModel[] = [];
  
  // Form data
  id: number = 0;
  title: string = '';
  description: string = '';
  processmodel: number | undefined;
  Category: number | undefined;
  ControlRef: number | undefined;
  ReqRef: string = '';
  ControlType: string = '';
  classify: string = '';
  auto: string = '';
  controlowner: string = '';
  
  // Arrays
  AssertionArray: string[] = [];
  RisksArray: number[] = [];
  AssertionList: string[] = ['Completeness', 'Validity', 'Accuracy', 'Existence', 'Valuation & Allocation'];
  
  // New category/reference
  newDescription: string = '';
  newRefDescription: string = '';
  newModelId: string = '';
  
  // Control objects
  controlnew: ProcessModelControlNew = {
    title: '',
    description: '',
    controL_TYPE: '',
    category: 0,
    requiremenT_REFERENCE: '',
    isactive: true,
    classification: '',
    automation: '',
    assertion: '',
    controL_OWNER: ''
  };
  risks: ProcessModelRisksNew[] = [];
  
  // Table
  dataSource: MatTableDataSource<ControlRisksMappingModel> = new MatTableDataSource<ControlRisksMappingModel>();
  displayedColumns = ['id', 'title', 'risks', 'owner', 'reference', 'description', 
    'category', 'model', 'reqref', 'controltype', 'classify', 'assertion', 'action'];
  
  @ViewChild('paginator') paginator!: MatPaginator;
  
  // Services
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  private dialog = inject(MatDialog);
  
  // Dropdowns
  ControlTypes = [
    { value: 'Key Control', viewValue: 'Key Control' },
    { value: 'Secondary Control', viewValue: 'Secondary Control' }
  ];
  
  AutomationTypes = [
    { value: 'Manual', viewValue: 'Manual' },
    { value: 'Automated', viewValue: 'Automated' },
    { value: 'Semi-Automated', viewValue: 'Semi-Automated' }
  ];
  
  ClassifyTypes = [
    { value: 'Preventive', viewValue: 'Preventive' },
    { value: 'Detective', viewValue: 'Detective' }
  ];

  ngOnInit() {
    this.Service_GetProcessModel();
    this.Service_GetRisknew();
    this.Service_Loaddata();
    this.Service_GetClassifications();
    this.Service_GetAllControlCategories();
    this.Service_GetAllControlReference();
  }

  Service_Loaddata() {
    this._appService.getControlRisksMappingData().subscribe({
      next: (data: any[]) => {
        this.controlRisksMapping = data;
        this.refreshTable(this.controlRisksMapping);
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  refreshTable(source: ControlRisksMappingModel[]) {
    this.dataSource = new MatTableDataSource(source);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  Service_GetClassifications() {
    this._appService.getClassifications().subscribe({
      next: (data: any[]) => {
        this.classifications = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetProcessModel() {
    this._appService.getProcessModel().subscribe({
      next: (data: any[]) => {
        this.ProcessModel = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetRisknew() {
    this._appService.GetProcessModelRisksNew().subscribe({
      next: (data: any[]) => {
        this.RiskList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetAllControlCategories() {
    this._appService.getAllControlCategories().subscribe({
      next: (data: any[]) => {
        this.originalControlCategories = data;
        this.controlcategories = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_GetAllControlReference() {
    this._appService.getAllControlReferences().subscribe({
      next: (data: any[]) => {
        this.originalControlReferences = data;
        this.controlreferences = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getControlCategoryByModelId(id: number) {
    this._appService.getControlCategoryByModelId(id).subscribe({
      next: (data: any[]) => {
        this.controlcategories = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getControlReferenceByCategoryId(categoryid: number) {
    this._appService.GetControlReferenceByCategoryId(categoryid).subscribe({
      next: (data: any[]) => {
        this.controlreferences = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  toggle_AddCategory() {
    this.showAddCategory = !this.showAddCategory;
  }

  toggle_AddReference() {
    this.showAddReference = !this.showAddReference;
  }

  AddNewCategory() {
    if (!this.processmodel || !this.newDescription) {
      this._util.showError('Please choose a Process Model and enter description');
      return;
    }

    const Category1: ControlCategory = {
      description: this.newDescription,
      procesS_MODEL_ID: this.processmodel
    };

    this.Service_AddControlCategory(Category1);
    this.newDescription = "";
    if (this.processmodel) {
      this.getControlCategoryByModelId(this.processmodel);
    }
    this.showAddCategory = false;
  }

  AddNewReference() {
    if (!this.Category || !this.newRefDescription) {
      this._util.showError('Please choose a Control Category and enter Reference description');
      return;
    }

    const Controlref1: ControlReference = {
      description: this.newRefDescription,
      controL_CATEGORY_ID: this.Category
    };

    this.Service_AddControlReference(Controlref1);
    this.newRefDescription = "";
    this.getControlReferenceByCategoryId(this.Category);
    this.showAddReference = false;
  }

  Service_AddControlReference(reference: ControlReference) {
    this._appService.addControlReference(reference).subscribe({
      next: (data: any[]) => {
        this.controlreferences = data;
        this._util.showSuccess('New Control Reference Added Successfully');
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  Service_AddControlCategory(category: ControlCategory) {
    this._appService.addControlCategory(category).subscribe({
      next: (data: any[]) => {
        this.controlcategories = data;
        this._util.showSuccess('New Control Category Added Successfully');
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  clearCategory() {
    this.newDescription = "";
    this.processmodel = undefined;
  }

  ShowCreatepanel() {
    this.editmode = true;
    this.viewmode = false;
    this.id = 0;
    this.clearForm();
  }

  CloseEditMode_OnClick() {
    this.editmode = false;
    this.viewmode = true;
    this.clearForm();
  }

  clearForm() {
    this.id = 0;
    this.title = '';
    this.description = '';
    this.processmodel = undefined;
    this.Category = undefined;
    this.ControlRef = undefined;
    this.ReqRef = '';
    this.ControlType = '';
    this.classify = '';
    this.auto = '';
    this.controlowner = '';
    this.AssertionArray = [];
    this.RisksArray = [];
  }

  submitForm() {
    if (!this.title || !this.description || !this.Category || !this.ControlType) {
      this._util.showError('Please enter all the mandatory fields');
      return;
    }

    this.controlnew = {
      id: this.id,
      title: this.title,
      description: this.description,
      controL_TYPE: this.ControlType,
      category: this.Category,
      requiremenT_REFERENCE: this.ReqRef,
      isactive: true,
      classification: this.classify,
      automation: this.auto,
      assertion: this.displayAsString(this.AssertionArray),
      controL_OWNER: this.controlowner
    };

    this.risks = this.RiskList.filter(x => this.RisksArray.indexOf(x.id) > -1);

    if (this.id === 0) {
      this._appService.addControlAndRisksMapping(this.controlnew, this.risks).subscribe({
        next: (data: any) => {
          this._util.showSuccess('Control added successfully');
          this.clearForm();
          this.Service_Loaddata();
          this.CloseEditMode_OnClick();
        },
        error: (error: any) => { this._util.serviceError(error); }
      });
    } else {
      const element: ControlRisksMappingModel = {
        procesS_MODEL_CONTROL_NEW: this.controlnew,
        procesS_MODEL_RISKS_NEW: this.risks
      };

      this._appService.updateControlAndRisksMapping(element).subscribe({
        next: (data: any) => {
          this._util.showSuccess('Control updated successfully');
          this.viewmode = true;
          this.editmode = false;
          this.Service_Loaddata();
        },
        error: (error: any) => { this._util.serviceError(error); }
      });
    }
  }

  displayAsString(array: string[]): string {
    if (!array || array.length === 0) return '';
    return array.join(', ');
  }

  displayObjectAsString(object: any[]): string {
    if (object && object.length > 0) {
      return object.map(s => s.title).join(', ');
    }
    return "Not Mapped";
  }

  getRiskTitleById(riskId: number): string {
    const risk = this.RiskList.find(r => r.id === riskId);
    return risk ? risk.title : '';
  }

  EditRow_onClick(element: ControlRisksMappingModel) {
    this.controlcategories = this.originalControlCategories;
    this.controlreferences = this.originalControlReferences;
    
    this.editmode = true;
    this.viewmode = false;
    this.id = element.procesS_MODEL_CONTROL_NEW.id || 0;
    this.title = element.procesS_MODEL_CONTROL_NEW.title;
    this.description = element.procesS_MODEL_CONTROL_NEW.description;
    
    if (element.procesS_MODELVIEW_FOR_CONTROL) {
      this.processmodel = element.procesS_MODELVIEW_FOR_CONTROL.procesS_MODEL?.id;
      this.Category = element.procesS_MODELVIEW_FOR_CONTROL.procesS_MODEL_CATEGORY?.id;
      this.ControlRef = element.procesS_MODELVIEW_FOR_CONTROL.procesS_MODEL_CONTROL_REFERENCE?.id;
    }
    
    this.ReqRef = element.procesS_MODEL_CONTROL_NEW.requiremenT_REFERENCE;
    this.auto = element.procesS_MODEL_CONTROL_NEW.automation;
    this.ControlType = element.procesS_MODEL_CONTROL_NEW.controL_TYPE;
    this.classify = element.procesS_MODEL_CONTROL_NEW.classification;
    this.AssertionArray = element.procesS_MODEL_CONTROL_NEW.assertion?.split(',') || [];
    this.RisksArray = element.procesS_MODEL_RISKS_NEW?.map(x => x.id) || [];
    this.controlowner = element.procesS_MODEL_CONTROL_NEW.controL_OWNER;
  }

  DeleteRow_onClick(element: ControlRisksMappingModel) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Control',
        message: 'Are you sure you want to delete this control?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._appService.getStatusOfControl(element.procesS_MODEL_CONTROL_NEW.id || 0).subscribe({
          next: (data: any) => {
            if (data) {
              this._util.showError('This Control cannot be deleted');
            } else {
              this._util.showWarning('Please get the consent from CSM/PM to delete this Control');
            }
          },
          error: (error: any) => { this._util.serviceError(error); }
        });
      }
    });
  }
}
