/**
 * AppreciationComponent - Customer appreciation management
 * Migrated from LEGACY Angular 8 to Angular 19 standalone
 * 
 * Features:
 * - View, add, edit, and delete appreciation records
 * - Portfolio and project filtering
 * - Export to Excel functionality
 * - Mat Table with sorting and pagination
 * - Role-based access control
 * - Entity info popup dialog
 */

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

// Services and Models
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AppreciationModelExt } from '../../core/models/appreciation-model';
import { ProjectsModel } from '../../models/projects-model';
import { enumRoles } from '../../shared/enum';
import { EmpInfoModel } from '../../models/emp-info-model';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { PortfolioProjectSelectorComponent } from '../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { WarningPopupComponent } from '../../shared/components/warning-popup/warning-popup.component';
import { EntityBaseInfoComponent } from '../../pages/layout/entity-base-info/entity-base-info.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'app-appreciation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PortfolioProjectSelectorComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './appreciation.component.html',
  styleUrl: './appreciation.component.scss'
})
export class AppreciationComponent implements OnInit {
  // Dependency Injection
  private route = inject(ActivatedRoute);
  private _appservice = inject(AppsService);
  public _shared = inject(SharedService);
  public _util = inject(MyUtility);
  private changeDetectorRefs = inject(ChangeDetectorRef);
  public _access = inject(AccessControl);
  public dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  // ViewChild references
  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  // Component Properties
  result: any[] = [];
  tempData: any[] = [];
  selectedCust: string = '';
  selectedProject: string = 'All Projects';
  selectedPortfolio: string = 'All Portfolios';
  editmode: boolean = false;
  readonlymode: boolean = true;
  projects: string[] = [];
  projNames: ProjectsModel[] = [];
  editItem: AppreciationModelExt = new AppreciationModelExt();
  dataSource = new MatTableDataSource<any>(this.result);
  displayedColumns = ['index', 'portfoliO_NAME', 'proJ_NM', 'appreciateD_BY', 'designation', 'comments', 'recipienT_NM', 'receiveD_DATE', 'info', 'edit', 'delete'];
  allcust: boolean = false;
  allproj: boolean = false;
  ownerList: EmpInfoModel[] = [];
  bShowFilter: boolean = true;

  ngOnInit() {
    const role = localStorage.getItem('role');
    
    // Check if we should show all projects
    // If coming from dashboard (filters cleared) or user has admin role, show all
    if (role === enumRoles.BUHeadIMS.toString() || 
        role === enumRoles.PMO.toString() || 
        role === enumRoles.Quality.toString() ||
        (this._shared.savedportfolioId === 0 && this._shared.selectedProjects.length === 0)) {
      this.allproj = true;
    }

    this.route.params.subscribe((params: any) => {
      this.selectedCust = params['custid'];
      if (params['projid'] !== undefined) {
        this._shared.selectedProjects.push(params['projid']);
        // If coming with a specific project, don't show all projects
        this.allproj = false;
      }
    });

    if (!this._util.IsPremier(this.selectedCust)) {
      this.displayedColumns = ['index', 'proJ_NM', 'appreciateD_BY', 'designation', 'comments', 'recipienT_NM', 'receiveD_DATE', 'info', 'edit', 'delete'];
    }

    this.getAppreciationDetails();
    this.getAllProjectsFromCustomer();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Get appreciation details for the customer
   */
  getAppreciationDetails() {
    this._appservice.getAppreciationDetails(this.selectedCust, this.allproj).subscribe({
      next: (data: any) => {
        this.result = data;
        this.tempData = data;
      },
      error: (error: any) => {
        console.error('Error fetching appreciation details:', error);
        this._util.serviceError(error);
      },
      complete: () => {
        if (this._util.IsPremier(this.selectedCust)) {
          if (this._shared.savedportfolioId !== 0) {
            this.tempData = this.tempData.filter(x => x.portfoliO_ID === this._shared.savedportfolioId);
          }

          if (this._shared.savedportfolioId !== 0 && this.tempData.length > 0) {
            this.selectedPortfolio = this.tempData[0].portfoliO_NAME;
          } else {
            this.selectedPortfolio = 'All Portfolios';
          }
        }
        this.RefreshTableForProject(this.tempData);
      }
    });
  }

  /**
   * Get all projects for the customer
   */
  getAllProjectsFromCustomer() {
    const role = localStorage.getItem('role');

    if (role === enumRoles.BUHeadIMS.toString() || 
        role === enumRoles.PMO.toString() || 
        role === enumRoles.Quality.toString()) {
      this.allcust = true;
    } else {
      this.allcust = false;
    }

    this._appservice.GetCustomerProjectsName(this.selectedCust, this.allcust).subscribe({
      next: (data: any) => {
        this.projNames = data;
      },
      error: (error: any) => {
        console.error('Error fetching customer projects:', error);
        this._util.serviceError(error);
      }
    });
  }

  /**
   * Refresh table with filtered data
   */
  RefreshTableForProject(data: any[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Export table data to Excel
   */
  ExportTOExcel() {
    if (!this.result || this.result.length === 0) {
      return;
    }
    const isPremier = this._util.IsPremier(this.selectedCust);
    const rows = this.dataSource.filteredData.map((item: any, i: number) => {
      const row: any = { 'S.No': i + 1 };
      if (isPremier) row['Portfolio Name'] = item.portfoliO_NAME || '';
      row['Project']        = item.proJ_NM       || '';
      row['Appreciated By'] = item.appreciateD_BY || '';
      row['Designation']    = item.designation    || '';
      row['Comments']       = item.comments       || '';
      row['Recipient']      = item.recipienT_NM   || '';
      row['Received Date']  = item.receiveD_DATE
        ? new Date(item.receiveD_DATE).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';
      return row;
    });
    this._util.exportJsonToExcel(rows, 'Appreciation Details');
  }

  /**
   * Enable add mode (blank form)
   */
  AddNew_onClick() {
    this.editItem = new AppreciationModelExt();
    this.Edit_onClick();
  }

  /**
   * Enable edit mode
   */
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable();
    this.getRecipientList();
  }

  /**
   * Refresh the table
   */
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Get other details (portfolio name and recipient list)
   */
  getotherDetails() {
    this.getPortfolioName();
    this.getRecipientList();
  }

  /**
   * Get portfolio name for selected project
   */
  getPortfolioName() {
    if (this.editItem.proJ_ID) {
      this._appservice.getPortfolioName(this.editItem.proJ_ID).subscribe({
        next: (data: any) => {
          this.editItem.portfoliO_NAME = data;
        },
        error: (error: any) => {
          console.error('Error fetching portfolio name:', error);
        }
      });
    }
  }

  /**
   * Get recipient list (auditee details)
   */
  getRecipientList() {
    // Validate that we have a valid project ID before making API call
    if (!this.editItem.proJ_ID || this.editItem.proJ_ID === undefined || this.editItem.proJ_ID === null || this.editItem.proJ_ID === '') {
      this.ownerList = [];
      return;
    }
    
    // Convert projectId to string for API call and ensure it's valid
    const projectId = String(this.editItem.proJ_ID).trim();
    
    // Double check the projectId is not empty after conversion
    if (!projectId) {
      console.warn('Invalid project ID after conversion');
      this.ownerList = [];
      return;
    }
    
    this._appservice.getAuditeeDetails(this.selectedCust, projectId, true).subscribe({
      next: (data: any) => {
        this.ownerList = data || [];
      },
      error: (error: any) => {
        console.error('Error fetching auditee details:', error);
        this.ownerList = [];
        // Don't show error to user if it's just because no project is selected yet
        if (this.editItem.proJ_ID) {
          this._util.serviceError(error);
        }
      }
    });
  }

  /**
   * Get project names for a portfolio
   */
  getprojectsNameForAPortfolio(portid: number) {
    this.projects = this.result
      .filter(x => x.portfoliO_ID === portid)
      .map(x => x.proJ_NM)
      .filter((x, i, a) => a.indexOf(x) === i)
      .sort();
    this.projects.unshift('All Projects');
  }

  /**
   * Submit form (add or update appreciation)
   */
  SubmitForm(isValid: boolean | null) {
    if (!isValid) {
      this.showToast('Please enter valid values for required fields', 'warn');
      return;
    }

    if (this.editItem.id === 0 || this.editItem.id === undefined) {
      // Add new appreciation
      this.editItem.cusT_ID = this.selectedCust;
      const project = this.projNames.find(x => x.proJ_ID === this.editItem.proJ_ID);
      if (project) {
        this.editItem.proJ_NM = project.proJ_NM;
      }
      this.editItem.createD_BY = localStorage.getItem('empid') || '';
      this.editItem.createD_DATE = new Date();
      this.editItem.updateD_BY = localStorage.getItem('empid') || '';
      this.editItem.updateD_DATE = new Date();
      this.editItem.receiveD_DATE = this._util.setLocaleDate(this.editItem.receiveD_DATE);
      this.updateAppreciation(this.editItem);
    } else {
      // Update existing appreciation
      this.editItem.receiveD_DATE = this._util.setLocaleDate(this.editItem.receiveD_DATE);
      this.editItem.updateD_BY = localStorage.getItem('empid') || '';
      this.editItem.updateD_DATE = new Date();
      this.updateAppreciation(this.editItem);
    }

    this.neweditItem();
    this.changeDetectorRefs.detectChanges();
  }

  /**
   * Get project name from project ID
   */
  getProjectName() {
    const projectName = this.projNames.find(x => x.proJ_ID === this.editItem.proJ_ID);
    if (projectName !== undefined && projectName !== null) {
      this.editItem.proJ_NM = projectName.proJ_NM;
    }
  }

  /**
   * Update appreciation record
   */
  updateAppreciation(item: AppreciationModelExt) {
    this._appservice.updateAppreciation(item).subscribe({
      next: (data: any) => {
        this.showToast('Saved successfully', 'success');
        this.readonlymode = true;
        this.editmode = false;
        this.getAppreciationDetails();
      },
      error: (error: any) => {
        console.error('Error updating appreciation:', error);
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error');
      }
    });
  }

  /**
   * Create new empty edit item
   */
  neweditItem() {
    this.editItem = new AppreciationModelExt();
  }

  /**
   * Edit row - populate form
   */
  EditRow_onClick(element: AppreciationModelExt) {
    this.editItem = Object.assign({}, element);
    this.Edit_onClick();
  }

  /**
   * Delete appreciation record
   */
  DeleteRow_onClick(element: AppreciationModelExt): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this appreciation record?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Appreciation',
      icon: 'delete_forever'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.deleteAppreciation(element).subscribe({
          next: (data: any) => {
            this.showToast('Deleted successfully', 'warn');
            this.getAppreciationDetails();
          },
          error: (error: any) => {
            console.error('Error deleting appreciation:', error);
            this._util.serviceError(error);
            this.showToast('Something went wrong', 'error');
          }
        });
      }
    });
  }

  /**
   * Cancel edit mode
   */
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.neweditItem();
    this.getAppreciationDetails();
  }

  /**
   * Allow only alphanumeric and certain special characters
   */
  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode === 40 || charCode === 41 || charCode === 44 || charCode === 46 || 
        charCode === 20 || charCode === 188 || charCode === 32 || charCode === 8 || 
        (charCode >= 44 && charCode <= 57) || 
        (charCode >= 97 && charCode <= 122) || 
        (charCode >= 65 && charCode <= 90) || 
        charCode === 32) {
      return true;
    }
    return false;
  }

  /**
   * Open entity info popup dialog
   */
  OpenEntityInfoPopup(element: AppreciationModelExt) {
    // Set element id for entity base info component
    element.id = element.id || 0;
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      entity: element,
      entityType: 'appreciation',
      header: 'Appreciation',
      project: element.proJ_NM
    };
    dialogConfig.width = '500px';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'entity-info-dialog';

    const dialogRef = this.dialog.open(EntityBaseInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      // Handle dialog close if needed
    });
  }

  /**
   * Show warning popup message
   */
  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { Message: message };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    this.dialog.open(WarningPopupComponent, dialogConfig);
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'warn' | 'error'): void {
    const duration = type === 'error' ? 4000 : 3000;
    const panelClass = `${type}-snackbar`;
    
    this._snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass]
    });
  }

  /**
   * Handle project selection from portfolio-project-selector
   */
  projectSelected(event: any) {
    // Don't filter if data hasn't been loaded yet
    if (!this.tempData || this.tempData.length === 0) {
      return;
    }

    // Filter data based on selected projects
    let filteredData: any[] = [];
    
    if (this._shared.selectedProjects && this._shared.selectedProjects.length > 0) {
      // Filter tempData to only show records for selected projects
      filteredData = this.tempData.filter(x => 
        this._shared.selectedProjects.indexOf(x.proJ_ID) >= 0
      );
    } else {
      // No projects selected, show all data
      filteredData = this.tempData;
    }
    
    this.RefreshTableForProject(filteredData);
  }
}
