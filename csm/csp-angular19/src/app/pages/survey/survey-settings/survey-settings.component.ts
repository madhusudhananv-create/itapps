import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { CssBatchModel } from '../../../models/css-batch-model';
import { CssBatchCustomersModel, CssBatchCustomersExtendedModel } from '../../../models/css-batch-customers-model';
import { SurveyService } from '../../../core/services/survey.service';
import { CssbatchPopupComponent } from '../cssbatch-popup/cssbatch-popup.component';

export interface SurveyBatch {
  id: number;
  frequency: string;
  starT_DATE: Date;
  enD_DATE: Date;
  category: string;
  status: string;
  totaL_RECORDS: number;
  pending: number;
  verified: number;
  rejected: number;
  surveY_SENT: number;
  surveY_RECD: number;
}

export interface CustomerDetail {
  id: number;
  businessUnit: string;
  customer: string;
  projectPortfolio: string;
  projectStatus: string;
  name: string;
  emailId: string;
  role: string;
  engagementType: string;
  status: string;
  selected?: boolean;
}

@Component({
  selector: 'app-survey-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule,
    MatDividerModule,
    MatRadioModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  templateUrl: './survey-settings.component.html',
  styleUrls: ['./survey-settings.component.scss']
})
export class SurveySettingsComponent implements OnInit, AfterViewInit {
  // Signals for reactive state management
  loading = signal(false);
  selectedBatchId = signal<number | null>(null);
  batchDetailsMode = signal(false);
  
  // Data
  batches: SurveyBatch[] = [];
  customerDetails: CustomerDetail[] = [];
  selectedBatch = signal<SurveyBatch | null>(null);
  CSMList: CSMList[] = []; // CSM list for displaying CSM names
  
  // Selection model for customer table
  selection = new SelectionModel<CustomerDetail>(true, []);
  
  // Table configurations
  batchColumns = [
    'index',
    'frequency',
    'starT_DATE',
    'enD_DATE',
    'category',
    'status',
    'totaL_RECORDS',
    'pending',
    'verified',
    'rejected',
    'surveY_SENT',
    'surveY_RECD'
  ];
  
  customerColumns = [
    'select',
    'index',
    'businessUnit',
    'customer',
    'projectPortfolio',
    'projectStatus',
    'name',
    'emailId',
    'role',
    'engagementType',
    'status',
    'sentdate',
    'recddate',
    'CSMList',
    'spoc',
    'unit',
    'verified',
    'comments',
    'updatedBy',
    'updatedDate',
    'edit'
  ];
  
  batchDataSource = new MatTableDataSource(this.batches);
  customerDataSource = new MatTableDataSource(this.customerDetails);
  
  // Cache for customer data to prevent slow reloading
  private customerDataCache = new Map<number, any[]>();
  
  @ViewChild('batchPaginator') batchPaginator!: MatPaginator;
  @ViewChild('customerPaginator') customerPaginator!: MatPaginator;
  @ViewChild('batchSort') batchSort!: MatSort;
  @ViewChild('customerSort') customerSort!: MatSort;
  @ViewChild('tableToExport', { read: ElementRef }) table!: ElementRef;
  
  constructor(
    private dialog: MatDialog,
    public _util: MyUtility,
    private surveyService: SurveyService,
    public _access: AccessControl,
    private _router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.loadBatches();
    this.service_GetCSMList();
  }
  
  ngAfterViewInit(): void {
    this.batchDataSource.paginator = this.batchPaginator;
    this.batchDataSource.sort = this.batchSort;
    this.customerDataSource.paginator = this.customerPaginator;
    this.customerDataSource.sort = this.customerSort;
    
    // Initialize custom filter predicate for customer table
    this.customerDataSource.filterPredicate = this.createFilter();
  }
  
  /**
   * Load survey batches
   */
  loadBatches(): void {
    this.loading.set(true);
    
    this.surveyService.GetCSSBatches('').subscribe({
      next: (data) => {
        this.batches = data as any[];
        this.batchDataSource.data = this.batches;
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Handle batch row click
   */
  onBatchRowClick(batch: SurveyBatch, index: number): void {
    // Only load customer details if a different batch is selected
    if (this.selectedBatchId() !== batch.id) {
      this.selectedBatchId.set(batch.id);
      this.selectedBatch.set(batch);
      this.loadCustomerDetails(batch.id);
    }
  }
  
  /**
   * Load customer details for selected batch
   */
  loadCustomerDetails(batchId: number): void {
    // Check cache first for instant loading
    if (this.customerDataCache.has(batchId)) {
      const cachedData = this.customerDataCache.get(batchId)!;
      this.customerDetails = cachedData;
      this.customerDataSource.data = this.customerDetails;
      return; // Instant load from cache - no loading indicator needed
    }
    
    // Load from API if not cached
    this.loading.set(true);
    
    this.surveyService.GetCSSBatchCustomers(batchId).subscribe({
      next: (data) => {
        this.customerDetails = data as any[];
        this.customerDataSource.data = this.customerDetails;
        // Cache the data for future quick access
        this.customerDataCache.set(batchId, this.customerDetails);
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Check if batch row is selected
   */
  isBatchSelected(batchId: number): boolean {
    return this.selectedBatchId() === batchId;
  }
  
  /**
   * Handle numeric cell click (for drill-down)
   */
  onNumericCellClick(value: number, columnType: string): void {
    // Implement drill-down or filter logic here
  }
  
  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    status = status?.toUpperCase() || '';
    
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'SURVEY SENT':
      case 'SURVEY_SENT':
        return 'status-survey-sent';
      case 'NEW':
        return 'status-new';
      case 'ACTIVE':
        return 'status-active';
      case 'CREATED':
        return 'status-created';
      default:
        return 'status-default';
    }
  }
  
  /**
   * Master toggle for customer selection
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.customerDataSource.data.length;
    return numSelected === numRows;
  }
  
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.customerDataSource.data.forEach(row => this.selection.select(row));
    }
  }
  
  /** 'contains' (default, substring/"like" match) or 'exact' (whole-value match) */
  filterMode: 'contains' | 'exact' = 'contains';
  lastFilterValue: string = '';

  /**
   * Apply filter to customer table
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.lastFilterValue = filterValue;
    this.runFilter(filterValue);
  }

  /**
   * Re-run the current filter text against the (possibly just-changed) filter mode
   */
  onFilterModeChange(mode: 'contains' | 'exact'): void {
    this.filterMode = mode;
    this.runFilter(this.lastFilterValue);
  }

  private runFilter(filterValue: string): void {
    this.customerDataSource.filter = filterValue.trim().toLowerCase();

    // Handle filtering for CSM column separately
    if (filterValue) {
      this.customerDataSource.filterPredicate = (data: any, filter: string) =>
        this.createFilter()(data, filter) || this.matchesField(this.GetCSM(data.proJ_ID || ''), filter);
    } else {
      this.customerDataSource.filterPredicate = this.createFilter();
    }
  }

  /**
   * Compares a single field's value against a single search term, honoring filterMode.
   */
  private matchesField(value: string | null | undefined, term: string): boolean {
    if (!value) return false;
    const normalized = value.toLowerCase();
    return this.filterMode === 'exact' ? normalized === term : normalized.includes(term);
  }

  /**
   * Create custom filter predicate for all columns
   */
  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      // Exact mode compares the whole phrase against each field's whole value
      // (splitting into words would make a multi-word exact search impossible,
      // since no field could ever equal just one word of the phrase).
      const searchTerms = this.filterMode === 'exact' ? [filter.toLowerCase()] : filter.toLowerCase().split(' ');

      return searchTerms.every(term => {
        return (
          this.matchesField(data.businesS_UNIT, term) ||
          this.matchesField(data.engagemenT_TYPE, term) ||
          this.matchesField(data.cusT_NM, term) ||
          this.matchesField(data.proJ_NM, term) ||
          this.matchesField(data.proJ_STATUS, term) ||
          this.matchesField(data.displaY_NAME, term) ||
          this.matchesField(data.emaiL_ID, term) ||
          this.matchesField(data.contacT_ROLE, term) ||
          this.matchesField(this.GetCSM(data.proJ_ID), term) ||
          this.matchesField(data.spoc, term) ||
          this.matchesField(data.contractinG_UNIT, term) ||
          this.matchesField(data.status, term) ||
          this.matchesField(data.comments, term) ||
          this.matchesField(data.updateD_BY, term) ||
          this.matchesField((!data.iS_VERIFIED && data.comments != null && data.comments.trim() != "" ? "Rejected" : "Not Verified"), term) ||
          this.matchesField((data.iS_VERIFIED ? "Approved" : "Not Verified"), term)
        );
      });
    };

    return filterFunction;
  }
  
  /**
   * Action: Add Batch
   */
  onAddBatch(): void {
    const dialogRef = this.dialog.open(CssbatchPopupComponent, {
      width: '600px',
      data: { mode: 'add' }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBatches();
      }
    });
  }
  
  /**
   * Action: Generate Missing Contacts
   */
  onGenerateMissingContacts(): void {
    if (!this.selectedBatch()) {
      this._util.showWarningPopup('Please select a batch first');
      return;
    }
    
    this.loading.set(true);
    
    this.surveyService.GenerateMissingCustomerContacts(this.selectedBatch()!.id).subscribe({
      next: (response: any) => {
        this._util.showSuccessPopup('Missing contacts generated successfully');
        this.loadCustomerDetails(this.selectedBatch()!.id);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Action: Re-Generate
   */
  onReGenerate(): void {
    if (!this.selectedBatch()) {
      this._util.showWarningPopup('Please select a batch first');
      return;
    }
    
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to regenerate this batch?',
      'Regenerate Batch'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.loading.set(true);
        
        this.surveyService.RefreshCSSBatchCustomers(this.selectedBatch()!.id).subscribe({
        next: () => {
          this._util.showSuccessPopup('Batch regenerated successfully');
          this.loadBatches();
          this.loadCustomerDetails(this.selectedBatch()!.id);
        },
        error: (error: any) => {
          this._util.serviceError(error);
          this.loading.set(false);
        }
      });
      }
    });
  }
  
  /**
   * Action: Refresh Batch Details
   */
  btnRefresh_onclick(): void {
    if (this.selectedBatch()) {
      this.loading.set(true);
      this.loadBatches();
      this.loadCustomerDetails(this.selectedBatch()!.id);
    }
  }
  
  /**
   * Action: Send Verification Mail to CSM
   */
  onSendVerificationMail(): void {
    const selectedCustomers = this.selection.selected;
    
    if (selectedCustomers.length === 0 || !this.selectedBatch()) {
      this._util.showWarningPopup('Please select at least one customer');
      return;
    }
    
    this.loading.set(true);
    const selectedIds = selectedCustomers.map(c => c.id).join(',');
    
    this.surveyService.SendCSSBatchVerification(this.selectedBatch()!, selectedIds).subscribe({
      next: () => {
        this._util.showSuccessPopup('Verification emails sent successfully');
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Action: Send Survey Request Mails to Customer
   */
  onSendSurveyRequest(): void {
    const selectedCustomers = this.selection.selected;
    
    if (selectedCustomers.length === 0 || !this.selectedBatch()) {
      this._util.showWarningPopup('Please select at least one customer');
      return;
    }
    
    this.loading.set(true);
    const selectedIds = selectedCustomers.map(c => c.id).join(',');
    
    this.surveyService.SendCSSBatchSurveyMails(this.selectedBatch()!, selectedIds).subscribe({
      next: () => {
        this._util.showSuccessPopup('Survey request emails sent successfully');
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Action: Send Reminder Mails to Customer
   */
  onSendReminderMails(): void {
    const selectedCustomers = this.selection.selected;
    
    if (selectedCustomers.length === 0 || !this.selectedBatch()) {
      this._util.showWarningPopup('Please select at least one customer');
      return;
    }
    
    this.loading.set(true);
    const selectedIds = selectedCustomers.map(c => c.id).join(',');
    
    this.surveyService.SendCSSBatchReminderMails(this.selectedBatch()!, selectedIds).subscribe({
      next: () => {
        this._util.showSuccessPopup('Reminder emails sent successfully');
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Action: Create Action Item for Not Responded CSAT
   */
  onCreateActionItem(): void {
    if (!this.selectedBatch()) {
      this._util.showWarningPopup('Please select a batch first');
      return;
    }
    
    this.loading.set(true);
    const selectedIds = this.selection.selected.map(c => c.id).join(',');
    
    this.surveyService.CreateActionItemForCSAT(this.selectedBatch()!.id, selectedIds, 'NonPremierCSAT').subscribe({
      next: () => {
        this._util.showSuccessPopup('Action items created successfully');
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Action: Activate CSS Link
   */
  onActivateCSSLink(): void {
    const selectedCustomers = this.selection.selected;
    
    if (selectedCustomers.length === 0 || !this.selectedBatch()) {
      this._util.showWarningPopup('Please select at least one customer');
      return;
    }
    
    this.loading.set(true);
    const selectedIds = selectedCustomers.map(c => c.id).join(',');
    
    this.surveyService.UpdateCssLinkValidity(this.selectedBatch()!.id, selectedIds, 'batch').subscribe({
      next: () => {
        this._util.showSuccessPopup('CSS links activated successfully');
        this.loading.set(false);
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.loading.set(false);
      }
    });
  }
  
  /**
   * Get CSM name for a project
   */
  GetCSM(projId: string): string {
    const lst: CSMList[] = this.CSMList.filter((t) => t.proJ_ID === projId);
    if (lst.length > 0) {
      return lst[0].csm || '-';
    } else {
      return "-";
    }
  }
  
  /**
   * Get verification status text
   */
  getStatusText(element: any): string {
    let status = "";
    if (element == undefined || element == null) return status;

    if (element.iS_VERIFIED)
      status = "Approved";
    else if (element.iS_VERIFIED == false && element.comments != null && element.comments.trim() != "")
      status = "Rejected";
    else if (element.iS_VERIFIED == false && (element.comments == null || element.comments.trim()))
      status = "Not Verified";

    return status;
  }
  
  /**
   * Copy CSAT link to clipboard
   */
  CopyToClipboard(element: any): void {
    this.copyitem(element.url);
    this._util.showInfo('CSAT link copied to Clipboard.');
  }

  /**
   * Copy item to clipboard
   */
  copyitem(item: any): void {
    // Modern Clipboard API (replaces deprecated execCommand)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(item).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = item;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
  
  /**
   * Load CSM list
   */
  service_GetCSMList(): void {
    this.surveyService.GetCSMList().subscribe({
      next: (data: any) => {
        this.CSMList = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }
  
  /**
   * Export customer data to Excel
   */
  exportToExcel(): void {
    this.loading.set(true);
    
    if (this.customerDetails.length > 0) {
      const getDate = new Date();
      const fileName = `CSS_Batch_Customers_${getDate.toLocaleString()}`;
      this._util.exportToExcel(this.table.nativeElement, fileName);
      this.loading.set(false);
    } else {
      this._util.showWarningPopup('No records to export!', 'No Data');
      this.loading.set(false);
    }
  }
}

/**
 * CSM List interface
 */
export class CSMList {
  proJ_ID?: string;
  csM_ID?: number;
  csm?: string;
}
