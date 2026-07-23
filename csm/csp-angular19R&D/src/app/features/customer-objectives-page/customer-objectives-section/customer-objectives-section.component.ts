import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';

import { MyUtility } from '../../../shared/my-utility';
import { ScopeModel, modelRow, projectScopes } from '../../../models/scope.model';
import { AppsService } from '../../../core/services/apps.service';
import { AccessControl } from '../../../shared/access-control';
import { ServiceAreaModelNew } from '../../../models/service-area.model';
import { DropdownFilterComponent } from '../../../shared/components/dropdown-filter/dropdown-filter.component';

/**
 * Customer Objectives Section Component
 * Manages project scope, objectives, deliverables, and in-scope service areas
 * Migrated from LEGACY-SOURCE/src/app/pages/layout/customer-objectives-page/customer-objectives-section/
 * 
 * Features:
 * - View/Edit project description
 * - Manage project scope, objectives, deliverables, constraints, assumptions
 * - Configure in-scope service areas with tools and technology
 * - Edit/Delete in-scope items
 * - Save/Cancel functionality
 * 
 * Migration Changes:
 * - Converted to standalone component
 * - Updated to use modern Angular 19 patterns
 * - All business logic preserved exactly from legacy
 */
@Component({
  selector: 'app-customer-objectives-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    DropdownFilterComponent
  ],
  templateUrl: './customer-objectives-section.component.html',
  styleUrls: ['./customer-objectives-section.component.scss']
})
export class CustomerObjectivesSectionComponent implements OnInit {

  @Input('selectedProj') input_projectid!: string;
  @Input('selectedCust') input_customerid!: string;
  
  panels: any;

  constructor(
    private _access: AccessControl, 
    private _http: HttpClient, 
    private _util: MyUtility, 
    private _appservice: AppsService, 
    private _router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.ResetScope();
  }

  ngOnChanges() {
    this.ResetScope();
  }

  scope_read: boolean = false;
  scope_edit: boolean = false;
  selectedDatanew!: ScopeModel;
  ServiceAreaList: ServiceAreaModelNew[] = [];
  InScopeDetailsList: any[] = [];
  dataSource = new MatTableDataSource<modelRow>([]);
  selectedServiceAreaToAdd!: ServiceAreaModelNew;

  columnDisplayNames: { [key: string]: string } = {
    'ServiceTower': 'Service Tower',
    'Tools': 'Tools',
    'Technology': 'Technology',
    'Action': 'Action'
  };

  columnDisplayNames_read: { [key: string]: string } = {
    'ServiceTower': 'Service Tower',
    'Tools': 'Tools',
    'Technology': 'Technology'
  };

  displayedColumns: string[] = ['ServiceTower', 'Tools', 'Technology', 'Action'];
  displayedColumns_read: string[] = ['ServiceTower', 'Tools', 'Technology'];
  
  columnWidths: { [key: string]: string } = {
    ServiceTower: '35%',
    Tools: '25%',
    Technology: '25%',
    Edit: '5%',
    Save: '5%',
    Delete: '5%',
    Action: '15%'
  };

  fields: Array<{ label: string; key: string; type: string; required?: boolean; options?: any[] }> = [
    { label: 'Objectives', key: 'objectives', type: 'textarea' },
    { label: 'Deliverables', key: 'deliverables', type: 'textarea' },
    { label: 'Constraints', key: 'constraints', type: 'textarea' },
    { label: 'Assumptions', key: 'assumptions', type: 'textarea' },
    { label: 'Out-Scope', key: 'ouT_SCOPE', type: 'textarea' }
  ];

  sections = [
    { title: 'Scope', property: 'scope' },
    { title: 'Objectives', property: 'objectives' },
    { title: 'Deliverables', property: 'deliverables' },
    { title: 'Constraints', property: 'constraints' },
    { title: 'Assumptions', property: 'assumptions' },
    { title: 'Out-Scope', property: 'ouT_SCOPE' }
  ];

  GetProjectScopeByProjId(projectID: string) {
    this._appservice.getProjectScopeByProjId(projectID).subscribe(
      data => {
        this.selectedDatanew = data;
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  Service_GetServiceAreaList() {
    this._appservice.getServiceAreaList().subscribe(
      data => {
        this.ServiceAreaList = data;
      }, 
      error => { 
        this._util.serviceError(error); 
      }
    );
  }

  GetProjectInScope(projectId: string) {
    this._appservice.GetProjectInScope(projectId).subscribe(
      data => {
        for (let r of data) {
          const selectedOption = this.ServiceAreaList.find(option => option.id == r.servicE_AREA_ID);
          if (selectedOption && selectedOption.title) {
            const newRow: modelRow = {
              ID: r.id,
              SERVICE_AREA_ID: r.servicE_AREA_ID,
              ServiceTower: selectedOption ? selectedOption.title : "",
              Tools: r.tools,
              Technology: r.technology,
              Project_Id: r.projecT_ID,
              Cust_Id: r.cusT_ID
            };
            this.dataSource.data.push(newRow);
          }
        }
        this.dataSource.data = [...this.dataSource.data];
      }, 
      error => { 
        this._util.serviceError(error); 
      }
    )
  }

  isEditing: boolean[] = [];

  editRow(row: any) {
    this.isEditing = new Array(this.dataSource.data.length).fill(false);
    const rowIndex = this.dataSource.data.indexOf(row);
    this.isEditing[rowIndex] = true;
  }

  DeleteRow_onClick(element: modelRow): void {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to delete the record?',
      'Delete Record'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.DeleteInScope(element).subscribe({
          next: (data) => {
            this.dataSource.data.splice(this.dataSource.data.indexOf(element), 1);
            this.dataSource.data = [...this.dataSource.data];
            this.showToast("Deleted successfully", 'success');
          },
          error: (error) => {
            this._util.serviceError(error);
            this.showToast("Failed to delete record", 'error');
          }
        });
      }
    });
  }

  toggleEditMode(rowIndex: number) {
    this.isEditing[rowIndex] = !this.isEditing[rowIndex];
    if (this.isEditing[rowIndex]) {
      this.showToast("Edit mode enabled for row", 'info');
    }
  }

  AddInScope(serviceid: number, tool: string, tech: string) {
    if ((serviceid == null || serviceid == undefined) && (tool == "" || tool == undefined) && (tech == "" || tech == undefined)) {
      this.showToast("Please fill the In-scope Details", 'warning');
      return;
    }
    
    if (serviceid > 0) {
      var serviceIdExists = this.dataSource.data.find(item => item.SERVICE_AREA_ID === serviceid);
    }
    
    if (serviceIdExists != null && serviceIdExists.SERVICE_AREA_ID != 0) {
      this.showToast("Service Tower already exists!", 'warning');
      return;
    }

    const selectedOption = this.ServiceAreaList.find(option => option.id == serviceid);

    const newRow: modelRow = {
      ID: 0,
      SERVICE_AREA_ID: serviceid,
      ServiceTower: selectedOption ? selectedOption.title : "",
      Tools: tool,
      Technology: tech,
      Project_Id: this.input_projectid,
      Cust_Id: this.input_customerid
    };
    
    this.dataSource.data.push(newRow);
    this.dataSource.data = [...this.dataSource.data];
    
    if (this.selectedDatanew) {
      this.selectedDatanew.serviceTower = null as any;
      this.selectedDatanew.tools = '';
      this.selectedDatanew.technologY_USED = '';
    }
    
    this.showToast("In-scope item added successfully", 'success');
  }

  ResetInscope() {
    this.Service_GetServiceAreaList();
    if (this.input_projectid)
      this.GetProjectInScope(this.input_projectid);
  }

  EditonClick() {
    this.dataSource.data = [];
    this.ResetInscope();
    this.scope_read = false;
    this.scope_edit = true;
    this.showToast("Edit mode enabled", 'info');
  }

  ResetScope(showCancelMessage: boolean = false) {
    if (showCancelMessage && this.scope_edit) {
      this.showToast("Changes cancelled", 'info');
    }
    this.scope_read = true;
    this.scope_edit = false;
    this.selectedDatanew = null as any;
    this.dataSource.data = [];
    if (this.input_projectid) {
      this.GetProjectScopeByProjId(this.input_projectid);
    }
    this.ResetInscope();
  }

  SaveScope() {
    // Validations
    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (!this.selectedDatanew.description) {
      this.showToast("Please enter Description", 'warning');
      return;
    }
    else if ((specialCharPattern.test(this.selectedDatanew.description)) || numberPattern.test(this.selectedDatanew.description)) {
      this.showToast('Please enter alphanumeric or numeric values along with special characters for description', 'warning');
      return;
    }

    let scopeModel: ScopeModel = new ScopeModel();
    scopeModel.projecT_ID = this.input_projectid;
    scopeModel.rag = this.selectedDatanew.rag;
    scopeModel.description = this.selectedDatanew.description;
    scopeModel.technologY_USED = this.selectedDatanew.technologY_USED;
    scopeModel.scope = this.selectedDatanew.scope;
    scopeModel.objectives = this.selectedDatanew.objectives;
    scopeModel.deliverables = this.selectedDatanew.deliverables;
    scopeModel.inScope_Id = this.selectedDatanew.inScope_Id;
    scopeModel.constraints = this.selectedDatanew.constraints;
    scopeModel.assumptions = this.selectedDatanew.assumptions;
    scopeModel.ouT_SCOPE = this.selectedDatanew.ouT_SCOPE;
    scopeModel.updateD_BY = localStorage.getItem('empid') || '';
    scopeModel.updateD_DATE = new Date();

    var projectScope = new projectScopes();
    projectScope.PROJECT_SCOPE = scopeModel;
    projectScope.PROJECT_INSCOPE_DETAILS = this.dataSource.data;

    this._appservice.updateScope(projectScope).subscribe({
      next: (data) => {
        this.showToast("Project scope saved successfully", 'success');
        this.ResetScope();
      },
      error: (error) => {
        this._util.serviceError(error);
        this.showToast("Failed to save project scope", 'error');
      }
    });
  }

  onSelectionChange(selectedValue: any) {
    this.selectedServiceAreaToAdd = selectedValue;
  }

  // Toast notification helper method
  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const panelClass = type === 'success' ? ['toast-success'] :
                      type === 'error' ? ['toast-error'] :
                      type === 'warning' ? ['toast-warning'] :
                      ['toast-info'];

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }
}