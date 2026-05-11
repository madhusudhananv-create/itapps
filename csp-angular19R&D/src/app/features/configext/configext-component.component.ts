import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

/**
 * Configuration EXT Component
 * Manages external configuration key-value pairs with customer/project scope
 * 
 * Features:
 * - View all configuration entries
 * - Add/Edit/Delete configuration entries
 * - Filter by customer and project
 * - Encryption support
 * - Date range support (Start Date / End Date)
 * - Table filtering and pagination
 */
@Component({
  selector: 'app-configext-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    NavbarNewComponent,
    TableFilterComponent,
    ConfirmationDialogComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './configext-component.component.html',
  styleUrls: ['./configext-component.component.scss']
})
export class ConfigextComponentComponent implements OnInit {
  result: any = [];
  filteredResult: any = [];
  editItem: any;
  editmode: boolean = false;
  readonlymode: boolean = true;
  selectedCustomer: any;
  selectedProject: any;
  disableConfig: boolean = false;
  isAddMode: boolean = false;
  Customer = [];
  customers: any = [];
  Project: any = [];
  custId: any;
  allproj: any;
  filterCriteria: any;
  filteredData: any[] = [];

  // Filter properties
  filterKey: string = '';
  filterValue: string = '';
  filterCustomer: string = '';

  dataSource = new MatTableDataSource();
  @ViewChild('TABLE') table!: ElementRef;
  displayedColumns = [
    'sno',
    'key',
    'value',
    'Description',
    'customeR_NAME',
    'projecT_NAME',
    'comments',
    'start_DATE',
    'end_DATE',
    'edit',
    'delete',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(
    private route: ActivatedRoute,
    private _appservice: AppsService,
    private _shared: SharedService,
    public _util: MyUtility,
    private changeDetectorRefs: ChangeDetectorRef,
    public _access: AccessControl,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getConfigextDetails();
  }

  getConfigextDetails() {
    this._appservice.getConfigextDetails().subscribe({
      next: (data: any) => {
        this.result = data;
        this.filteredResult = data;
        this.RefreshTable(this.filteredResult);
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.getConfigextDetails();
  }

  RefreshTable(data: any) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  Edit_onClick(flag: any = 0) {
    if (flag == 1) {
      this.disableConfig = true;
      this.isAddMode = false;
      this.custId = this.selectedCustomer;
      this.LoadProject();
    }
    else {
      this.editItem = {
        key: '',
        value: '',
        description: '',
        comments: '',
        isencrypt: false
      };
      this.disableConfig = false;
      this.isAddMode = true;
      this.selectedProject = null;
    }
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable(this.result);
    this.LoadCustomer();
  }

  EditRow_onClick(element: any) {
    this.editItem = Object.assign({}, element);
    this.selectedCustomer = this.editItem.cusT_ID;
    this.selectedProject = this.editItem.proJ_ID;
    this.Edit_onClick(1);
  }

  LoadCustomer() {
    this._appservice.GetRASCustomerList().subscribe({
      next: (data: any) => {
        this.customers = data;
        this.customers.unshift({
          cusT_ID: '-1',
          cusT_NM: 'All'
        });
        this.selectedCustomer = this.editItem.cusT_ID;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  ddCustomer_Onchange() {
    this.custId = this.selectedCustomer;
    this.LoadProject();
  }

  ddProject_Onchange() { }

  LoadProject() {
    // Match legacy implementation: pass custId and allproj flag
    this._appservice
      .GetMultipleCustomersProjectNames(
        this.custId,
        this.allproj || this._util.ShouldLoadAllProjects()
      )
      .subscribe({
        next: (data: any) => {
          this.Project = data;
        },
        error: (error: any) => {
          this._util.serviceError(error);
        }
      });
  }

  SubmitForm(isValid: boolean) {
    if (!isValid) {
      this.showToast('Please enter valid values for required fields', 'warning');
      return;
    }

    let body = this.saveReqBody();
    body.id = body.id === null || body.id === undefined ? 0 : body.id;
    if (body.comments != undefined) {
      body.comments = body.comments.trim();
      body.comments = body.comments.replace(/\s+/g, ' ');
    }
    if (body.description != undefined) {
      body.description = body.description.trim();
      body.description = body.description.replace(/\s+/g, ' ');
    }
    const specialCarPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/]+$/;
    const numberPattern = /^[0-9]+$/;

    if (body.key.trim() == '') {
      this.showToast('Please enter a valid value for Key', 'warning');
      return;
    }
    if ((body.value.trim() == '')) {
      this.showToast('Please enter a valid value for Value', 'warning');
      return;
    }
    this.AddUpdateConfigext(body);
  }

  AddUpdateConfigext(item: ConfigextModel) {
    this._appservice.AddUpdateConfigext(item).subscribe({
      next: (data: any) => {
        this.showToast('Configuration saved successfully', 'success');
        this.readonlymode = true;
        this.editmode = false;
        this.getConfigextDetails();
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.showToast('Failed to save configuration. Please try again.', 'error');
      }
    });
  }

  saveReqBody() {
    let body: ConfigextModel = new ConfigextModel();
    return (body = {
      id: this.editItem.id,
      comments: this.editItem.comments ? this.editItem.comments : null,
      description: this.editItem.description,
      cusT_ID: this.selectedCustomer ? this.selectedCustomer : -1,
      enD_DATE: this.editItem.enD_DATE === null ? null : this._util.setLocaleDate(this.editItem.enD_DATE) as any,
      isactive: true,
      isencrypt: this.editItem.isencrypt,
      key: this.editItem.key,
      proJ_ID: this.selectedProject ? this.selectedProject : null,
      starT_DATE: this.editItem.starT_DATE === null || undefined ? null : this._util.setLocaleDate(this.editItem.starT_DATE) as any,
      value: this.editItem.value,
    });
  }

  DeleteRow_onClick(element: any) {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Configuration',
        message: 'Are you sure you want to delete this configuration record? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.DeleteConfiguration(element).subscribe({
          next: (data: any) => {
            this.showToast('Configuration deleted successfully', 'success');
            this.getConfigextDetails();
          },
          error: (error: any) => {
            this._util.serviceError(error);
            this.showToast('Failed to delete configuration. Please try again.', 'error');
          }
        });
      }
    });
  }

  // ─── Toast Helper ──────────────────────────────────────────────────────────
  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const panelClass =
      type === 'success' ? ['toast-success'] :
      type === 'error'   ? ['toast-error']   :
      type === 'warning' ? ['toast-warning'] :
                           ['toast-info'];

    this._snackBar.open(message, '✕', {
      duration: type === 'error' ? 5000 : 3500,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass
    });
  }

  Filter_onChange($event: any) {
    this.filteredData = $event.data;
    this.filterCriteria = $event.criteria;
    this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showAll($event: any) {
    // Handle show all event from table filter
  }

  /**
   * Apply Filter
   * Filters the configuration list based on key, value, and customer name
   */
  applyFilter() {
    this.filteredResult = this.result.filter((item: any) => {
      const keyMatch = this.filterKey ? 
        item.key?.toLowerCase().includes(this.filterKey.toLowerCase()) : true;
      const valueMatch = this.filterValue ? 
        item.value?.toLowerCase().includes(this.filterValue.toLowerCase()) : true;
      const customerMatch = this.filterCustomer ? 
        item.customeR_NAME?.toLowerCase().includes(this.filterCustomer.toLowerCase()) : true;
      
      return keyMatch && valueMatch && customerMatch;
    });

    this.RefreshTable(this.filteredResult);
  }

  /**
   * Clear Filter
   * Resets all filter fields and shows all records
   */
  clearFilter() {
    this.filterKey = '';
    this.filterValue = '';
    this.filterCustomer = '';
    this.filteredResult = this.result;
    this.RefreshTable(this.filteredResult);
  }
}

export class ConfigextModel {
  id!: number;
  comments!: string;
  description!: string;
  cusT_ID!: string;
  enD_DATE!: Date;
  isactive!: boolean;
  isencrypt!: boolean;
  key!: string;
  proJ_ID!: string;
  starT_DATE!: Date;
  value!: string;
}
