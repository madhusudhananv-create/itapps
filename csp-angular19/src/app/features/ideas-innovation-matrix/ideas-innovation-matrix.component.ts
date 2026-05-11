/**
 * IdeasInnovationMatrixComponent — Ideas & Innovations Matrix Dialog
 * Migrated from LEGACY-SOURCE/src/app/ideas-innovation-matrix/
 *
 * Features (100% coverage):
 * - Filter by date range, category (idea type), and process area
 * - Color-coded legend hover popup (6 status colours)
 * - Tab group: IMS (dept 4) and ADM (dept 3) tabs
 * - Matrix table: innovation rows × status columns (Identified, Planning,
 *   Execution, Completed, Not Applicable, Not Implemented)
 * - Pagination via slice pipe + page tracking (replaces ngx-pagination)
 * - Checkbox selection on "Not Implemented" entries when editable
 * - Radio group to bulk-mark selected items as Planning / Not Applicable
 * - Save and Close actions
 * - Toast notifications via MatSnackBar (replaces bare alert/confirm)
 *
 * Migration Notes:
 * - Converted to Angular 19 standalone component
 * - Uses inject() for all DI except @Inject(MAT_DIALOG_DATA)
 * - All method names, logic, and field names preserved exactly from legacy
 * - ngx-pagination removed; replaced with slice pipe + p/pageSize pagination
 */

import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { ProjectsModel } from '../../models/projects-model';
import { InnovationModel } from '../../models/innovation-model';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

@Component({
  selector: 'app-ideas-innovation-matrix',
  templateUrl: './ideas-innovation-matrix.component.html',
  styleUrls: ['./ideas-innovation-matrix.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSnackBarModule,
    NavbarNewComponent
  ],
  providers: [provideNativeDateAdapter()]
})
export class IdeasInnovationMatrixComponent implements OnInit {

  // ─── DI via inject() ────────────────────────────────────────────────────────
  private _appservice = inject(AppsService);
  public _util = inject(MyUtility);
  private dialogRef = inject(MatDialogRef<IdeasInnovationMatrixComponent>);
  private _snackBar = inject(MatSnackBar);

  // ─── State (all field names preserved from legacy) ──────────────────────────
  matrixdata: any[] = [];
  ddideatype: string[] = [];
  ideasType: string = 'Ideas';
  itVertical: number = 0;
  _loading: boolean = false;
  input_processarea: string = 'All';
  ddProcessArea: string[] = [];
  input_deptId: number = 4;
  statusChange: string = '';
  filteredideasData: InnovationModel[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  projData: ProjectsModel[] = [];
  proj: ProjectsModel | undefined;
  legend: boolean = false;

  // ─── Pagination (replaces ngx-pagination) ───────────────────────────────────
  p: number = 1;
  pageSize: number = 10;

  constructor(@Inject(MAT_DIALOG_DATA) public matData: any) {
    // Initialise deptId / processArea from dialog data (mirrors legacy ngOnInit logic)
    if (matData) {
      if (matData.processArea === 'all' && matData.dept_id === undefined) {
        this.input_processarea = 'All';
        this.input_deptId = 4;
      } else if (matData.processArea === 'all' && matData.dept_id !== undefined) {
        this.input_processarea = 'All';
        this.input_deptId = matData.dept_id;
      }
    }
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.getIdeatype();
    this.getOrder();
    this.getDate();
    this.getAllProjName();
    this.getProcessArea();
  }

  // ─── Date / Order helpers ────────────────────────────────────────────────────

  /** Sets startDate to the beginning of the current fiscal quarter */
  getDate(): void {
    const b: Date = new Date();
    const m: number = b.getMonth();
    const y: number = b.getFullYear();

    if (m === 3 || m === 4 || m === 5) {
      this.startDate = new Date(`${y}-04-01`);
    } else if (m === 6 || m === 7 || m === 8) {
      this.startDate = new Date(`${y}-07-01`);
    } else if (m === 9 || m === 10 || m === 11) {
      this.startDate = new Date(`${y}-10-01`);
    } else {
      // m === 0 || 1 || 2
      this.startDate = new Date(`${y}-01-01`);
    }
  }

  /** Sets the active tab index based on deptId */
  getOrder(): void {
    this.itVertical = this.input_deptId === 3 ? 1 : 0;
  }

  // ─── Legend ──────────────────────────────────────────────────────────────────
  enablestatus(): void  { this.legend = true; }
  disablestatus(): void { this.legend = false; }

  // ─── API calls ───────────────────────────────────────────────────────────────

  /** Fetch matrix data with current filter values */
  getIdeasInnovation(): void {
    this._loading = true;
    this._appservice.getAllIdeasInnovations(
      this.input_processarea,
      this.input_deptId,
      this.startDate,
      this.endDate,
      this.ideasType
    ).subscribe({
      next: (data: any) => {
        this._loading = false;
        this.matrixdata = data;
        this.p = 1; // reset to first page on new data
      },
      error: (error: any) => {
        this._loading = false;
        this._util.serviceError(error);
        this.showToast('Failed to load innovations matrix', 'error');
      }
    });
  }

  /** Fetch all project names for the GetProjName() lookup */
  getAllProjName(): void {
    this._appservice.getAllProjectsName().subscribe({
      next: (data: any) => {
        this.projData = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  /** Fetch idea type dropdown */
  getIdeatype(): void {
    this._appservice.getIdeatype().subscribe({
      next: (data: any) => {
        this.ddideatype = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  /** Fetch process area dropdown (IMS or ADM depending on active tab) */
  getProcessArea(): void {
    if (this.input_deptId === 3) {
      this._appservice.getProcessAreaADM().subscribe({
        next: (data: any) => { this.ddProcessArea = data; },
        error: (error: any) => { this._util.serviceError(error); }
      });
    } else {
      this._appservice.getProcessAreaIMS().subscribe({
        next: (data: any) => { this.ddProcessArea = data; },
        error: (error: any) => { this._util.serviceError(error); }
      });
    }
  }

  // ─── Tab ─────────────────────────────────────────────────────────────────────

  selectedTab(event: any): void {
    this.input_deptId = event.index === 1 ? 3 : 4;
    this.input_processarea = 'All';
    this.getIdeasInnovation();
    this.getProcessArea();
  }

  // ─── Checkbox / status helpers ───────────────────────────────────────────────

  OnChange(bp: any, mat: any, event: any): void {
    mat.selected = event.checked === true;
  }

  /** Returns the hex colour for a given status */
  GetColor(status: string): string {
    switch (status) {
      case 'Not Implemented': return '#f03d3d';
      case 'Planning':        return '#feeb84';
      case 'Execution':       return '#3db1e7';
      case 'Completed':       return '#44c444';
      case 'Identified':      return '#aeafaf';
      case 'Not Applicable':  return '#242323';
      default:                return '#ffffff';
    }
  }

  /** Returns the project name for a given project ID */
  GetProjName(projId: string): string {
    this.proj = this.projData.find(t => t.proJ_ID === projId);
    return this.proj ? this.proj.proJ_NM : '';
  }

  /** True when user is editable and there is at least one row */
  statusCheck(): boolean {
    return this._util.IsEditable() && this.matrixdata.length !== 0;
  }

  // ─── Save / Close ────────────────────────────────────────────────────────────

  SaveStatus(matrixdata: any): void {
    if (!this.statusChange || this.statusChange === '') {
      this.showToast('Please select any one of the options to apply', 'warn');
      return;
    }
    this._appservice.addInnovationsByMattrix(matrixdata, this.statusChange).subscribe({
      next: (_data: any) => {
        this.showToast('Saved successfully', 'success');
        this.getOrder();
        this.getIdeasInnovation();
        this.getAllProjName();
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong while saving', 'error');
      }
    });
  }

  CancelOnClick(): void {
    this.dialogRef.close();
  }

  // ─── Pagination handler ──────────────────────────────────────────────────────

  onPageChange(event: PageEvent): void {
    this.p = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  /** Returns the slice of matrixdata for the current page */
  get pagedData(): any[] {
    const start = (this.p - 1) * this.pageSize;
    return this.matrixdata.slice(start, start + this.pageSize);
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────

  private showToast(message: string, type: 'success' | 'warn' | 'error', duration?: number): void {
    const dur = duration ?? (type === 'error' ? 4000 : 3000);
    this._snackBar.open(message, '✕', {
      duration: dur,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`${type}-snackbar`]
    });
  }
}
