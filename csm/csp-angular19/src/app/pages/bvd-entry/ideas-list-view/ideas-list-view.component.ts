import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { BvdEntryService } from '../services/bvd-entry.service';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { IdeaViewModel, Idea } from '../../../models/bvd-entry/idea-model';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';
import { BvdDashboardService } from '../../bvd-dashboard/services/bvd-dashboard.service';

@Component({
  selector: 'app-ideas-list-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    NavbarNewComponent,
    TableFilterComponent
  ],
  templateUrl: './ideas-list-view.component.html',
  styleUrl: './ideas-list-view.component.scss'
})
export class IdeasListViewComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource: IdeaViewModel[] = [];
  selection = new SelectionModel<IdeaViewModel>(true, []);
  
  status: any[] = [];
  ideas: IdeaViewModel[] = [];
  filterCriteria: IdeaInputModel = new IdeaInputModel();
  forApproval: boolean = false;
  selectedStatus: string = '';

  // ── Search & pagination state ──────────────────────────────────
  searchText: string = '';
  filterOpen: boolean = false;
  currentPage: number = 0;
  pageSize: number = 5;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  // ── Project colour palette ─────────────────────────────────────
  private readonly _projColors = [
    '#4B4EB1', '#007aff', '#34c759', '#ff9500',
    '#ff3b30', '#5856d6', '#af52de', '#00bcd4'
  ];
  private readonly _projColorMap = new Map<string, string>();

  private readonly _avatarColors = [
    '#4B4EB1', '#e67e22', '#27ae60', '#8e44ad',
    '#2980b9', '#c0392b', '#16a085', '#d35400'
  ];
  private readonly _avatarColorMap = new Map<string, string>();
  
  customerid: number = 0;
  projid: number = 0;
  Ideaid: number = 0;
  reset: string = '';
  ideaAction: string = '';

  isLoading: boolean = false;     // list-load spinner
  isNavigating: boolean = false;  // view-idea navigation spinner
  
  customers: any[] = [];
  selectedCustomer: number = 0;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _bvdService: BvdEntryService,
    private _bvdDashboardService: BvdDashboardService,
    private _appsService: AppsService,
    public _util: MyUtility,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    // Set displayed columns based on user role
    if (this._util.IsCSM()) {
      this.displayedColumns = ['select', 'projecT_NAME', 'description', 'type', 'responsible', 'identifieD_DATE', 'targeT_DATE', 'status', 'actions'];
    } else {
      this.displayedColumns = ['projecT_NAME', 'description', 'type', 'responsible', 'identifieD_DATE', 'targeT_DATE', 'status', 'actions'];
    }
    
    // Read from path params instead of query params
    this.route.params.subscribe(params => {
      
      this.customerid = params['customerid'] ? +params['customerid'] : 0;
      this.reset = params['reset'] || '';
      
      
      if (this.reset === 'reset') {
        this.resetValues();
      }
      
      if (this.customerid > 0) {
        this.getAllIdeas();
      }
      
      if (this._util.IsCSM()) {
        this.getCustomerList();
      }
    });
    
    // Also check query params for additional parameters (projid, Ideaid, ideaAction)
    this.route.queryParams.subscribe(queryParams => {
      
      if (queryParams['projid']) {
        this.projid = +queryParams['projid'];
      }
      if (queryParams['Ideaid']) {
        this.Ideaid = +queryParams['Ideaid'];
      }
      if (queryParams['ideaAction']) {
        this.ideaAction = queryParams['ideaAction'];
      }
    });
  }

  resetValues(): void {
    this._bvdService.bvdidea = new Idea();
    this._bvdService.bvdbenefit = [];
    this._bvdService.bvdimplementationschdules = [];
  }

  getAllIdeas(): void {
    
    // Always use getAllIdeasByCustomer without date filtering for simplicity
    // This ensures all ideas are loaded regardless of dashboard date state
    
    this.isLoading = true;
    this._bvdService.getAllIdeasByCustomer(this.customerid).subscribe({
      next: (data: any) => {
        
        if (data && data.length > 0) {
          this.ideas = data;
          this.dataSource = [...this.ideas];
          
          // Reapply any active filters
          this.reapplyFilters();
        } else {
          this.ideas = [];
          this.dataSource = [];
        }
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading ideas by customer:', error);
        this.isLoading = false;
        this._cdr.detectChanges();
        this._util.serviceError(error);
      }
    });
  }

  getCustomerList(): void {
    
    const empId = localStorage.getItem('empid') || '';
    this._appsService.GetCustomerList(empId, false).subscribe({
      next: (data: any) => {
        
        if (data && data.length > 0) {
          this.customers = data;
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this._util.serviceError(error);
      }
    });
  }

  onCustomerChange(): void {
    
    if (this.selectedCustomer > 0) {
      this.isLoading = true;
      this._bvdService.getAllIdeasByCustomer(this.selectedCustomer).subscribe({
        next: (data: any) => {
          
          if (data && data.length > 0) {
            this.ideas = data;
            this.dataSource = [...this.ideas];
          } else {
            this.ideas = [];
            this.dataSource = [];
          }
          this.isLoading = false;
          this._cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading ideas by customer:', error);
          this.isLoading = false;
          this._cdr.detectChanges();
          this._util.serviceError(error);
        }
      });
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const eligibleRows = this.dataSource.filter(row => {
      const statusTitle = row.status?.toLowerCase();
      return statusTitle !== 'draft' && statusTitle !== 'approved' && statusTitle !== 'rejected' && statusTitle !== 'completed';
    });
    const numRows = eligibleRows.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.dataSource.forEach(row => {
      const statusTitle = row.status?.toLowerCase();
      if (statusTitle !== 'draft' && statusTitle !== 'approved' && statusTitle !== 'rejected' && statusTitle !== 'completed') {
        this.selection.select(row);
      }
    });
  }

  checkboxLabel(row?: IdeaViewModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  Filter_onChange(event: any): void {
    
    if (event && event.data) {
      this.dataSource = event.data;
    } else {
      this.dataSource = [...this.ideas];
    }
  }

  onForApprovalChange(): void {
    this.reapplyFilters();
  }

  submitBulkAction(): void {
    
    if (!this.selectedStatus) {
      alert('Please select an action (Approve/Reject)');
      return;
    }
    
    const selectedIdeas = this.selection.selected;
    
    if (selectedIdeas.length === 0) {
      alert('Please select at least one idea');
      return;
    }
    
    const ideaUpdates: ideaUpdate[] = selectedIdeas.map(idea => ({
      ideA_ID: idea.id,
      ideA_STATUS_TITLE: this.selectedStatus
    }));
    
    
    this._bvdService.updateIdeaStatus(ideaUpdates).subscribe({
      next: (response) => {
        this._util.showSuccess('Ideas updated successfully');
        this.selection.clear();
        this.selectedStatus = '';
        this.getAllIdeas();
      },
      error: (error) => {
        console.error('Error updating ideas:', error);
        this._util.serviceError(error);
      }
    });
  }

  addNewIdea(): void {
    this.resetValues();
    
    // Store navigation source - coming from Ideas List View
    window.localStorage.setItem('isFromAddNewIdea', 'true');
    window.localStorage.setItem('ideaNavigationSource', 'listview');
    
    if (this._util.IsPremier(this.customerid.toString())) {
      this.router.navigate(['/serviceleveldashboard/cust', this.customerid, this.reset || '0', 'listview', 'entry']);
    } else {
      this.router.navigate(['/newdashboard/cust', this.customerid, this.reset || '0', 'listview', 'entry']);
    }
  }

  getIdeasDetailsById(ideaId: number): void {
    
    this.isNavigating = true;
    this._bvdService.getIdeaDetailsById(ideaId).subscribe({
      next: (data: any) => {
        
        if (data) {
          // Pre-load idea data into service so bvd-entry child components can read it
          this._bvdService.bvdidea = data;
          this._bvdService.ideA_ID = ideaId;
          if (data.projecT_ID) this._bvdService.projecT_ID = data.projecT_ID;
          if (data.cusT_ID) this._bvdService.customerid = this.customerid;
          
          if (this._util.IsPremier(this.customerid.toString())) {
            this.router.navigate(['/serviceleveldashboard/bvdentry'], {
              queryParams: {
                customerid: this.customerid,
                projid: this.projid,
                Ideaid: ideaId,
                isvieworapproveorreject: 'view'
              }
            });
          } else {
            this.router.navigate(['/newdashboard/bvdentry'], {
              queryParams: {
                customerid: this.customerid,
                projid: this.projid,
                Ideaid: ideaId,
                isvieworapproveorreject: 'view'
              }
            });
          }
        } else {
          this.isNavigating = false;
        }
      },
      error: (error) => {
        console.error('Error loading idea details:', error);
        this.isNavigating = false;
        this._util.serviceError(error);
      }
    });
  }

  deleteIdeaById(ideaId: number, status: string): void {
    
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'submitted' || statusLower === 'approved' || statusLower === 'implemented') {
      alert('Cannot delete idea with status: ' + status);
      return;
    }
    
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to delete this idea?',
      'Delete Idea'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this._bvdService.DeleteIdeaById(ideaId).subscribe({
          next: (response) => {
            this._util.showSuccess('Idea deleted successfully');
            this.getAllIdeas();
          },
          error: (error) => {
            console.error('Error deleting idea:', error);
            this._util.serviceError(error);
          }
        });
      }
    });
  }

  resetValuesAndGoBack(): void {
    
    this.resetValues();
    
    // Use browser back if we came from BVD Dashboard
    // Otherwise navigate to the appropriate dashboard
    const navigationHistory = window.history.state;
    
    if (navigationHistory && navigationHistory.navigationId > 1) {
      // Use browser back to go to previous page
      window.history.back();
    } else {
      // Navigate to the appropriate dashboard with customer context
      if (this.customerid) {
        if (this._util.IsPremier(this.customerid.toString())) {
          this.router.navigate(['/serviceleveldashboard/cust', this.customerid, this.reset || '0']);
        } else {
          this.router.navigate(['/newdashboard/cust', this.customerid, this.reset || '0']);
        }
      } else {
        // No customer ID, go to main dashboard
        if (this._util.IsPremier('')) {
          this.router.navigate(['/serviceleveldashboard']);
        } else {
          this.router.navigate(['/newdashboard']);
        }
      }
    }
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const statusLower = status.toLowerCase().replace(/\s+/g, '-');
    return statusLower.charAt(0).toUpperCase() + statusLower.slice(1);
  }

  // ── KPI counts ────────────────────────────────────────────────
  getPendingCount(): number {
    return this.ideas.filter(i => i.status?.toLowerCase() === 'submitted').length;
  }
  getApprovedCount(): number {
    return this.ideas.filter(i => i.status?.toLowerCase() === 'approved').length;
  }
  getUnderReviewCount(): number {
    return this.ideas.filter(i =>
      i.status?.toLowerCase() === 'under review' || i.status?.toLowerCase() === 'planned'
    ).length;
  }

  // ── Search ────────────────────────────────────────────────────
  applySearch(): void {
    this.reapplyFilters();
    this.currentPage = 0;
  }

  clearSearch(): void {
    this.searchText = '';
    this.forApproval = false;
    this.dataSource = [...this.ideas];
    this.currentPage = 0;
  }

  reapplyFilters(): void {
    
    // Start with all ideas
    let filtered = [...this.ideas];
    
    // Apply search filter if active
    if (this.searchText && this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(i =>
        (i.description || '').toLowerCase().includes(q) ||
        (i.projecT_NAME || '').toLowerCase().includes(q) ||
        (i.type || '').toLowerCase().includes(q) ||
        (i.identified_By || '').toLowerCase().includes(q) ||
        (i.responsible || '').toLowerCase().includes(q)
      );
    }
    
    // Apply forApproval filter if active
    if (this.forApproval) {
      filtered = filtered.filter(idea => 
        idea.status?.toLowerCase() === 'submitted'
      );
    }
    
    this.dataSource = filtered;
  }

  toggleFilter(): void {
    this.filterOpen = !this.filterOpen;
  }

  // ── Pagination helpers ────────────────────────────────────────
  get pageStart(): number { return this.currentPage * this.pageSize + 1; }
  get pageEnd(): number { return Math.min((this.currentPage + 1) * this.pageSize, this.dataSource.length); }

  pagedData(): IdeaViewModel[] {
    const start = this.currentPage * this.pageSize;
    return this.dataSource.slice(start, start + this.pageSize);
  }
  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.pageEnd < this.dataSource.length) this.currentPage++; }
  onPageSizeChange(): void { this.currentPage = 0; }

  // ── Row helpers ───────────────────────────────────────────────
  isRowCheckboxDisabled(row: IdeaViewModel): boolean {
    const s = row.status?.toLowerCase();
    return s === 'draft' || s === 'approved' || s === 'rejected' || s === 'completed';
  }

  getStatusKey(status: string): string {
    if (!status) return 'draft';
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getTypeBadgeClass(type: string): string {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t === 'improvement') return 'ilv-badge--improvement';
    if (t === 'idea')        return 'ilv-badge--idea';
    if (t === 'risk')        return 'ilv-badge--risk';
    return 'ilv-badge--default';
  }

  // ── Project colour ────────────────────────────────────────────
  getProjectColor(name: string): string {
    if (!name) return this._projColors[0];
    if (!this._projColorMap.has(name)) {
      const idx = this._projColorMap.size % this._projColors.length;
      this._projColorMap.set(name, this._projColors[idx]);
    }
    return this._projColorMap.get(name)!;
  }

  // ── Avatar helpers ────────────────────────────────────────────
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return this._avatarColors[0];
    if (!this._avatarColorMap.has(name)) {
      const idx = this._avatarColorMap.size % this._avatarColors.length;
      this._avatarColorMap.set(name, this._avatarColors[idx]);
    }
    return this._avatarColorMap.get(name)!;
  }
}

export class ideaUpdate {
  ideA_ID: number = 0;
  ideA_STATUS_TITLE: string = '';
}

export class IdeaInputModel {
  customeR_ID: string = '';
  StarT_DATE: Date | null = null;
  enD_DATE: Date | null = null;
}
