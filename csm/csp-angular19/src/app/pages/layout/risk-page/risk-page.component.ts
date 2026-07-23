import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TextFieldModule } from '@angular/cdk/text-field';

import { RiskModel, RiskModelExt } from '../../../shared/models/risk.model';
import { ActionitemModelNew } from '../../../shared/models/action-items.model';
import { AppsService } from '../../../services/apps.service';
import { LayoutService } from '../../../features/layout/layout.service';
import { SharedService } from '../../../shared/shared.service';
import { UtilityService } from '../../../core/services/utility.service';
import { AccessControl } from '../../../shared/access-control';
import { environment } from '../../../../environments/environment';
import { RiskRepositoryComponent } from '../../../features/risk-repository/risk-repository.component';
import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { TableFilterComponent } from '../../../shared/components/table-filter/table-filter.component';
import { RiskStatementGuidelineComponent } from '../risk-statement-guideline/risk-statement-guideline.component';
import { RiskActionItemsComponent } from '../risk-action-items/risk-action-items.component';
import { RiskTreatmentPopupComponent } from '../risk-treatment-popup/risk-treatment-popup.component';
import { EntityBaseInfoComponent } from '../entity-base-info/entity-base-info.component';
import { WarningPopupComponent } from '../../../shared/components/warning-popup/warning-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MyUtility } from '@app/shared/my-utility';

enum enumRoles {
  BUHeadIMS = 10,
  PMO = 11,
  Quality = 12
}

@Component({
  selector: 'app-risk-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule,
    TextFieldModule,
    PortfolioProjectSelectorComponent,
    TableFilterComponent
  ],
  templateUrl: './risk-page.component.html',
  styleUrls: ['./risk-page.component.scss']
})
export class RiskPageComponent implements OnInit, AfterViewInit {

  // ─── FIX: setter-based ViewChild so paginator/sort wire up immediately ────
  private _paginator!: MatPaginator;
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    this._paginator = p;
    if (p) {
      this.dataSource.paginator = p;
    }
  }
  get paginator(): MatPaginator { return this._paginator; }

  private _sort!: MatSort;
  @ViewChild(MatSort) set sort(s: MatSort) {
    this._sort = s;
    if (s) {
      this.dataSource.sort = s;
    }
  }
  get sort(): MatSort { return this._sort; }
  // ──────────────────────────────────────────────────────────────────────────

  @ViewChild('expansionPanel') expansionPanel!: MatExpansionPanel;
  @ViewChild('confirmationDialog') confirmationDialogTemplate!: TemplateRef<any>;
  @ViewChild('TABLE') table: any;

  private route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  _appservice = inject(AppsService);
  _layoutService = inject(LayoutService);
  _shared = inject(SharedService);
  _util = inject(UtilityService);
  _export = inject(MyUtility);
  _access = inject(AccessControl);

  displayedColumns: string[] = ['index', 'Portfolio_Name', 'proJ_NM', 'identifieD_DATE', 'description', 'impact', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'rating', 'matrix', 'status', 'iS_PLAN_EXISTS', 'actuaL_DATE', 'edit'];
  displayedColumns1: string[] = ['index', 'description', 'owner', 'targeT_DATE', 'identifieD_DATE', 'status', 'priority', 'updateD_BY', 'updateD_DATE', 'edit', 'delete'];

  // ─── FIX: single shared DataSource instances – never replaced ─────────────
  dataSource = new MatTableDataSource<RiskModelExt>([]);
  dataSource1 = new MatTableDataSource<ActionitemModelNew>([]);
  // ──────────────────────────────────────────────────────────────────────────

  input: RiskModelExt[] = [];
  result: ActionitemModelNew[] = [];
  EditRisk: RiskModel = new RiskModel();
  input_projectid: string = '';
  isPopOpened: boolean = false;
  projects: string[] = [];
  portfolio: string[] = [];
  selectedProject: string = 'All Projects';
  selectedPortfolio: string = 'All Portfolios';
  tempData: RiskModelExt[] = [];
  tempData1: RiskModelExt[] = [];
  AllChecked: boolean = false;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  toggle: string = 'Show';
  bShowFilter: boolean = true;
  filterCriteria: any;
  filteredData: any;
  isLoading: boolean = false;
  overallData: any;
  isEditAllowed: boolean = false;
  readonlymode: boolean = true;
  editmode: boolean = false;
  newRisk: boolean = false;
  showtable: boolean = false;
  riskId: any;
  allproj: boolean = false;

  TeamMembers: any[] = [];
  projNames: any[] = [];
  riskLocations: any[] = [];
  riskCategories: any[] = [];
  isoStandardList: any[] = [];
  proj_isoStandardList: any[] = [];
  filteredIsoStandardList: any[] = [];
  riskIsoMappingList: any[] = [];
  projectId: string = '';
  projectName: string = '';
  projectData: any;
  riskTrtPlanData: any[] = [];
  isSelectedRow: any;

  // Max date for Next Risk Assessment Date (6 months from today)
  get maxAssessmentDate(): Date {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    return maxDate;
  }

  ngOnInit(): void {
    this.isPopOpened = this.route.snapshot.data['isPopup'] || false;

    if (!this.isPopOpened) {
      this.route.params.subscribe(params => {
        this._layoutService.selectedCust = params['custid'];
        this.riskId = params['riskid'];
      });
    }

    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    if (!this._util.IsPremier(this._layoutService.selectedCust)) {
      this.displayedColumns = ['index', 'proJ_NM', 'identifieD_DATE', 'description', 'impact', 'owner', 'probabilitY_SCALE', 'impacT_SCALE', 'rating', 'matrix', 'status', 'iS_PLAN_EXISTS', 'actuaL_DATE', 'edit'];
    }

    this.service_getRiskDetailsByCustomerId(this._layoutService.selectedCust);
    this.getAllProjectsFromCustomer();
    this.getAllRiskCategories();
    this.getAllRiskLocation();
    this.GetEmployeeNames();
  }

  ngAfterViewInit() {
    // Safety net — setters above handle the primary wiring
    if (this._paginator) this.dataSource.paginator = this._paginator;
    if (this._sort) this.dataSource.sort = this._sort;
  }

  filterData(portfolioId: any, projectId: string[], allchecked: any, pastDue: any, dueforClosure: any) {
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.input);

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0 && this.filteredData != undefined && this.filteredData != null) {
      this.filteredData = this.filteredData.filter((x: any) => this._shared.selectedProjects.indexOf(x.projecT_ID) >= 0);
    }

    if (allchecked) {
      // Show all
    } else {
      this.filteredData = this.filteredData.filter((x: any) => x.status != 'Occurred' && x.status != 'Closed');

      if (pastDue && dueforClosure) {
        // Show both
      } else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      } else if (pastDue) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) < currentDate);
      } else if (dueforClosure) {
        this.filteredData = this.filteredData.filter((x: any) => new Date(x.targeT_DATE) >= currentDate);
      }
    }

    this.RefreshTableForProject(this.filteredData);
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  showFilteredRows() {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  service_getAuditeeDetails(customerId: any, projectId: string) {
    if (projectId != undefined && projectId != null && projectId.trim() != "" && projectId != "All Projects" && customerId != 0) {
      this._appservice.getAuditeeDetails(customerId, projectId).subscribe({
        next: (data) => {
          this.TeamMembers = data;
          this.TeamMembers.forEach((x: any) => x.empid = x.emP_ID.toString());
        },
        error: (error) => this._util.serviceError(error)
      });
    }
  }

  GetRiskIsoMappingList(riskId: number) {
    this.riskIsoMappingList = [];
    this._appservice.GetRiskIsoMappingList().subscribe(data => {
      this.riskIsoMappingList = data;
      if (riskId > 0)
        this.EditRisk.isO_STD_ID = this.riskIsoMappingList.filter((item: any) => item.risK_ID === riskId).map((item: any) => item.isO_STANDARD_ID);
    });
  }

  getIsoStandardProjectMappingList(projId: string, riskId: number) {
    this.GetRiskIsoMappingList(riskId);
    this.isoStandardList = [];
    this.proj_isoStandardList = [];
    this.filteredIsoStandardList = [];

    this._appservice.GetIsoStandardList().subscribe({
      next: (data) => {
        this.isoStandardList = data;
        this.filteredIsoStandardList = this.isoStandardList;
      },
      error: (error) => this._util.serviceError(error)
    });
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this._layoutService.selectedCust, this.allproj).subscribe({
      next: (data) => {
        this.projNames = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getAllRiskLocation() {
    this._appservice.GetRiskLocation().subscribe({
      next: (data) => {
        this.riskLocations = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  getAllRiskCategories() {
    this._appservice.GetRiskCategory().subscribe({
      next: (data) => {
        this.riskCategories = data;
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  checkforever(val: boolean) {
    if (!val) {
      this.EditRisk.accepT_TILL = null;
    }
  }

  GetEmployeeNames() {
    return;
  }

  calculateRisk() {
    if (this.EditRisk.probabilitY_SCALE != null && this.EditRisk.probabilitY_SCALE != undefined &&
      this.EditRisk.impacT_SCALE != null && this.EditRisk.impacT_SCALE != undefined) {
      const probabilityScale = this.EditRisk.probabilitY_SCALE;
      const impactScale = this.EditRisk.impacT_SCALE;

      if (probabilityScale * impactScale < 5) {
        this.EditRisk.risK_LEVEL = "Low";
      } else if (probabilityScale * impactScale < 10) {
        this.EditRisk.risK_LEVEL = "Moderate";
      } else if (probabilityScale * impactScale < 20) {
        this.EditRisk.risK_LEVEL = "High";
      } else {
        this.EditRisk.risK_LEVEL = "Catastrophic";
      }
    }
  }

  calculateNewRisk() {
    if (this.EditRisk.neW_LIKELIHOOD_SCALE != null && this.EditRisk.neW_LIKELIHOOD_SCALE != undefined &&
      this.EditRisk.neW_CONSEQUENCES_SCALE != null && this.EditRisk.neW_CONSEQUENCES_SCALE != undefined) {
      const probabilityScale = this.EditRisk.neW_CONSEQUENCES_SCALE;
      const impactScale = this.EditRisk.neW_LIKELIHOOD_SCALE;

      if (probabilityScale * impactScale < 5) {
        this.EditRisk.neW_RISK_LEVEL = "Low";
      } else if (probabilityScale * impactScale < 10) {
        this.EditRisk.neW_RISK_LEVEL = "Moderate";
      } else if (probabilityScale * impactScale < 20) {
        this.EditRisk.neW_RISK_LEVEL = "High";
      } else {
        this.EditRisk.neW_RISK_LEVEL = "Catastrophic";
      }
    }
  }

  SubmitForm(isValid: boolean) {
    if (!isValid) {
     const errors: string[] = [];

  // Section 1 – Risk Identification
  if (!this.EditRisk.projecT_ID)
    errors.push('Section 1 (Risk Identification): Project Name');
  if (!this.EditRisk.description?.trim())
    errors.push('Section 1 (Risk Identification): Risk Description');
  if (!this.EditRisk.impact?.trim())
    errors.push('Section 1 (Risk Identification): Business Impact Description');
  if (!this.EditRisk.location)
    errors.push('Section 1 (Risk Identification): Location');
  if (!this.EditRisk.risK_CATEGORY)
    errors.push('Section 1 (Risk Identification): Risk Category');
  if (!this.EditRisk.identifieD_BY?.trim())
    errors.push('Section 1 (Risk Identification): Identified By');
  if (!this.EditRisk.identifieD_DATE)
    errors.push('Section 1 (Risk Identification): Identified Date');

  // Section 2 – Risk Analysis
  if (!this.EditRisk.impacT_SCALE)
    errors.push('Section 2 (Risk Analysis): Current Consequences Scale');
  if (!this.EditRisk.probabilitY_SCALE)
    errors.push('Section 2 (Risk Analysis): Current Likelihood Scale');
  if (!this.EditRisk.owner?.trim())
    errors.push('Section 2 (Risk Analysis): Owner');
  if (!this.EditRisk.status)
    errors.push('Section 2 (Risk Analysis): Status');
  if ((this.EditRisk.status === 'Closed' || this.EditRisk.status === 'Occurred') && !this.EditRisk.actuaL_DATE)
    errors.push(`Section 2 (Risk Analysis): ${this.EditRisk.status} Date`);

  // Section 3 – Risk Treatment Plan
  if (!this.EditRisk.risK_TREATMENT_STRATEGY)
    errors.push('Section 3 (Risk Treatment Plan): Risk Treatment Strategy');
  if (!this.EditRisk.actioN_ITEM_DESCRIPTION?.trim())
    errors.push('Section 3 (Risk Treatment Plan): Risk Treatment Description');
  if (!this.EditRisk.actioN_ITEM_OWNER?.trim())
    errors.push('Section 3 (Risk Treatment Plan): Responsible Person');
  if (!this.EditRisk.actioN_ITEM_IDENTIFIED_DATE)
    errors.push('Section 3 (Risk Treatment Plan): Identified Date');
  if (!this.EditRisk.actioN_ITEM_TARGET_DATE)
    errors.push('Section 3 (Risk Treatment Plan): Target Date');

  if (errors.length > 0) {
    const message = 'Please fill in the following required fields:\n\n' + errors.join('\n');
    this.showWarningPopup(message);
    return;
  }
    }

    const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;

    if (this.EditRisk.targeT_DATE != undefined && this.EditRisk.targeT_DATE != null) {
      var curDate = new Date();
      if (this.EditRisk.targeT_DATE < new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0, 0)) {
        this.showWarningPopup("Target Date should be later than Today");
        return;
      }
    }

    if (this.EditRisk.accepT_TILL != undefined && this.EditRisk.accepT_TILL != null) {
      if (new Date(this.EditRisk.identifieD_DATE!) > new Date(this.EditRisk.accepT_TILL)) {
        this.showWarningPopup("Accept Till date should be after Risk identified date.");
        return;
      }
    }

    if ((specialCharPattern.test(this.EditRisk.description!)) || numberPattern.test(this.EditRisk.description!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for risk description');
      return;
    }

    if ((specialCharPattern.test(this.EditRisk.impact!)) || numberPattern.test(this.EditRisk.impact!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for business impact description');
      return;
    }

    if ((specialCharPattern.test(this.EditRisk.owner!)) || numberPattern.test(this.EditRisk.owner!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for risk owner');
      return;
    }

    if ((specialCharPattern.test(this.EditRisk.area!)) || numberPattern.test(this.EditRisk.area!)) {
      this.showWarningPopup('Please enter alphanumeric or numeric values along with special characters for risk area');
      return;
    }

    if ((specialCharPattern.test(this.EditRisk.identifieD_BY!)) || numberPattern.test(this.EditRisk.identifieD_BY!)) {
      this.showWarningPopup('Please enter alphanumeric name for identified by');
      return;
    }

    const currentDate = new Date();
    const minDate = new Date();
    minDate.setMonth(currentDate.getMonth() - 12);

    if (this.EditRisk.identifieD_DATE! <= minDate) {
      this.showWarningPopup("Identified date should be within a year from current date");
      return;
    }

    if (this.EditRisk.targeT_DATE != undefined && this.EditRisk.targeT_DATE != null &&
      this.EditRisk.identifieD_DATE != undefined && this.EditRisk.identifieD_DATE != null) {
      if (new Date(this.EditRisk.identifieD_DATE) > new Date(this.EditRisk.targeT_DATE)) {
        this.showWarningPopup("Target date should be after Risk identified date.");
        return;
      }
    }

    this.EditRisk.actuaL_DATE = this.EditRisk.actuaL_DATE != null ? this._util.setLocaleDate(this.EditRisk.actuaL_DATE) : null;
    this.EditRisk.identifieD_DATE = this.EditRisk.identifieD_DATE != null ? this._util.setLocaleDate(this.EditRisk.identifieD_DATE) : null;
    this.EditRisk.targeT_DATE = this.EditRisk.targeT_DATE != null ? this._util.setLocaleDate(this.EditRisk.targeT_DATE) : null;
    this.EditRisk.actioN_ITEM_IDENTIFIED_DATE = this.EditRisk.actioN_ITEM_IDENTIFIED_DATE ? this._util.setLocaleDate(this.EditRisk.actioN_ITEM_IDENTIFIED_DATE) : null;
    this.EditRisk.actioN_ITEM_TARGET_DATE = this.EditRisk.actioN_ITEM_TARGET_DATE ? this._util.setLocaleDate(this.EditRisk.actioN_ITEM_TARGET_DATE) : null;
    this.EditRisk.actioN_ITEM_COMPLETION_DATE = this.EditRisk.actioN_ITEM_COMPLETION_DATE ? this._util.setLocaleDate(this.EditRisk.actioN_ITEM_COMPLETION_DATE) : null;
    this.EditRisk.neW_RISK_ASSESSMENT_DATE = this.EditRisk.neW_RISK_ASSESSMENT_DATE ? this._util.setLocaleDate(this.EditRisk.neW_RISK_ASSESSMENT_DATE) : null;
    this.EditRisk.risK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE = this.EditRisk.risK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE ? this._util.setLocaleDate(this.EditRisk.risK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE) : null;

    if (this.EditRisk.id === 0 || this.EditRisk.id === undefined) {
      this.EditRisk.id = 0;
      this.EditRisk.rag = 'green';
      this.EditRisk.createD_BY = localStorage.getItem('empid')!;
      this.EditRisk.createD_DATE = new Date();
      this.EditRisk.updateD_BY = localStorage.getItem('empid')!;
      this.EditRisk.updateD_DATE = new Date();
      this.EditRisk.iS_DRAFT = false;
      this.service_addRisk(this.EditRisk);
      this.showWarningPopup("Risk added successfully");
      this.readonlymode = true;
      this.editmode = false;
      this.showtable = false;
    } else {
      this.EditRisk.updateD_BY = localStorage.getItem('empid')!;
      this.EditRisk.updateD_DATE = new Date();
      this.EditRisk.iS_DRAFT = false;
      this.service_updateRisk(this.EditRisk);
      this.showWarningPopup("Risk updated successfully");
      this.readonlymode = true;
      this.editmode = false;
      this.showtable = false;
    }

    this.service_getRiskDetailsByCustomerId(this._layoutService.selectedCust);
    this.newEditRisk();
  }

  Edit_onClick() {
    let today = new Date();
    if (this.EditRisk.id == 0 || this.EditRisk.id == undefined || this.EditRisk.id == null) {
      this.EditRisk.neW_RISK_ASSESSMENT_DATE = new Date(today.getTime() + (31 * 24 * 60 * 60 * 1000));
    }

    this.readonlymode = false;
    this.editmode = true;
    this.showtable = false;
    this.newRisk = false;
  }

  Cancel_onClick() {
    if (this.riskId != null || this.riskId != undefined || this.riskId != 0) {
      this.riskId = null;
    }
    this.readonlymode = true;
    this.editmode = false;
    this.newEditRisk();
    this.service_getRiskDetailsByCustomerId(this._layoutService.selectedCust);
    this.showtable = false;
    this.newRisk = false;
  }

  EditRow_onClick(element: RiskModelExt) {
    this.EditRisk = element;
    this.getIsoStandardProjectMappingList(element.projecT_ID!, element.id!);
    this.EditRisk.forever = this.EditRisk.accepT_TILL != null && this.EditRisk.accepT_TILL != undefined;
    this.Edit_onClick();
    this.getActionItems(this.EditRisk.projecT_ID!, this.EditRisk.id!);
    this.projectId = this.EditRisk.projecT_ID!;
    this.getProjectName(this.projectId);
    this.newRisk = true;
  }

  showRiskTreatmentPlanTable() {
    if (this.newRisk) {
      if (this.expansionPanel.expanded) {
        this.showtable = true;
      } else {
        this.showtable = false;
      }
    }
  }

  getProjectName(_projectId: string) {
    this._appservice.GetProjectDetailForEdit(this.projectId).subscribe(
      data => {
        this.projectData = data;
        this.projectName = this.projectData.proJ_NM;
      });
  }

  Add_ActionItem() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.data = {
      Flag: 'add',
      ProjectName: this.projectName,
      ProjectId: this.projectId,
      RiskId: this.EditRisk.id,
      CustomerId: this._layoutService.selectedCust
    };

    const dialogRef = this.dialog.open(RiskActionItemsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getActionItems(this.projectId, this.EditRisk.id!);
      }
    });
  }

  Edit_ActionItem(element: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.data = {
      Flag: 'edit',
      ProjectName: this.projectName,
      ProjectId: this.projectId,
      ActionItem: element,
      CustomerId: this._layoutService.selectedCust
    };

    const dialogRef = this.dialog.open(RiskActionItemsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getActionItems(this.projectId, this.EditRisk.id!);
      }
    });
  }

  Delete_ActionItem(element: ActionitemModelNew) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this risk treatment plan item?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Risk Treatment Plan',
      icon: 'delete_forever'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.deleteActionItemforRisk(element).subscribe({
          next: (data) => { },
          error: (error) => {
            this._util.serviceError(error);
          },
          complete: () => {
            // Remove immediately from local array — no API reload needed
            const idx = this.result.indexOf(element);
            if (idx > -1) this.result.splice(idx, 1);
            this.result.sort((a, b) =>
              a.identifieD_DATE! > b.identifieD_DATE! ? -1 :
                a.identifieD_DATE! < b.identifieD_DATE! ? 1 : 0
            );
            // Update side panel table in-place immediately
            this.dataSource1.data = [...this.result];
            this.showWarningPopup('Risk Treatment Plan deleted successfully');
          }
        });
      }
    });
  }

  loadData(element: string) {
    this.getIsoStandardProjectMappingList(element, 0);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = "90%";
    dialogConfig.height = "90%";
    dialogConfig.panelClass = 'risk-repository-dialog'; // Add custom class for styling
    dialogConfig.data = {
      CustomerId: this._layoutService.selectedCust,
      ProjectId: element,
    };
    const dialogRef = this.dialog.open(RiskRepositoryComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined && result.data != null && result.data != undefined) {
        this.Cancel_onClick();
      }
    });
  }

  ExportTOExcel() {
    let name = 'Risks';
    // Clone the table to remove action columns before export
    const tableClone = this.table.nativeElement.cloneNode(true) as HTMLElement;
    
    // Remove all elements with 'no-export' class
    const noExportElements = tableClone.querySelectorAll('.no-export');
    noExportElements.forEach((element: any) => element.remove());

    this._export.exportToExcel(tableClone, name);
  }

  DeleteRow_onClick(element: RiskModelExt): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Are you sure you want to delete this risk?',
      isConfirmation: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      title: 'Delete Risk',
      icon: 'delete_forever'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';

    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._appservice.deleteRisk(element).subscribe({
          next: (data) => { },
          error: (error) => this._util.serviceError(error),
          complete: () => {
            this.input.splice(this.input.indexOf(element), 1);
            this.input.sort((a, b) => a.identifieD_DATE! > b.identifieD_DATE! ? -1 : a.identifieD_DATE! < b.identifieD_DATE! ? 1 : 0);
            this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
            this.showWarningPopup('Risk deleted successfully');
          }
        });
      }
    });
  }

  ViewTrtPlan_onClick(element: RiskModelExt) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '900px';
    dialogConfig.maxHeight = '80vh';
    dialogConfig.data = {
      element: element
    };

    this.dialog.open(RiskTreatmentPopupComponent, dialogConfig);
  }

  getRiskTreatPlanItems(projectId: string, riskId: number) {
    this._appservice.getActionItemsforRisk(projectId, riskId).subscribe({
      next: (data) => {
        this.riskTrtPlanData = data;
      },
      error: (error) => this._util.serviceError(error)
    });
  }

  // ─── FIX: update .data in-place, never replace the DataSource instance ────
  RefreshTable() {
    this.dataSource.data = this.input;
    setTimeout(() => {
      if (this._paginator) {
        this.dataSource.paginator = this._paginator;
        this._paginator.firstPage();
      }
      if (this._sort) {
        this.dataSource.sort = this._sort;
      }
    });
  }

  RefreshTableforActionItems(data: ActionitemModelNew[]) {
    this.dataSource1.data = data;
  }

  RefreshTableForProject(data: RiskModelExt[]) {
    this.dataSource.data = data;
    setTimeout(() => {
      if (this._paginator) {
        this.dataSource.paginator = this._paginator;
        this._paginator.firstPage();
      }
      if (this._sort) {
        this.dataSource.sort = this._sort;
      }
    });
  }
  // ──────────────────────────────────────────────────────────────────────────

  Project_OnClick() {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  Portfolio_OnClick() {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  Project_Change() {
    this.EditRisk.owner = undefined;
    this.EditRisk.identifieD_BY = undefined;
    this.GetEmployeeNames();
  }

  getOwnerName(risk: RiskModelExt): string {
    if (risk.owneR_NAME != undefined && risk.owneR_NAME != null)
      return risk.owneR_NAME;
    if (this.TeamMembers.filter((x: any) => x.emP_ID.toString() == risk.owner).length > 0)
      return this.TeamMembers.filter((x: any) => x.emP_ID.toString() == risk.owner)[0].frsT_NM;
    if (this.TeamMembers.filter((x: any) => x.emaiL_ID == risk.owner).length > 0)
      return this.TeamMembers.filter((x: any) => x.emaiL_ID == risk.owner)[0].frsT_NM;
    if (risk.owner == "-1")
      return "";
    return risk.owner || "";
  }

  strategy_change() {
    if (this.EditRisk.risK_TREATMENT_STRATEGY != "Accept") {
      this.EditRisk.accepT_TILL = null;
    }
  }

  service_getRiskDetailsByCustomerId(custid: string) {
    this.isLoading = true;
    this._appservice.GetRiskDetailsByCustomerId(custid, this.allproj).subscribe({
      next: (data) => {
        this.overallData = data;
        this.isEditAllowed = this.overallData.editAllowed;
        this.input = this.overallData.riskDetails;
        this.tempData = this.input.filter((x: any) => x.status != 'Closed' && x.status != 'Occurred');

        if (this._shared.savedportfolioId != 0)
          this.tempData = this.tempData.filter((x: any) => x.portfoliO_ID == this._shared.savedportfolioId);

        if (this._shared.savedportfolioId != 0 && this.tempData.length > 0)
          this.selectedPortfolio = this.tempData[0].portfoliO_NM!;
        else
          this.selectedPortfolio = "All Portfolios";

        this.projects = (this.input.map((x: any) => x.proJ_NM)).filter((x: any, i: number, a: any[]) => a.indexOf(x) == i).sort();
        this.projects.unshift("All Projects");
        this.portfolio = (this.input.map((x: any) => x.portfoliO_NM)).filter((x: any, i: number, a: any[]) => a.indexOf(x) == i).sort();
        this.portfolio.unshift("All Portfolios");
        this.newEditRisk();
        this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);

        if (this.riskId != null && this.riskId != undefined && this.riskId != 0) {
          let element = this.input.filter((x: any) => x.id == this.riskId)[0];
          this.EditRow_onClick(element);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._util.serviceError(error);
      }
    });
  }

  service_addRisk(risk: RiskModel) {
    this._appservice.addRisk(risk).subscribe({
      next: (data) => {
        this.input.push(data);
        this.input.sort((a, b) => a.identifieD_DATE! > b.identifieD_DATE! ? -1 : a.identifieD_DATE! < b.identifieD_DATE! ? 1 : 0);
        this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        this._appservice.loadOverAllRisksData().subscribe();
      },
      error: (error) => this._util.serviceError(error)
    });
  }

  service_updateRisk(risk: RiskModel) {
    this._appservice.updateRisk(risk).subscribe({
      next: (data) => {
        this.input.sort((a, b) => a.identifieD_DATE! > b.identifieD_DATE! ? -1 : a.identifieD_DATE! < b.identifieD_DATE! ? 1 : 0);
        this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
        this._appservice.loadOverAllRisksData().subscribe();
      },
      error: (error) => this._util.serviceError(error)
    });
  }

  newEditRisk() {
    this.EditRisk = new RiskModel();
  }

  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }

  Filter_onChange($event: any) {
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  getActionItems(projectId: string, riskId: number) {
    this._appservice.getActionItemsforRisk(projectId, riskId).subscribe({
      next: (data) => {
        this.result = data;
        this.RefreshTableforActionItems(this.result);
      },
      error: (error) => this._util.serviceError(error)
    });
  }

  showAll($event: any) {
    // Event handler
  }

  projectSelected($event: any) {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), this.AllChecked, this.PastDueChecked, this.DueClosureChecked);
  }

  showRiskGuideline() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth = '95vw';
    dialogConfig.maxHeight = '80vh';
    dialogConfig.height = 'auto';
    dialogConfig.width = '1100px';
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(RiskStatementGuidelineComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      // Dialog closed - no action needed
    });
  }

  OpenRiskPopup(riskTreatmentStatus: string) {
    if (riskTreatmentStatus == 'Completed') {
      const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
        width: '500px',
        data: ''
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == 1) {
          this.EditRisk.probabilitY_SCALE = this.EditRisk.neW_LIKELIHOOD_SCALE;
          this.EditRisk.impacT_SCALE = this.EditRisk.neW_CONSEQUENCES_SCALE;
          this.calculateRisk();
        }
      });
    }
  }

  OpenEntityInfoPopup(element: RiskModelExt) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.panelClass = 'entity-info-dialog';
    dialogConfig.data = {
      entity: element,
      entityType: 'risk',
      header: 'Risk Information',
      project: element.proJ_NM
    };

    const dialogRef = this.dialog.open(EntityBaseInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      // Handle any actions after dialog closes if needed
    });
  }

  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
      isMultiLine: true  
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    this.dialog.open(WarningPopupComponent, dialogConfig);
  }
}