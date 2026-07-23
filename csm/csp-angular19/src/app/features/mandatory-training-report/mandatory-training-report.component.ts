/**
 * MandatoryTrainingReportComponent — Mandatory Training Compliance Report
 * Migrated from LEGACY-SOURCE/src/app/pages/layout/mandatory-training-report/
 *
 * Features (100% coverage):
 * - Date range filter (Start / End)
 * - Multi-select project dropdown
 * - "Get Details" triggers service_dispSPResult → GetMandatoryTrainingDetails
 * - Material table with sort + paginator (15 columns)
 * - Export to Excel via MyUtility.exportToExcel()
 * - Role-based allproj flag (BUHeadIMS / PMO / Quality)
 * - Route param support: /:custid and /:custid/:projid/:year/:month
 * - Toast via MatSnackBar (replaces alert())
 * - No confirm() usage in legacy (none to replace)
 *
 * Migration Notes:
 * - Converted to Angular 19 standalone component
 * - inject() DI pattern used throughout
 * - All method names, logic, and field names preserved exactly
 * - Http (legacy) replaced with HttpClient via AppsService
 */

import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

// App-level
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { LayoutService } from '../layout/layout.service';
import { enumRoles } from '../../shared/enum';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

// Models
import { MandatoryReportModel } from '../../models/mandatory-report.model';
import { ReportsSPParamsModel } from '../../models/report-model';
import { ProjectsModel } from '../../models/projects-model';

class Params {
  starDate: Date = new Date();
  endDate: Date = new Date();
  custId: string = '0';
  projId: string[] = [];
}

@Component({
  selector: 'app-mandatory-training-report',
  templateUrl: './mandatory-training-report.component.html',
  styleUrls: ['./mandatory-training-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    NavbarNewComponent,
  ],
  providers: [provideNativeDateAdapter()],
})
export class MandatoryTrainingReportComponent implements OnInit {

  // ─── DI ─────────────────────────────────────────────────────────────────────
  private _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  private route = inject(ActivatedRoute);
  public _layoutService = inject(LayoutService);
  private _snackBar = inject(MatSnackBar);

  // ─── ViewChild ───────────────────────────────────────────────────────────────
  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ─── State (all field names preserved from legacy) ───────────────────────────
  paramData: ReportsSPParamsModel[] = [];
  dataSource!: MatTableDataSource<MandatoryReportModel>;

  displayedColumnsTab: string[] = [
    'index',
    'proj_nm',
    'emp_name',
    'allocation_End_Date',
    'quality_spoc',
    'fundamentals_of_Quality_Certification',
    'hipaA_Internal_Compliance_Certification',
    'information_Security_Awareness_Certification',
    'ohsaS_Internal_Certification',
    'pcI_DSS_Compliance_Certification',
    'gdpR_Certification',
    'secure_Coding_OWASP_Certification',
    'infrastructure_Overview_Certification',
    'general_Compliance_and_Combating_Certification',
    'continual_Improvement_Awareness_Certification',
  ];

  finalData: MandatoryReportModel[] = [];

  input_customerid: string = '';
  allproj: boolean = false;
  projNames: ProjectsModel[] = [];
  input_projectid: string[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  showTable: boolean = false;
  showGetDetails: boolean = false;
  _loading: boolean = false;
  generateResults: boolean = false;
  date = new Date();

  financeYearStart: number = new Date().getFullYear();
  params: Params = { starDate: new Date(), endDate: new Date(), custId: '0', projId: [] };

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.showGetDetails = false;
    this.showTable = false;

    const role = localStorage.getItem('role');
    if (
      role === enumRoles.BUHeadIMS.toString() ||
      role === enumRoles.PMO.toString() ||
      role === enumRoles.Quality.toString()
    ) {
      this.allproj = true;
    }

    this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.route.params.subscribe(params => {
      if (params['projid'] != null) {
        this.input_projectid.push(params['projid']);
      }
    });

    let month = '';
    this.route.params.subscribe(params => {
      if (params['month'] != null) {
        month = params['month'];
      }
    });

    let year = this._util.Year();
    this.route.params.subscribe(params => {
      if (params['year'] != null) {
        year = +params['year'];
      }
    });

    if (this.date.getMonth() <= 2) {
      this.financeYearStart = this.date.getFullYear() - 1;
    } else {
      this.financeYearStart = this.date.getFullYear();
    }

    if (month !== '') {
      this.startDate = new Date(year, this._util.getMonthNum(month), 1);
      this.generateResults = true;
    } else {
      this.startDate = new Date(`${this.financeYearStart}-04-01`);
    }

    this.endDate = new Date();

    this.getAllProjectsFromCustomer();
  }

  ngOnchanges(): void {
    // preserved from legacy (empty)
  }

  // ─── Methods (all preserved from legacy) ────────────────────────────────────

  bindData(): void {
    if (this.startDate > this.endDate) {
      this.showToast('Please select end date greater than start date', 'warn');
      return;
    }
    this.showTable = false;
    this.showGetDetails = false;
    this._loading = true;

    if (this.input_projectid == null) {
      this.input_projectid = [];
    }

    this.params.starDate = new Date(this.startDate);
    this.params.endDate = new Date(this.endDate);
    this.params.custId = this.input_customerid;
    this.params.projId = this.input_projectid;

    this.service_dispSPResult(this.params);
  }

  service_dispSPResult(outparams: Params): void {
    this.finalData = [];

    this._appservice.GetMandatoryTrainingDetails(
      outparams.starDate.toLocaleDateString(),
      outparams.endDate.toLocaleDateString(),
      outparams.custId,
      outparams.projId
    ).subscribe({
      next: (data: any) => {
        this.finalData = data;
        this.dataSource = new MatTableDataSource(this.finalData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.showTable = true;
        this.showGetDetails = true;
        this._loading = false;
      },
      error: (error: any) => {
        this.showGetDetails = true;
        this._loading = false;
        this._util.serviceError(error);
        this.showToast('Something went wrong while fetching data', 'error');
      }
    });
  }

  ExportTOExcel(): void {
    const getdate = new Date();
    const fileName = 'Report_' + getdate.toLocaleString();
    this._util.exportToExcel(this.table.nativeElement, fileName);
  }

  getAllProjectsFromCustomer(): void {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe({
      next: (data: any) => {
        this.projNames = data;
        this.showGetDetails = true;
        this._loading = false;
        if (this.generateResults) {
          this.bindData();
        }
      },
      error: (error: any) => {
        this.showGetDetails = true;
        this._loading = false;
        this._util.serviceError(error);
        this.showToast('Something went wrong while loading projects', 'error');
      }
    });
  }

  service_getAllparamsbyId(): void {
    this._appservice.getSpParams(14).subscribe({
      next: (data: any) => {
        this.paramData = data;
        this.paramData.forEach((x: any) => {
          if (x.paraM_NAME === 'CustomerId') {
            x.paraM_VALUE = null;
          }
        });
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  onProjectChange(): void {
    // preserved from legacy (empty)
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────
  private showToast(message: string, type: 'success' | 'warn' | 'error', duration?: number): void {
    const dur = duration ?? (type === 'error' ? 4000 : 3000);
    this._snackBar.open(message, '✕', {
      duration: dur,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`],
    });
  }
}
