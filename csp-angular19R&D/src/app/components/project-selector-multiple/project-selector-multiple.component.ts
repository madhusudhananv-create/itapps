import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

/**
 * Project Selector Multiple Component
 * Multi-select implementation for customers and projects
 */
@Component({
  selector: 'app-project-selector-multiple',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  template: `
    <div style="display: flex; flex-direction: row; gap: 10px; width: 100%; align-items: center; overflow: visible !important;">
      <div style="flex: 1; min-width: 0; overflow: visible !important;">
        <mat-select 
          class="mat-dropdown-plain"
          placeholder="Select Customers"
          [(ngModel)]="selectedCustomers"
          (selectionChange)="onCustomerChange()"
          multiple
          #customerSelect>
          <mat-option class="search-option">
            <input 
              matInput 
              class="search-input"
              [(ngModel)]="customerSearchText"
              (ngModelChange)="filterCustomers()"
              placeholder="Search customers..."
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()">
          </mat-option>
          <mat-option (click)="toggleAllCustomers(); $event.stopPropagation()">
            <strong>{{ isAllCustomersSelected() ? 'Deselect All' : 'Select All Customers' }}</strong>
          </mat-option>
          <mat-option *ngFor="let cust of filteredCustomers" [value]="cust.cusT_ID">
            {{cust.cusT_NM}}
          </mat-option>
        </mat-select>
      </div>
      
      <div style="flex: 1; min-width: 0; overflow: visible !important;">
        <mat-select 
          class="mat-dropdown-plain"
          placeholder="Select Projects"
          [(ngModel)]="selectedProjects"
          (selectionChange)="onProjectChange()"
          multiple
          #projectSelect>
          <mat-option class="search-option">
            <input 
              matInput 
              class="search-input"
              [(ngModel)]="projectSearchText"
              (ngModelChange)="filterProjects()"
              placeholder="Search projects..."
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()">
          </mat-option>
          <mat-option (click)="toggleAllProjects(); $event.stopPropagation()">
            <strong>{{ isAllProjectsSelected() ? 'Deselect All' : 'Select All Projects' }}</strong>
          </mat-option>
          <mat-option *ngFor="let proj of filteredProjects" [value]="proj.proJ_ID">
            {{proj.proJ_NM}}
          </mat-option>
        </mat-select>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      overflow: visible !important;
    }
    
    :host::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    :host {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    // PSPD-style dropdown matching SQA Execute tab (plain mat-select)
    ::ng-deep .mat-dropdown-plain {
      width: 100% !important;
      height: 40px;
      border: 1.5px solid #D2D2D7;
      border-radius: 8px;
      background-color: #ffffff;
      padding: 0;
      font-size: 13px;
      color: #1D1D1F;
      position: relative;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: #B0B0B5;
      }

      &:focus,
      &.mat-mdc-select-focused {
        border-color: #0071E3;
        outline: none;
      }

      .mat-mdc-select-trigger {
        height: 40px;
        display: flex;
        align-items: center;
        padding: 0 40px 0 12px;
      }

      .mat-mdc-select-value {
        font-size: 13px;
        color: #1D1D1F;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mat-mdc-select-placeholder {
        font-size: 13px;
        color: #8E8E93;
        text-align: left;
      }

      .mat-mdc-select-arrow {
        color: #8E8E93;
      }

      .mat-mdc-select-arrow-wrapper {
        position: absolute;
        right: 12px;
      }
      
      .mat-mdc-select-value-text {
        font-size: 13px !important;
        color: #1D1D1F !important;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    // Search input styling
    ::ng-deep .search-option {
      pointer-events: auto !important;
      background-color: #f8f9fa !important;
      border-bottom: 1px solid #E5E5EA !important;
      
      &:hover {
        background-color: #f8f9fa !important;
      }
    }
    
    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #D2D2D7;
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      
      &:focus {
        border-color: #0071E3;
      }
    }
  `]
})
export class ProjectSelectorMultipleComponent implements OnInit {
  @Input() allcust: boolean = false;
  @Input() allproj: boolean = false;
  @Input() skipNonAuditProjects: boolean = false;
  @Output() onChange = new EventEmitter<any>();

  Customer: any[] = [];
  Project: any[] = [];
  filteredCustomers: any[] = [];
  filteredProjects: any[] = [];
  selectedCustomers: string[] = [];
  selectedProjects: string[] = [];
  isLoading: boolean = false;
  customerSearchText: string = '';
  projectSearchText: string = '';

  constructor(
    private _appservice: AppsService,
    public _util: MyUtility
  ) {}

  ngOnInit() {
    // Load customers based on permission
    if (this.allcust === true) {
      this.LoadCustomer();
    } else {
      this.LoadCustomerByEmpId();
    }
  }

  LoadCustomer() {
    this.isLoading = true;
    this._appservice.GetRASCustomerList().subscribe({
      next: (data) => {
        this.Customer = data;
        this.filteredCustomers = data;
        this.isLoading = false;
      },
      error: (error) => {
        this._util.serviceError(error);
        this.isLoading = false;
      }
    });
  }

  LoadCustomerByEmpId() {
    this.isLoading = true;
    const empId = localStorage.getItem('empid') || '';
    this._appservice.getCustomerList(empId, false).subscribe({
      next: (data) => {
        this.Customer = data;
        this.filteredCustomers = data;
        this.isLoading = false;
      },
      error: (error) => {
        this._util.serviceError(error);
        this.isLoading = false;
      }
    });
  }

  onCustomerChange() {
    // When customers change, load projects for all selected customers
    if (this.selectedCustomers.length > 0) {
      this.LoadProjects();
    } else {
      this.Project = [];
      this.selectedProjects = [];
      this.filteredProjects = [];
    }
    this.emitChanges();
  }

  LoadProjects() {
    this.isLoading = true;
    this.Project = [];
    
    // Load projects for all selected customers
    const projectPromises = this.selectedCustomers.map(custId => {
      return this._appservice.GetCustomerProjectsName(custId, this.allproj || this._util.ShouldLoadAllProjects()).toPromise();
    });

    Promise.all(projectPromises).then((results) => {
      // Combine all projects from all customers
      results.forEach(projects => {
        if (projects) {
          this.Project = [...this.Project, ...projects];
        }
      });
      
      // Remove duplicates based on proJ_ID
      this.Project = this.Project.filter((proj, index, self) =>
        index === self.findIndex((p) => p.proJ_ID === proj.proJ_ID)
      );
      
      this.filteredProjects = [...this.Project];
      this.isLoading = false;
    }).catch((error) => {
      this._util.serviceError(error);
      this.isLoading = false;
    });
  }

  onProjectChange() {
    this.emitChanges();
  }

  emitChanges() {
    this.onChange.emit({
      customer: this.selectedCustomers,
      project: this.selectedProjects
    });
  }

  filterCustomers() {
    const searchTerm = this.customerSearchText.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredCustomers = [...this.Customer];
    } else {
      this.filteredCustomers = this.Customer.filter(cust =>
        cust.cusT_NM.toLowerCase().includes(searchTerm)
      );
    }
  }

  filterProjects() {
    const searchTerm = this.projectSearchText.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredProjects = [...this.Project];
    } else {
      this.filteredProjects = this.Project.filter(proj =>
        proj.proJ_NM.toLowerCase().includes(searchTerm)
      );
    }
  }

  isAllCustomersSelected(): boolean {
    return this.Customer.length > 0 && this.selectedCustomers.length === this.Customer.length;
  }

  isAllProjectsSelected(): boolean {
    return this.Project.length > 0 && this.selectedProjects.length === this.Project.length;
  }

  toggleAllCustomers() {
    if (this.selectedCustomers.length === this.Customer.length) {
      // Deselect all
      this.selectedCustomers = [];
    } else {
      // Select all
      this.selectedCustomers = this.Customer.map(c => c.cusT_ID);
    }
    this.onCustomerChange();
  }

  toggleAllProjects() {
    if (this.selectedProjects.length === this.Project.length) {
      // Deselect all
      this.selectedProjects = [];
    } else {
      // Select all
      this.selectedProjects = this.Project.map(p => p.proJ_ID);
    }
    this.onProjectChange();
  }
}
