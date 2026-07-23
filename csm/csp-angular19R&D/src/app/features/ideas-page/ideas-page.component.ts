/**
 * IdeasPageComponent — Ideas & Innovations
 * Migrated from LEGACY-SOURCE/src/app/pages/layout/ideas-page/
 *
 * Features (100% coverage):
 * - List view with Details / Net Benefits radio toggle
 * - Portfolio + Project + Status filtering (AllChecked, PastDue, DueClosure)
 * - Filter toggle panel with app-table-filter
 * - Add / Edit / Delete innovations
 * - GAVS Services checkboxes
 * - Similar Ideas panel (right panel in edit mode)
 * - Effort optimization calculations (before/after, per-month/per-year, one-time)
 * - Savings computations
 * - Ideas Innovation Matrix dialog
 * - Role-based access control
 * - Toast notifications via MatSnackBar (replaces alert())
 * - Confirmation dialogs via DialogYesNoComponent (replaces confirm())
 *
 * Migration Notes:
 * - Converted to standalone component
 * - Used inject() for DI
 * - All method names, logic, and field names preserved exactly
 * - Template-driven forms preserved (ngForm / ngModel)
 */

import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

// App-level
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SharedService } from '../../shared/shared.service';
import { LayoutService } from '../layout/layout.service';
import { environment } from '../../../environments/environment';
import { enumRoles } from '../../shared/enum';

// Models
import { InnovationModel, InnovationModelExt, GAVSService } from '../../models/innovation-model';

// Shared controls
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';
import { PortfolioProjectSelectorComponent } from '../../shared/components/portfolio-project-selector/portfolio-project-selector.component';

// Feature dialogs
import { IdeasInnovationMatrixComponent } from '../ideas-innovation-matrix/ideas-innovation-matrix.component';

@Component({
  selector: 'app-ideas-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    TableFilterComponent,
    PortfolioProjectSelectorComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './ideas-page.component.html',
  styleUrls: ['./ideas-page.component.scss'],
})
export class IdeasPageComponent implements OnInit, OnChanges, AfterViewInit {
  // ─── Injected Services ─────────────────────────────────────────────────────
  private route = inject(ActivatedRoute);
  public _layoutService = inject(LayoutService);
  public _shared = inject(SharedService);
  public _access = inject(AccessControl);
  public _util = inject(MyUtility);
  public _appservice = inject(AppsService);
  public dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdref = inject(ChangeDetectorRef);

  // ─── Inputs ────────────────────────────────────────────────────────────────
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string = '';

  // ─── ViewChild ─────────────────────────────────────────────────────────────
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  // ─── State ─────────────────────────────────────────────────────────────────
  EditInnovation: InnovationModelExt = new InnovationModelExt();
  filteredIdeas: InnovationModelExt[] = [];
  filtered1Ideas: InnovationModelExt[] = [];
  displayedColumns: string[] = [];
  displayedColumns1: string[] = [];
  projects: string[] = [];
  portfolio: string[] = [];
  gavsServices: any;
  gavsServiceChecked: any[] = [];

  dataSource2: MatTableDataSource<InnovationModelExt> = new MatTableDataSource<InnovationModelExt>();
  tempData: any;
  selectedCust: string = '';
  private sub: any;
  ideasdata: any;
  idea: any;
  allproj: boolean = false;
  projNames: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  selectedProject: string = 'All Projects';
  selectedPortfolio: string = 'All Portfolios';
  AllChecked: boolean = false;
  PastDueChecked: boolean = true;
  DueClosureChecked: boolean = true;
  viewType: string = 'details';
  UOMList: any[] = [];

  isOneTime: boolean = false;
  phCases: string = 'No. of cases/Instances in one month';
  phFTEPersonHours: string = 'How many person hours in a month considered as one FTE';

  phEffort = 'Effort In Person hour';
  phCost = 'Cost in USD';
  phFTESpent = 'FTE Spent';
  companyName = environment.company_name;

  isBenefitsView: boolean = false;
  cycleTimeToolTip: string =
    'Cycle Time is the amount of time a team spends actually working on producing an item, up until the product is ready for shipment. ... This includes time spent producing the item and the wait stages (amount of time the task is left \'waiting\' on the board) between active work times.';
  leadTimeToolTip: string =
    'Lead time clock starts when the request is made and ends at delivery. Cycle time clock starts when work begins on the request and ends when the item is ready for delivery. Cycle time is a more mechanical measure of process capability. Lead time is what the customer sees.';
  ciyToolTip: string =
    'Please input no. of cases / instances applicable in a financial year – April to Mar';
  statusToolTip: string =
    'Please note system will not allow you to change the status to "Complete" unless the required data is filled under Current state and Future state section';

  beforE_COST_YEAR: string = '';
  afteR_COST_YEAR: string = '';

  beforE_EFFORT_YEAR: string = '';
  afteR_EFFORT_YEAR: string = '';

  status: string = '';
  colspan: number = 6;

  disableSave: boolean = false;
  showIdea: boolean = false;
  ideasid: any;
  errorStr: string = '';

  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  processArea: string[] = [];

  bShowFilter: boolean = true;
  filteredData: any;
  filterCriteria: any;

  HeaderRowAlignment = 'center-align';

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    const role = localStorage.getItem('role');
    if (
      role == enumRoles.BUHeadIMS.toString() ||
      role == enumRoles.PMO.toString() ||
      role == enumRoles.Quality.toString()
    )
      this.allproj = true;

    this.sub = this.route.params.subscribe((params) => {
      this.selectedCust = params['custid'];
      this._layoutService.selectedCust = params['custid'];
    });

    this.route.queryParams.subscribe((params) => {
      this.isBenefitsView = params['showBenefits'];
    });

    this.route.params.subscribe((params) => {
      if (params['ideasid'] != undefined && params['ideasid'] != null) {
        this.ideasid = params['ideasid'];
        this.showIdea = true;
      }
    });

    this.displayedColumns = [
      'index', 'portfoliO_NM', 'proJ_NM', 'description', 'identifieD_DATE',
      'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach', 'comments',
      'edit', 'delete',
    ];

    if (!this._util.IsPremier(this.selectedCust)) {
      this.displayedColumns = [
        'index', 'proJ_NM', 'description', 'identifieD_DATE',
        'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach', 'comments',
        'edit', 'delete',
      ];
      this.colspan = 5;
    }

    this.displayedColumns1 = [
      'index', 'identifieD_DATE', 'description', 'status', 'responsible', 'area', 'use',
    ];

    this.getAllIdeasDetails();
    this.Service_GetUOMList();
    this.newEditInnovation();

    if (this.isBenefitsView) {
      this.viewType = 'benefits';
      this.DoApplicable();
    }
  }

  ngOnChanges() {
    this.RefreshTable(this.ideasdata);
    this.newEditInnovation();
    this.editmode = false;
    this.readonlymode = true;
  }

  // ─── Toast Helper ──────────────────────────────────────────────────────────

  private showToast(
    message: string,
    type: 'success' | 'warn' | 'error',
    duration = 3000
  ): void {
    this.snackBar.open(message, '✕', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`],
    });
  }

  // ─── Disabled State ────────────────────────────────────────────────────────

  setDisabled() {
    let dsErrors = false;
    let dsCycleTime = false;
    let dsLeadTime = false;
    let dsEffortOptimization = false;

    if (this.EditInnovation.beforE_ERROR != null && this.EditInnovation.afteR_ERROR != null) {
      dsErrors = true;
    }
    if (this.EditInnovation.beforE_CYCLE_TIME != null && this.EditInnovation.afteR_CYCLE_TIME != null) {
      dsCycleTime = true;
    }
    if (this.EditInnovation.beforE_LEAD_TIME != null && this.EditInnovation.afteR_LEAD_TIME != null) {
      dsLeadTime = true;
    }
    if (
      this.EditInnovation.beforE_CASES_COUNT != null &&
      this.EditInnovation.beforE_TIME_TAKEN &&
      this.EditInnovation.beforE_FTECOST_HOUR != null &&
      this.EditInnovation.beforE_FTECOST_MONTH != null &&
      this.EditInnovation.afteR_CASES_COUNT != null &&
      this.EditInnovation.afteR_TIME_TAKEN &&
      this.EditInnovation.afteR_FTECOST_HOUR != null &&
      this.EditInnovation.afteR_FTECOST_MONTH != null
    ) {
      if (!this.EditInnovation.iS_ONETIME) {
        if (
          this.EditInnovation.beforE_OCCOURANCE_COUNT != null &&
          this.EditInnovation.afteR_OCCOURANCE_COUNT != null
        )
          dsEffortOptimization = true;
      } else {
        dsEffortOptimization = true;
      }
    }

    if (dsErrors || dsCycleTime || dsLeadTime || dsEffortOptimization) {
      return false;
    } else {
      return true;
    }
  }

  // ─── UOM List ──────────────────────────────────────────────────────────────

  Service_GetUOMList() {
    this._appservice.GetParametersByType('UOM').subscribe(
      (data) => {
        this.UOMList = data;
      },
      (error) => {
        this._util.serviceError(error);
      }
    );
  }

  // ─── One-Time Toggle ───────────────────────────────────────────────────────

  DoOneTime(event: any) {
    this.EditInnovation.iS_ONETIME = event.checked;
    this.isOneTime = event.checked;

    this.phEffort = 'Effort In Person hour';
    this.phCost = 'Cost in USD';
    this.phFTESpent = 'FTE Spent';

    if (this.isOneTime) {
      this.phCases = 'No. of cases/Instances';
      this.phFTEPersonHours = 'How many person hours considered as one FTE';
    } else {
      this.phCases = 'No. of cases/Instances in one month';
      this.phFTEPersonHours = 'How many person hours in a month considered as one FTE';
    }
  }

  // ─── View Toggle ───────────────────────────────────────────────────────────

  DoApplicable() {
    if (this.viewType === 'details') {
      this.isBenefitsView = false;
      if (!this._util.IsPremier(this.selectedCust))
        this.displayedColumns = [
          'index', 'proJ_NM', 'description', 'identifieD_DATE', 'status',
          'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach', 'comments', 'edit', 'delete',
        ];
      else
        this.displayedColumns = [
          'index', 'portfoliO_NM', 'proJ_NM', 'description', 'identifieD_DATE', 'status',
          'targeT_DATE', 'actuaL_DATE', 'responsible', 'approach', 'comments', 'edit', 'delete',
        ];
    } else if (this.viewType === 'benefits') {
      this.isBenefitsView = true;
      if (!this._util.IsPremier(this.selectedCust))
        this.displayedColumns = [
          'index', 'proJ_NM', 'description', 'identifieD_DATE', 'status',
          'qualitY_REDUCTION_OF_ERRORS', 'reductioN_IN_LEAD_TIME_DATA', 'reductioN_IN_CYCLE_TIME_DATA',
          'savinG_PER_YEAR_EFFORT', 'automatioN_INDEX', 'savingS_IN_USD', 'harD_BENEFITS',
          'customeR_BUSINESS_VALUE', 'revenue', 'operatinG_COST', 'profitability', 'edit', 'delete',
        ];
      else
        this.displayedColumns = [
          'index', 'portfoliO_NM', 'proJ_NM', 'description', 'identifieD_DATE', 'status',
          'qualitY_REDUCTION_OF_ERRORS', 'reductioN_IN_LEAD_TIME_DATA', 'reductioN_IN_CYCLE_TIME_DATA',
          'savinG_PER_YEAR_EFFORT', 'automatioN_INDEX', 'savingS_IN_USD', 'harD_BENEFITS',
          'customeR_BUSINESS_VALUE', 'revenue', 'operatinG_COST', 'profitability', 'edit', 'delete',
        ];
    }
    this.RefreshTable(this.ideasdata);
  }

  // ─── Filter ────────────────────────────────────────────────────────────────

  showFilteredRows() {
    this.filterData(
      this._shared.savedportfolioId,
      this.selectedProject,
      this.AllChecked,
      this.PastDueChecked,
      this.DueClosureChecked
    );
  }

  Project_OnClick() {
    this.filterData(this.selectedPortfolio, this.selectedProject, true, false, false);
  }

  Portfolio_OnClick() {
    if (this.selectedPortfolio !== 'All Portfolios') {
      this.projects = this.ideasdata
        .filter((x: any) => x.portfoliO_NM === this.selectedPortfolio)
        .map((x: any) => x.proJ_NM)
        .filter((x: any, i: number, a: any[]) => a.indexOf(x) === i)
        .sort();
      this.projects.unshift('All Projects');
    } else {
      this.projects = (this.ideasdata.map((x: any) => x.proJ_NM) as string[])
        .filter((x, i, a) => a.indexOf(x) === i)
        .sort();
      this.projects.unshift('All Projects');
    }
    this.filterData(this.selectedPortfolio, this.selectedProject, true, false, false);
  }

  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }

  Filter_onChange($event: any) {
    this.filterCriteria = $event.criteria;
    this.filterData(this.selectedPortfolio, this.selectedProject, true, false, false);
  }

  uncheckOthers() {
    this.PastDueChecked = false;
    this.DueClosureChecked = false;
  }

  projectSelected($event: any) {
    this.filterData(this.selectedPortfolio, Array.of(this.selectedProject), true, false, false);
  }

  filterData(
    portfolioId: any,
    projectId: any,
    allchecked: any,
    pastDue: any,
    dueforClosure: any
  ) {
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.ideasdata);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (this._shared.selectedProjects != null && this._shared.selectedProjects.length > 0) {
      this.filteredData = this.filteredData.filter(
        (x: any) => this._shared.selectedProjects.indexOf(x.projecT_ID) >= 0
      );
    }

    if (allchecked) {
      // show all
    } else {
      this.filteredData = this.filteredData.filter((x: any) => x.status !== 'Completed');
      if (pastDue && dueforClosure) {
        // show both
      } else if (!pastDue && !dueforClosure) {
        this.filteredData = [];
      } else if (pastDue) {
        this.filteredData = this.filteredData.filter(
          (x: any) => new Date(x.targeT_DATE) <= currentDate
        );
      } else if (dueforClosure) {
        this.filteredData = this.filteredData.filter(
          (x: any) => new Date(x.targeT_DATE) > currentDate
        );
      }
    }
    this.RefreshTable(this.filteredData);
  }

  // ─── Data Load ─────────────────────────────────────────────────────────────

  getAllIdeasDetails() {
    this._appservice.getIdeasDetails(this.selectedCust, this.allproj).subscribe(
      (data) => {
        this.ideasdata = data.output;
        this.ideasdata.sort((x: any, y: any) => {
          if (x.identifieD_DATE > y.identifieD_DATE) return -1;
          if (x.identifieD_DATE < y.identifieD_DATE) return 1;
          return 0;
        });
        this.projNames = data.projects;

        if (this.showIdea) {
          this.idea = this.ideasdata.filter((x: any) => x.id == this.ideasid);
          this.EditRow_onClick(this.idea[0]);
        }
      },
      (error) => {
        this.showToast('Something went wrong', 'error', 4000);
      },
      () => {
        this.filter_projectPortfolio(this.ideasdata);

        if (this._shared.savedportfolioId != 0) {
          this.ideasdata = this.ideasdata.filter(
            (x: any) => x.portfoliO_ID == this._shared.savedportfolioId
          );
          this.ideasdata.sort((x: any, y: any) => {
            if (x.identifieD_DATE > y.identifieD_DATE) return -1;
            if (x.identifieD_DATE < y.identifieD_DATE) return 1;
            return 0;
          });
        }

        if (this._shared.savedportfolioId != 0 && this.ideasdata.length > 0)
          this.selectedPortfolio = this.ideasdata[0].portfoliO_NM;
        else this.selectedPortfolio = 'All Portfolios';

        this.filterData(this.selectedPortfolio, this.selectedProject, true, false, false);
      }
    );
  }

  filter_projectPortfolio(input: any[]) {
    this.projects = (input.map((x) => x.proJ_NM) as string[])
      .filter((x, i, a) => a.indexOf(x) === i)
      .sort();
    this.portfolio = (input.map((x) => x.portfoliO_NM) as string[])
      .filter((x, i, a) => a.indexOf(x) === i)
      .sort();
    if (!this.portfolio.includes('All Portfolios')) this.portfolio.unshift('All Portfolios');
    if (!this.projects.includes('All Projects')) this.projects.unshift('All Projects');
  }

  getPortfolioName() {
    this._appservice.getPortfolioName(this.EditInnovation.projecT_ID).subscribe((data) => {
      this.EditInnovation.portfoliO_NM = data;
    });
  }

  // ─── Edit Actions ──────────────────────────────────────────────────────────

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.getProcessAreaData();
    this.filteredIdeas = [];
    this.getGavsServices();
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditInnovation();
    this.EditInnovation.gavS_SERVICE = [];
    this.getAllIdeasDetails();
  }

  getProcessAreaData() {
    this._appservice
      .getProcessArea(this.input_projectid)
      .subscribe(
        (data) => { this.processArea = data; },
        (error) => {
          this._util.serviceError(error);
          this.showToast('Something went wrong', 'error', 4000);
        }
      );
  }

  GetFilteredIdeas(event: any) {
    this._appservice.getIdeasFromProcessArea(event).subscribe(
      (data) => {
        this.filteredIdeas = data;
        this.dataSource2 = new MatTableDataSource<InnovationModelExt>(this.filteredIdeas);
      },
      (error) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    );
  }

  getGavsServices() {
    this._appservice.getGavsServices().subscribe(
      (data) => {
        this.gavsServices = data;
        this.gavsServices.forEach((element: any, index: number) => {
          this.EditInnovation.gavS_SERVICE.push(new GAVSService());
          this.EditInnovation.gavS_SERVICE[index].servicE_ID = element.servicE_ID;
        });
      },
      (error) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    );
  }

  EditRow_onClick(element: any) {
    if (this.showIdea) this.EditInnovation = element;
    else this.EditInnovation = Object.assign({}, element);

    if (
      this.EditInnovation.status.toLowerCase() === 'completed' ||
      this.EditInnovation.status.toLowerCase() === 'cancelled' ||
      this.EditInnovation.status.toLowerCase() === 'suspended'
    )
      this.disableSave = true;
    else this.disableSave = false;

    if (this.showIdea) this.disableSave = true;

    if (this.EditInnovation.iS_ONETIME == undefined) {
      this.EditInnovation.iS_ONETIME = false;
    }

    if (this.EditInnovation.beforE_CYCLE_TIME_UOM == null)
      this.EditInnovation.beforE_CYCLE_TIME_UOM = 1;
    if (this.EditInnovation.beforE_LEAD_TIME_UOM == null)
      this.EditInnovation.beforE_LEAD_TIME_UOM = 1;
    if (this.EditInnovation.beforE_TIME_TAKEN_UOM == null)
      this.EditInnovation.beforE_TIME_TAKEN_UOM = 1;
    if (this.EditInnovation.afteR_CYCLE_TIME_UOM == null)
      this.EditInnovation.afteR_CYCLE_TIME_UOM = 1;
    if (this.EditInnovation.afteR_LEAD_TIME_UOM == null)
      this.EditInnovation.afteR_LEAD_TIME_UOM = 1;
    if (this.EditInnovation.afteR_TIME_TAKEN_UOM == null)
      this.EditInnovation.afteR_TIME_TAKEN_UOM = 1;

    this.status = this.EditInnovation.status;
    this.GetFilteredIdeas(element.area);
    this.Edit_onClick();
  }

  // ─── Ideas Innovation Matrix ───────────────────────────────────────────────

  showIdeaMatrix() {
    // DialogConfig preserved from legacy
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = { processArea: 'all' };
    dialogConfig.maxWidth = '100%';
    dialogConfig.height = '100%';
    dialogConfig.width = '100vw';
    this.dialog.open(IdeasInnovationMatrixComponent, dialogConfig);
  }

  // ─── RAG ───────────────────────────────────────────────────────────────────

  SaveRAG_onClick(rag: string) {
    if (rag === '' || rag === null) {
      this.showToast('Please select RAG', 'warn');
      return;
    }
    this._util.updateRAG(this.input_rag, 'innovation', rag);
    const ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'innovation',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date()),
    };
    this.service_updateRag(ragdetails);
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  DeleteRow_onClick(element: any): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete the record?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete',
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (!result) return;
      this._appservice.deleteInnovation(element).subscribe(
        (data) => {
          this.showToast('Deleted successfully', 'warn', 3000);
          this.getAllIdeasDetails();
        },
        (error) => {
          this._util.serviceError(error);
          this.errorStr = error.error;
          this.showToast(this.errorStr || 'Something went wrong', 'error', 4000);
          this.errorStr = '';
          this.getAllIdeasDetails();
        }
      );
      this.ideasdata.splice(this.ideasdata.indexOf(element), 1);
      this.ideasdata.sort((a: any, b: any) =>
        a.identifieD_DATE > b.identifieD_DATE
          ? -1
          : a.identifieD_DATE < b.identifieD_DATE
          ? 1
          : 0
      );
      this.filterData(this.selectedPortfolio, this.selectedProject, true, false, false);
    });
  }

  // ─── Use Element (similar ideas) ───────────────────────────────────────────

  Use_Element(element: any) {
    this.EditInnovation.description = element.description;
    this.EditInnovation.referencE_IDEA_ID = element.id;
  }

  // ─── Table ─────────────────────────────────────────────────────────────────

  RefreshTable(input: any) {
    this.dataSource = new MatTableDataSource<any>(input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  SubmitForm(isValid: boolean) {
    if (!isValid) {
      this.showToast('Please enter valid values for required fields', 'warn');
      return;
    }

    const tDate = new Date(this.EditInnovation.targeT_DATE!);
    tDate.setHours(0, 0, 0, 0);
    const iDate = new Date(this.EditInnovation.identifieD_DATE!);
    iDate.setHours(0, 0, 0, 0);

    if (!this.IsDateValid(tDate, iDate)) {
      this.showToast('Please enter valid target and identified dates', 'warn');
      return;
    }

    let adate: any = this.EditInnovation.actuaL_DATE;
    if (this.EditInnovation.actuaL_DATE != null && this.EditInnovation.actuaL_DATE != undefined) {
      adate = new Date(this.EditInnovation.actuaL_DATE);
      adate.setHours(0, 0, 0, 0);
      if (!this.IsCompletionDateValid(adate, iDate)) {
        this.showToast('Please enter valid identified and actual dates', 'warn');
        return;
      }
    }

    let projectName = this.projNames.find(
      (x) => x.proJ_ID == this.EditInnovation.projecT_ID
    );
    if (projectName != undefined && projectName != null)
      this.EditInnovation.proJ_NM = projectName.proJ_NM;

    if (this.EditInnovation.id === 0 || this.EditInnovation.id === undefined) {
      this.EditInnovation.id = 0;
      this.EditInnovation.rag = 'green';
      this.EditInnovation.createD_BY = localStorage.getItem('empid') || '';
      this.EditInnovation.createD_DATE = new Date();
      this.EditInnovation.updateD_BY = localStorage.getItem('empid') || '';
      this.EditInnovation.updateD_DATE = new Date();
      this.service_addInnovation(this.EditInnovation);
      this.readonlymode = true;
      this.editmode = false;
    } else {
      this.EditInnovation.updateD_BY = localStorage.getItem('empid') || '';
      this.EditInnovation.updateD_DATE = new Date();
      this._appservice.updateInnovation(this.EditInnovation).subscribe(
        (data) => {
          this.showToast('Saved successfully', 'success', 3000);
          this.getAllIdeasDetails();
        },
        (error) => {
          this._util.serviceError(error);
          this.errorStr = error.error;
          this.showToast(this.errorStr || 'Something went wrong', 'error', 4000);
          this.errorStr = '';
        }
      );
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditInnovation();
  }

  IsCompletionDateValid(completionDate: Date, identifiedDate: Date) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (completionDate != null && completionDate != undefined) {
      if (
        completionDate >= identifiedDate &&
        completionDate <= currentDate &&
        identifiedDate <= currentDate
      )
        return true;
      else return false;
    } else return true;
  }

  IsDateValid(targetDate: Date, identifiedDate: Date) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (targetDate >= identifiedDate && identifiedDate <= currentDate) return true;
    else return false;
  }

  // ─── Service Methods ───────────────────────────────────────────────────────

  service_updateRag(ragdetails: any) {
    this._appservice.updateRags(ragdetails).subscribe(
      () => {},
      (error) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error', 4000);
      }
    );
  }

  service_addInnovation(innovation: any) {
    this._appservice.addInnovation(innovation).subscribe(
      (data) => {
        this.ideasdata.push(JSON.parse(JSON.stringify(data)));
        this.ideasdata.sort((a: any, b: any) =>
          a.identifieD_DATE > b.identifieD_DATE
            ? -1
            : a.identifieD_DATE < b.identifieD_DATE
            ? 1
            : 0
        );
        this.showToast('Saved successfully', 'success', 3000);
        this.filterData(this.selectedPortfolio, this.selectedProject, true, false, false);
      },
      (error) => {
        this._util.serviceError(error);
        this.errorStr = error._body || error.error || '';
        this.showToast(this.errorStr || 'Something went wrong', 'error', 4000);
        this.errorStr = '';
      }
    );
  }

  // ─── New Innovation ────────────────────────────────────────────────────────

  newEditInnovation() {
    this.EditInnovation = new InnovationModelExt();
  }

  // ─── Effort / Cost Calculations (preserved verbatim from legacy) ───────────

  setBeforeEffort() {
    if (
      this.EditInnovation.beforE_CASES_COUNT == undefined ||
      this.EditInnovation.beforE_CASES_COUNT == null
    ) { this.EditInnovation.beforE_EFFORT = ''; return; }
    if (
      this.EditInnovation.beforE_TIME_TAKEN == undefined ||
      this.EditInnovation.beforE_TIME_TAKEN == null
    ) { this.EditInnovation.beforE_EFFORT = ''; return; }

    let totalMins: number;
    if (this.EditInnovation.beforE_TIME_TAKEN_UOM == 1) {
      this.EditInnovation.beforE_EFFORT = (
        (parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
          parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString())) / 60
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString());
    } else if (this.EditInnovation.beforE_TIME_TAKEN_UOM == 2) {
      this.EditInnovation.beforE_EFFORT = (
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString())
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()) * 60;
    } else {
      this.EditInnovation.beforE_EFFORT = (
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()) * 8
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_CASES_COUNT.toString()) * 8 * 60;
    }
    return this.processCycleTime(totalMins);
  }

  setBeforeEffortPerYear() {
    if (
      this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined ||
      this.EditInnovation.beforE_OCCOURANCE_COUNT == null
    ) { this.beforE_EFFORT_YEAR = ''; return; }
    if (
      this.EditInnovation.beforE_TIME_TAKEN == undefined ||
      this.EditInnovation.beforE_TIME_TAKEN == null
    ) { this.beforE_EFFORT_YEAR = ''; return; }

    let totalMins: number;
    if (this.EditInnovation.beforE_TIME_TAKEN_UOM == 1) {
      this.beforE_EFFORT_YEAR = (
        (parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
          parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString())) / 60
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        this.EditInnovation.beforE_OCCOURANCE_COUNT;
    } else if (this.EditInnovation.beforE_TIME_TAKEN_UOM == 2) {
      this.beforE_EFFORT_YEAR = (
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString())
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * 60 *
        this.EditInnovation.beforE_OCCOURANCE_COUNT;
    } else {
      this.beforE_EFFORT_YEAR = (
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.beforE_OCCOURANCE_COUNT.toString()) * 8
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.beforE_TIME_TAKEN.toString()) * 8 * 60 *
        this.EditInnovation.beforE_OCCOURANCE_COUNT;
    }
    return this.processCycleTime(totalMins);
  }

  setAfterEffortPerYear() {
    if (
      this.EditInnovation.afteR_OCCOURANCE_COUNT == undefined ||
      this.EditInnovation.afteR_OCCOURANCE_COUNT == null
    ) { this.afteR_EFFORT_YEAR = ''; return; }
    if (
      this.EditInnovation.afteR_TIME_TAKEN == undefined ||
      this.EditInnovation.afteR_TIME_TAKEN == null
    ) { this.afteR_EFFORT_YEAR = ''; return; }

    let totalMins: number;
    if (this.EditInnovation.afteR_TIME_TAKEN_UOM == 1) {
      this.afteR_EFFORT_YEAR = (
        (parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
          parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString())) / 60
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        this.EditInnovation.afteR_OCCOURANCE_COUNT;
    } else if (this.EditInnovation.afteR_TIME_TAKEN_UOM == 2) {
      this.afteR_EFFORT_YEAR = (
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString())
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * 60 *
        this.EditInnovation.afteR_OCCOURANCE_COUNT;
    } else {
      this.afteR_EFFORT_YEAR = (
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_OCCOURANCE_COUNT.toString()) * 8
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) * 8 * 60 *
        this.EditInnovation.afteR_OCCOURANCE_COUNT;
    }
    return this.processCycleTime(totalMins);
  }

  processCycleTime(value: number) {
    let result = '0';
    let temph: number;
    let tempm: number;
    if (value < 0) value = value * -1;
    if (value >= 0 && value < 60) {
      result = value + ' min(s)';
    } else if (value >= 60 && value < 480) {
      temph = Math.floor(value / 60);
      result = temph + ' hr(s) ';
      tempm = value % 60;
      if (tempm > 0) result = result + tempm + ' mins';
    } else if (value >= 480) {
      const hour = Math.floor(value / 60);
      temph = Math.floor(hour / 8);
      result = temph + ' day(s) ';
      tempm = hour % 8;
      if (tempm > 0) result = result + tempm + ' hr(s)';
    }
    return result;
  }

  setAfterEffort() {
    if (
      this.EditInnovation.afteR_CASES_COUNT == undefined ||
      this.EditInnovation.afteR_CASES_COUNT == null
    ) { this.EditInnovation.afteR_EFFORT = ''; return; }
    if (
      this.EditInnovation.afteR_TIME_TAKEN == undefined ||
      this.EditInnovation.afteR_TIME_TAKEN == null
    ) { this.EditInnovation.afteR_EFFORT = ''; return; }

    let totalMins: number;
    if (this.EditInnovation.afteR_TIME_TAKEN_UOM == 1) {
      this.EditInnovation.afteR_EFFORT = (
        (parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
          parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString())) / 60
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString());
    } else if (this.EditInnovation.afteR_TIME_TAKEN_UOM == 2) {
      this.EditInnovation.afteR_EFFORT = (
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString())
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString()) * 60;
    } else {
      this.EditInnovation.afteR_EFFORT = (
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString()) * 8
      ).toFixed(2);
      totalMins =
        parseFloat(this.EditInnovation.afteR_TIME_TAKEN.toString()) *
        parseFloat(this.EditInnovation.afteR_CASES_COUNT.toString()) * 8 * 60;
    }
    return this.processCycleTime(totalMins);
  }

  setBeforeCost() {
    if (
      this.EditInnovation.beforE_FTECOST_HOUR == undefined ||
      this.EditInnovation.beforE_FTECOST_HOUR == null
    ) { this.EditInnovation.beforE_COST = ''; return; }
    if (
      this.EditInnovation.beforE_EFFORT == undefined ||
      this.EditInnovation.beforE_EFFORT == null
    ) { this.EditInnovation.beforE_COST = ''; return; }
    this.EditInnovation.beforE_COST = (
      parseFloat(this.EditInnovation.beforE_FTECOST_HOUR.toString()) *
      parseFloat(this.EditInnovation.beforE_EFFORT)
    ).toFixed(2);
    return this.EditInnovation.beforE_COST;
  }

  setBeforeCostPerYear() {
    if (
      this.EditInnovation.beforE_FTECOST_HOUR == undefined ||
      this.EditInnovation.beforE_FTECOST_HOUR == null
    ) { this.beforE_COST_YEAR = ''; return; }
    if (this.beforE_EFFORT_YEAR == undefined || this.beforE_EFFORT_YEAR == null) {
      this.beforE_COST_YEAR = ''; return;
    }
    this.beforE_COST_YEAR = (
      parseFloat(this.EditInnovation.beforE_FTECOST_HOUR.toString()) *
      parseFloat(this.beforE_EFFORT_YEAR)
    ).toFixed(2);
    return this.beforE_COST_YEAR;
  }

  setAfterCostPerYear() {
    if (
      this.EditInnovation.afteR_FTECOST_HOUR == undefined ||
      this.EditInnovation.afteR_FTECOST_HOUR == null
    ) { this.afteR_COST_YEAR = ''; return; }
    if (this.afteR_EFFORT_YEAR == undefined || this.afteR_EFFORT_YEAR == null) {
      this.afteR_COST_YEAR = ''; return;
    }
    this.afteR_COST_YEAR = (
      parseFloat(this.EditInnovation.afteR_FTECOST_HOUR.toString()) *
      parseFloat(this.afteR_EFFORT_YEAR)
    ).toFixed(2);
    return this.afteR_COST_YEAR;
  }

  setAfterCost() {
    if (
      this.EditInnovation.afteR_FTECOST_HOUR == undefined ||
      this.EditInnovation.afteR_FTECOST_HOUR == null
    ) { this.EditInnovation.afteR_COST = ''; return; }
    if (
      this.EditInnovation.afteR_EFFORT == undefined ||
      this.EditInnovation.afteR_EFFORT == null
    ) { this.EditInnovation.afteR_COST = ''; return; }
    this.EditInnovation.afteR_COST = (
      parseFloat(this.EditInnovation.afteR_FTECOST_HOUR.toString()) *
      parseFloat(this.EditInnovation.afteR_EFFORT)
    ).toFixed(2);
    return this.EditInnovation.afteR_COST;
  }

  setBeforeFTESpent() {
    if (
      this.EditInnovation.beforE_FTECOST_MONTH == undefined ||
      this.EditInnovation.beforE_FTECOST_MONTH == null
    ) { this.EditInnovation.beforE_FTESPENT_MONTH = null; return; }
    if (
      this.EditInnovation.beforE_EFFORT == undefined ||
      this.EditInnovation.beforE_EFFORT == null
    ) { this.EditInnovation.beforE_FTESPENT_MONTH = null; return; }
    this.EditInnovation.beforE_FTESPENT_MONTH = +(
      parseFloat(this.EditInnovation.beforE_EFFORT) /
      parseFloat(this.EditInnovation.beforE_FTECOST_MONTH.toString())
    ).toFixed(2);
    return this.EditInnovation.beforE_FTESPENT_MONTH;
  }

  setBeforeFTESpentYear() {
    let beforE_FTESPENT_YEAR = 0;
    if (
      this.EditInnovation.beforE_FTECOST_MONTH == undefined ||
      this.EditInnovation.beforE_FTECOST_MONTH == null
    ) return beforE_FTESPENT_YEAR;
    if (this.beforE_EFFORT_YEAR == undefined || this.beforE_EFFORT_YEAR == null)
      return beforE_FTESPENT_YEAR;
    beforE_FTESPENT_YEAR = +(
      parseFloat(this.beforE_EFFORT_YEAR) /
      parseFloat(this.EditInnovation.beforE_FTECOST_MONTH.toString())
    ).toFixed(2);
    return beforE_FTESPENT_YEAR;
  }

  setAfterFTESpentYear() {
    let afteR_FTESPENT_YEAR = 0;
    if (
      this.EditInnovation.afteR_FTECOST_MONTH == undefined ||
      this.EditInnovation.afteR_FTECOST_MONTH == null
    ) return afteR_FTESPENT_YEAR;
    if (this.afteR_EFFORT_YEAR == undefined || this.afteR_EFFORT_YEAR == null)
      return afteR_FTESPENT_YEAR;
    afteR_FTESPENT_YEAR = +(
      parseFloat(this.afteR_EFFORT_YEAR) /
      parseFloat(this.EditInnovation.afteR_FTECOST_MONTH.toString())
    ).toFixed(2);
    return afteR_FTESPENT_YEAR;
  }

  setAfterFTESpent() {
    if (
      this.EditInnovation.afteR_FTECOST_MONTH == undefined ||
      this.EditInnovation.afteR_FTECOST_MONTH == null
    ) { this.EditInnovation.afteR_FTESPENT_MONTH = null; return; }
    if (
      this.EditInnovation.afteR_EFFORT == undefined ||
      this.EditInnovation.afteR_EFFORT == null
    ) { this.EditInnovation.afteR_FTECOST_MONTH = null; return; }
    this.EditInnovation.afteR_FTESPENT_MONTH = +(
      parseFloat(this.EditInnovation.afteR_EFFORT) /
      parseFloat(this.EditInnovation.afteR_FTECOST_MONTH.toString())
    ).toFixed(2);
    return this.EditInnovation.afteR_FTESPENT_MONTH;
  }

  getinteralsavingsperyear() {
    if (this.EditInnovation.beforE_COST == undefined || this.EditInnovation.beforE_COST == null) return;
    if (this.EditInnovation.afteR_COST == undefined || this.EditInnovation.afteR_COST == null) return;
    if (this.EditInnovation.beforE_OCCOURANCE_COUNT == undefined || this.EditInnovation.beforE_OCCOURANCE_COUNT == null) return;
    if (this.EditInnovation.afteR_OCCOURANCE_COUNT == undefined || this.EditInnovation.afteR_OCCOURANCE_COUNT == null) return;
    this.EditInnovation.internaL_SAVINGS = (
      parseFloat(this.beforE_COST_YEAR) - parseFloat(this.afteR_COST_YEAR)
    ).toFixed(2);
    return Math.abs(parseFloat(this.EditInnovation.internaL_SAVINGS));
  }

  getinteralsavingsperyearonetime() {
    if (this.EditInnovation.beforE_COST == undefined || this.EditInnovation.beforE_COST == null) return;
    if (this.EditInnovation.afteR_COST == undefined || this.EditInnovation.afteR_COST == null) return;
    this.EditInnovation.internaL_SAVINGS = (
      parseFloat(this.EditInnovation.beforE_COST) - parseFloat(this.EditInnovation.afteR_COST)
    ).toFixed(2);
    return Math.abs(parseFloat(this.EditInnovation.internaL_SAVINGS));
  }

  getpersonhoursperyear() {
    if (this.beforE_EFFORT_YEAR == undefined || this.beforE_EFFORT_YEAR == null) return;
    if (this.afteR_EFFORT_YEAR == undefined || this.afteR_EFFORT_YEAR == null) return;
    this.EditInnovation.customeR_PERSONHOUR_SAVINGS =
      parseFloat(this.beforE_EFFORT_YEAR) - parseFloat(this.afteR_EFFORT_YEAR);
    return Math.abs(this.EditInnovation.customeR_PERSONHOUR_SAVINGS!);
  }

  getpersonhoursperyearonetime() {
    if (this.EditInnovation.beforE_EFFORT == undefined || this.EditInnovation.beforE_EFFORT == null) return;
    if (this.EditInnovation.afteR_EFFORT == undefined || this.EditInnovation.afteR_EFFORT == null) return;
    this.EditInnovation.customeR_PERSONHOUR_SAVINGS = parseFloat(
      (parseFloat(this.EditInnovation.beforE_EFFORT) - parseFloat(this.EditInnovation.afteR_EFFORT)).toFixed(2)
    );
    return Math.abs(this.EditInnovation.customeR_PERSONHOUR_SAVINGS!);
  }
}
