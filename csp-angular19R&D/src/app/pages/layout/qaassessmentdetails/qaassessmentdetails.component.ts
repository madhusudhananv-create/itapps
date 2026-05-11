import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SharedData } from '../../../shared/shared-data';
import { DateSelectionModel } from '../../../models/date-selection-model';
import { FindingByType, FindingModel, FindingDetails } from '../../../models/qaassessmentdetails-model';
import { AuditeeAcceptance } from '../../../models/auditee-acceptance';
import { FilterPreferenceModel } from '../../../models/filter-preference-model';
import { ParameterModel } from '../../../models/parameter-model';
import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';

@Component({
  selector: 'app-qaassessmentdetails',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PortfolioProjectSelectorComponent,
    TableFilterComponent
  ],
  templateUrl: './qaassessmentdetails.component.html',
  styleUrls: ['./qaassessmentdetails.component.scss']
})
export class QaassessmentdetailsComponent implements OnInit, OnDestroy {
  originalfindings: FindingByType[] = [];
  filterCriteria: any;
  findings: FindingByType[] = [];
  selectedCust: string = '';
  private sub: any;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<FindingDetails>([] as FindingDetails[]);
  showport: boolean = true;
  OpenFindings: boolean = true;
  ClosedFindings: boolean = false;
  showByFindings: string = '2';
  multiProject: boolean = true;
  allfindings: FindingDetails[] = [];
  isFromFindingByAge: boolean = false;
  findingId: number = 0;
  auditId: number = 0;
  stageStatus: string = '';
  rejectReason: string = '';
  isAuditorAccept: boolean = false;
  isAcceptOrRejectProcess: boolean = false;
  confirmAction: string = '';
  showReasonInput: boolean = false;
  reasonText: string = '';
  private pendingAcceptRejectParams: any = null;
  
  stageDict: { [key: string]: string } = {
    'AUDITEE_ACCEPTANCE AND CAP SUBMISSION': 'Auditee acceptance',
    'CAP REVIEW': 'CAP review',
    'IMPLEMENT CAP': 'Implement CAP',
    'VERIFY CAP IMPLEMENTATION': 'Verify CAP'
  };

  @ViewChildren('paginator') paginator!: QueryList<MatPaginator>;
  @ViewChild('confirmationDialog', { static: false }) confirmationDialogTemplate!: TemplateRef<any>;
  @ViewChild(MatSort) sort!: MatSort;
  
  DateSelection: DateSelectionModel;
  findingType: string = '';
  isSelectedRow: any;
  
  // Performance optimization flag
  private dataLoadInProgress: boolean = false;

  constructor(
    private _router: Router,
    private _appservice: AppsService,
    private route: ActivatedRoute,
    public _util: UtilityService,
    public _shared: SharedData,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.DateSelection = new DateSelectionModel(this._util);
  }

  ngOnInit() {
    this.showByFindings = "2";
    this.isFromFindingByAge = Boolean(localStorage.getItem("isFromFindingByAge"));
    
    // Initialize empty datasource immediately for fast UI rendering
    this.dataSource = new MatTableDataSource<FindingDetails>([]);
    this.findings = [];
    this.originalfindings = [];
    
    // DON'T clear selected projects - keep from previous navigation or selector will set it
    // this._shared.selectedProjects = [];
    
    if (this.isFromFindingByAge)
      this.displayedColumns = ["index", "portfoliO_NAME", "proJ_NM", "findinG_TYPE", "findinG_DESCRIPTION", "createD_DATE", "stagE_DESCRIPTION", "stagE_STATUS", "targeT_DATE", "responsible", 'agE_OF_FINDING', 'statuS_DATE'];
    else
      this.displayedColumns = ["index", "portfoliO_NAME", "proJ_NM", "findinG_TYPE", "findinG_DESCRIPTION", "createD_DATE", "stagE_DESCRIPTION", "stagE_STATUS", "targeT_DATE", "responsible", 'statuS_DATE'];
    
    // Use route.snapshot for immediate access to params - no async delay
    const params = this.route.snapshot.params;
    this.selectedCust = params['custid'];
    
    // Store accept/reject params to handle after view init when template is available
    if (params['findingid'] && params['asssessmentid'] && params['isauditor'] !== undefined) {
      this.pendingAcceptRejectParams = params;
    }
    
    if (params['isfromqagoverance'] == "true") {
      let filterValue: any[] = [];
      let findingsType: ParameterModel[] = [];
      this.DateSelection.selectedStartMonth = params['frommonth'];
      this.DateSelection.selectedStartYear = Number(params['fromyear']);
      this.DateSelection.selectedEndMonth = params['tomonth'];
      this.DateSelection.selectedEndYear = Number(params['toyear']);
      this.showByFindings = "1";

      if (params['projid'] != undefined) {
        this._shared.selectedProjects.push(params['projid']);
      }
      
      switch (params['findingstatus']) {
        case "O": this.OpenFindings = true; this.ClosedFindings = false; break;
        case "C": this.ClosedFindings = true; this.OpenFindings = false; break;
        case "A": this.OpenFindings = true; this.ClosedFindings = true; break;
        default: break;
      }

      switch (params['findingtype']) {
        case "S": this.findingType = "Strength"; findingsType.push(this.NewParam(1, this.findingType)); break;
        case "W": this.findingType = "Weakness"; findingsType.push(this.NewParam(2, this.findingType)); break;
        case "O": this.findingType = "Opportunity"; findingsType.push(this.NewParam(3, this.findingType)); break;
        case "T": this.findingType = "Threat"; findingsType.push(this.NewParam(4, this.findingType)); break;
        default: break;
      }
      
      let newFilterValue = new FilterPreferenceModel('PROJECT_FINDINGS', 'Finding Type', true, 'number', findingsType);
      newFilterValue.id = 68;
      newFilterValue.include = true;
      newFilterValue.isactive = true;
      newFilterValue.searchStringValue = this.findingType;
      newFilterValue.fielD_NAME = "findinG_TYPE";
      filterValue.push(newFilterValue);
      this.filterCriteria = filterValue;
    }
    
    // Subscribe to param changes for future navigation only
    this.sub = this.route.params.subscribe(params => {
      const newCustId = params['custid'];
      // Only reload if customer actually changed
      if (newCustId && newCustId !== this.selectedCust) {
        this.selectedCust = newCustId;
        this.getAllFindingsForCustomer();
      }
    });
    
    this.showdisplayedColumns();
    // Load data immediately - don't wait for async subscriptions
    this.getAllFindingsForCustomer();
  }

  handleAcceptRejectProcess(params: any) {
    if (this.isAcceptOrRejectProcess) {
      return;
    }
    this.isAcceptOrRejectProcess = true;

    this.findingId = params['findingid'];
    this.auditId = params['asssessmentid'];

    if (params['isauditor'] === undefined || params['isauditor'] === null) {
      this.isAcceptOrRejectProcess = false;
      return;
    }

    if (params['acceptval'] === '1') {
      this.confirmAction = 'accept';
      this.showReasonInput = false;
    } else if (params['acceptval'] === '0') {
      this.confirmAction = 'reject';
      this.showReasonInput = true;
    } else {
      this.isAcceptOrRejectProcess = false;
      return;
    }
    this.confirmDialogOpen();
  }

  acceptOrRejectFindings() {
    if (this.isAcceptOrRejectProcess) {
      return;
    }
    this.isAcceptOrRejectProcess = true;
    let findingStageData = new AuditeeAcceptance();

    this.route.params.subscribe(params => {
      this.findingId = params['findingid'];
      this.auditId = params['asssessmentid'];
      findingStageData.audit_ID = this.auditId;
      findingStageData.findinG_ID = this.findingId;

      if (params['isauditor'] === undefined || params['isauditor'] === null) {
        this.isAcceptOrRejectProcess = false;
        return;
      }

      if (params['acceptval'] === '1') {
        this.confirmAction = 'accept';
        this.showReasonInput = false;
      } else if (params['acceptval'] === '0') {
        this.confirmAction = 'reject';
        this.showReasonInput = true;
      } else {
        this.isAcceptOrRejectProcess = false;
        return;
      }
      this.confirmDialogOpen();
    });
  }

  onConfirm(confirmed: boolean) {
    if (!confirmed) {
      this.isAcceptOrRejectProcess = false;
      this.reasonText = '';
      // Check if opened in popup/new window, close it; otherwise navigate
      if (window.opener && !window.opener.closed) {
        window.close();
      } else {
        this._router.navigateByUrl('/layout/checklistfindings/' + this.selectedCust);
      }
      return;
    }

    if (this.confirmAction === 'reject' && (!this.reasonText || this.reasonText.trim() === '')) {
      this._util.showError('Please provide a reason for rejection');
      this.isAcceptOrRejectProcess = false;
      this.confirmDialogOpen();
      return;
    }

    this.stageStatus = this.confirmAction === 'accept' ? 'Accept' : 'Reject';
    this.rejectReason = this.confirmAction === 'reject' ? this.reasonText : '';
    this.processAcceptReject();
  }

  processAcceptReject() {
    const findingStatusDataList: AuditeeAcceptance[] = [];
    let findingStageData = new AuditeeAcceptance();

    findingStageData.audit_ID = this.auditId;
    findingStageData.findinG_ID = this.findingId;
    findingStageData.status = this.stageStatus;
    findingStageData.remarks = this.rejectReason;
    
    // Set flags based on auditor/auditee and accept/reject
    findingStageData.isactive = true;
    // If auditor accepts the rejection, mark as submitted to complete the finding
    findingStageData.issubmitted = this.stageStatus === 'Accept';

    this.route.params.subscribe(params => {
      if (params['isauditor'] === '1') {
        findingStageData.iS_AUDITOR_ACCEPT = true;
        findingStatusDataList.push(findingStageData);
        this._appservice.saveAuditorAcceptanceStatus(findingStatusDataList).subscribe(
          data => {
            this._util.showSuccess('Auditor Finding status updated successfully');
            this.isAcceptOrRejectProcess = false;
            this.reasonText = '';
            // Close popup window if opened from another window, otherwise navigate
            setTimeout(() => {
              if (window.opener && !window.opener.closed) {
                window.close();
              } else {
                this._router.navigateByUrl('/layout/checklistfindings/' + this.selectedCust);
              }
            }, 1500); // Delay to show success message
          },
          (error) => {
            this.isAcceptOrRejectProcess = false;
            this.reasonText = '';
            this._util.serviceError(error);
          }
        );
      } else if (params['isauditor'] === '0') {
        findingStageData.iS_AUDITOR_ACCEPT = false;
        findingStatusDataList.push(findingStageData);
        this._appservice.saveAuditeeAcceptanceStatus(findingStatusDataList).subscribe(
          data => {
            this._util.showSuccess('Auditee Finding status updated successfully');
            this.isAcceptOrRejectProcess = false;
            this.reasonText = '';
            // Close popup window if opened from another window, otherwise navigate
            setTimeout(() => {
              if (window.opener && !window.opener.closed) {
                window.close();
              } else {
                this._router.navigateByUrl('/layout/checklistfindings/' + this.selectedCust);
              }
            }, 1500); // Delay to show success message
          },
          (error) => {
            this.isAcceptOrRejectProcess = false;
            this.reasonText = '';
            this._util.serviceError(error);
          }
        );
      }
    });
  }

  confirmDialogOpen() {
    if (!this.confirmationDialogTemplate) {
      console.error('Confirmation dialog template not found');
      this._util.showError('Dialog template not initialized');
      return;
    }

    const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
      width: '560px',
      maxWidth: '90vw',
      panelClass: 'modern-confirm-dialog',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
      data: { confirmAction: this.confirmAction, showReasonInput: this.showReasonInput }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === '1') {
        this.onConfirm(true);
      } else {
        this.onConfirm(false);
      }
    });
  }

  getstageDesc(id: string) {
    return this.stageDict[id];
  }

  saveDates() {
    if (this.showByFindings == "2") {
      this.DateSelection.startDate = null as any;
      this.DateSelection.endDate = null as any;
    } else {
      this.DateSelection.startDate = new Date(
        this.DateSelection.selectedStartYear,
        this._util.getMonthNum(this.DateSelection.selectedStartMonth),
        1
      );
      this.DateSelection.endDate = new Date(
        this.DateSelection.selectedEndYear,
        this._util.getMonthNum(this.DateSelection.selectedEndMonth) + 1,
        0
      );
    }
  }

  showdisplayedColumns() {
    if (this._util.IsPremier(this.selectedCust))
      this.showport = false;
    else
      this.showport = true;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // Connect paginator after view initialization
    this.connectPaginator();
    
    // Handle accept/reject dialog now that template is available
    if (this.pendingAcceptRejectParams) {
      // Use setTimeout to ensure change detection has completed
      setTimeout(() => {
        this.handleAcceptRejectProcess(this.pendingAcceptRejectParams);
        this.pendingAcceptRejectParams = null;
      }, 0);
    }
  }

  connectPaginator() {
    // Since we have multiple paginators (one per tab), connect the first active one
    if (this.paginator && this.paginator.first) {
      this.dataSource.paginator = this.paginator.first;
    }
  }

  filteredData() {
    // Early exit if no data
    if (!this.allfindings || this.allfindings.length === 0) {
      this.findings = [];
      this.refreshTable([]);
      return;
    }

    let tempData: FindingDetails[] = [];
    
    // Filter by selected projects using Set for O(1) lookup
    if (this._shared.selectedProjects && this._shared.selectedProjects.length > 0) {
      const selectedProjectsSet = new Set(this._shared.selectedProjects);
      tempData = this.allfindings.filter(x => selectedProjectsSet.has(x.projecT_ID));
    }
    // If projects array exists but is empty (user explicitly unselected all)
    else if (this._shared.selectedProjects != null && this._shared.selectedProjects.length == 0) {
      tempData = [];
    }
    // If projects is undefined/null (not initialized yet), show all data
    else if (this._shared.selectedProjects == undefined || this._shared.selectedProjects == null) {
      tempData = this.allfindings;
    }

    // Apply filter criteria only if exists
    if (this.filterCriteria && this.filterCriteria.length > 0) {
      tempData = this._util.ApplyCriteriaRange(this.filterCriteria, tempData);
    }
    
    // Filter by status (Open/Closed) - optimized logic
    if (!this.OpenFindings && !this.ClosedFindings) {
      tempData = [];
    } else if (this.ClosedFindings && !this.OpenFindings) {
      tempData = tempData.filter(x => x.stagE_STATUS === "Corrective Action Implementation Verified");
    } else if (this.OpenFindings && !this.ClosedFindings) {
      tempData = tempData.filter(x => x.stagE_STATUS !== "Corrective Action Implementation Verified");
    }

    this.findings = this.getgroupedData(tempData);
    const filtered: FindingDetails[] = (this.findings && this.findings.length > 0) ? this.findings[0].findings : [];
    this.refreshTable(filtered);
  }

  getgroupedData(data: FindingDetails[]): FindingByType[] {
    var output: FindingByType[] = [];
    let element: FindingByType | undefined;

    for (let i = 0; i < data.length; i++) {
      element = output.find(x => x.findinG_TYPE == data[i].findinG_TYPE);
      if (element != null)
        element.findings.push(data[i])
      else {
        element = new FindingByType(data[i].findinG_TYPE);
        output.push(element);
        element.findings.push(data[i]);
      }
    }

    return output;
  }

  onTabChanged(event: MatTabChangeEvent) {
    if (this.findings != undefined && this.findings.length > 0) {
      let filteredfindings = this.findings[event.index].findings;
      this.refreshTable(filteredfindings);
      
      // Important: Connect the paginator for the current tab
      // Use setTimeout to ensure the view is updated
      setTimeout(() => {
        if (this.paginator && this.paginator.toArray()[event.index]) {
          this.dataSource.paginator = this.paginator.toArray()[event.index];
        }
      });
    }
  }

  Filter_onChange($event: any) {
    let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filteredData();
  }

  onProjectsSelected(projects: string[]) {
    this._shared.selectedProjects = projects;
    // Just filter existing data like legacy code - don't reload from API
    if (this.allfindings && this.allfindings.length > 0) {
      this.filteredData();
    }
  }

  getAllFindingsForCustomer() {
    // Prevent duplicate simultaneous API calls
    if (this.dataLoadInProgress) {
      return;
    }
    
    this.dataLoadInProgress = true;
    this.saveDates();
    const obj = new FindingModel();
    obj.cusT_ID = this.selectedCust;
    obj.starT_DATE = this.DateSelection.startDate == null ? null : this.DateSelection.startDate.toDateString();
    obj.enD_DATE = this.DateSelection.endDate == null ? null : this.DateSelection.endDate.toDateString();
    
    // Send first project ID like legacy code (even if undefined)
    obj.proJ_ID = this._shared.selectedProjects?.[0];
    
    // Clear existing data to show loading state
    this.findings = undefined as any;
    this.originalfindings = undefined as any;
    
    this._appservice.getAllFindingsForCustomer(obj).subscribe({
      next: (data) => {
        this.findings = data;
        this.originalfindings = data;
        
        // Process data efficiently
        if (data && data.length > 0) {
          this.getFindingsWithoutGroup(data);
          this.filteredData();
        } else {
          this.allfindings = [];
          this.refreshTable([]);
        }
        
        this.dataLoadInProgress = false;
      },
      error: (error) => { 
        this._util.serviceError(error); 
        this.originalfindings = []; 
        this.allfindings = [];
        this.refreshTable([]);
        this.dataLoadInProgress = false;
      }
    });
  }

  getFindingsWithoutGroup(findings: FindingByType[]) {
    // Use flatMap for better performance than forEach with spread
    this.allfindings = findings.flatMap(x => x.findings);
  }

  refreshTable(data: FindingDetails[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    // Reconnect paginator after creating new dataSource
    if (this.paginator && this.paginator.first) {
      this.dataSource.paginator = this.paginator.first;
    }
  }

  NewParam(id: number, name: string): ParameterModel {
    let prob = new ParameterModel();
    prob.id = id;
    prob.name = name;
    return prob;
  }

  ViewAssessmentFindingDetails(row: FindingDetails) {
    this.isSelectedRow = row;
    let obj = new FindingModel();
    obj.cusT_ID = row.customeR_ID;
    obj.proJ_ID = row.projecT_ID;
    obj.assessmenT_ID = row.assessmenT_ID;
    obj.iS_FROM_DASHBOARD = true;

    // TODO: Open ChecklistExecutionNewComponent dialog
    // NOTE: ChecklistExecutionNewComponent needs to be migrated first
  }

  clearValue() {
    localStorage.setItem("isFromFindingByAge", "");
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
