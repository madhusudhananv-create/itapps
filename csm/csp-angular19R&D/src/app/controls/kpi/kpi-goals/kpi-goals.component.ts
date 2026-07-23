import { Component, OnInit, OnChanges, OnDestroy, AfterViewInit, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { KpiSharedService } from '../kpi-shared.service';

export class KpiGoalModel {
  id: number = 0;
  description: string = '';
  starT_DATE: Date = new Date();
  enD_DATE: Date = new Date();
  displaY_ORDER: number = 1;
  isinternal: boolean = false;
  customeR_ID: string = '';
  projecT_ID: string = '';
  createD_BY: string = '';
  createD_DATE: Date = new Date();
  updateD_BY: string = '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
  isExpired: boolean = false;
}

@Component({
  selector: 'app-kpi-goals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './kpi-goals.component.html',
  styleUrls: ['./kpi-goals.component.scss']
})
export class KpiGoalsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input('custId') custId: string = '';
  @Input('projId') projId: string = '';

  errorStr: string = '';

  private previousProjId: string = '';
  private previousCustId: string = '';
  private initialized = false;

  private loadTrigger$ = new Subject<{ custId: string; projId: string }>();
  private destroy$ = new Subject<void>();

  displayedColumns = ['index', 'description', 'displaY_ORDER', 'starT_DATE', 'enD_DATE', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild('paginator2') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('goalForm') goalFormRef!: NgForm;

  private _kpiService = inject(KpiSharedService);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);

  constructor() {}

  get goals(): KpiGoalModel[] {
    return this._kpiService.goals as KpiGoalModel[] || [];
  }

  set goals(val: KpiGoalModel[]) {
    this._kpiService.goals = val || [];
  }

  get goal(): KpiGoalModel {
    return this._kpiService.goal as KpiGoalModel;
  }

  set goal(val: KpiGoalModel) {
    this._kpiService.goal = val;
  }

  ngOnInit(): void {
    this.loadTrigger$.pipe(
      switchMap(({ custId, projId }) => {
        if (!projId) return of([]);
        return this._appservice.GetKpiGoals(custId, projId);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        if (!this.projId) {
          this.goals = [];
          this.dataSource.data = [];
          return;
        }
        this.goals = data || [];
        this.SetSelectedGoal();
        this.setGoalExpiry(this.goals);
        this.dataSource.data = [...this.goals];
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.goals = [];
        this.dataSource.data = [];
      }
    });

    this.previousProjId = this.projId;
    this.previousCustId = this.custId;
    this.initialized = true;

    if (this.projId) {
      this.triggerLoad();
    }
  }

  ngOnChanges(): void {
    if (!this.initialized) {
      this.previousProjId = this.projId;
      this.previousCustId = this.custId;
      return;
    }

    if (this.projId !== this.previousProjId || this.custId !== this.previousCustId) {
      this.previousProjId = this.projId;
      this.previousCustId = this.custId;
      this.goal = new KpiGoalModel();

      if (this.projId) {
        this.triggerLoad();
      } else {
        this.goals = [];
        this.dataSource.data = [];
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private triggerLoad(): void {
    this.loadTrigger$.next({ custId: this.custId, projId: this.projId });
  }

  // ─── KEY FIX ────────────────────────────────────────────────────────────────
  // The legacy code did `this.goal = row` and it worked because in the old
  // Angular Material the datepicker accepted string dates via ngModel and
  // coerced them internally.  In the upgraded Material the datepicker control
  // validates that its value is a *Date object*; a string value causes the
  // control to be invalid even though it displays correctly.
  //
  // The fix is the same direct assignment as the legacy, but we also coerce
  // both date fields to real Date objects BEFORE Angular runs change-detection
  // so the datepicker control sees a valid Date and marks itself valid.
  //
  // We do NOT clone, do NOT resetForm(), do NOT use setTimeout —
  // all three of those approaches interfere with ngModel's binding cycle.
  // ────────────────────────────────────────────────────────────────────────────
  EditRow_onClick(row: KpiGoalModel): void {
    // Simple direct assignment — works because the edit/delete buttons now have
    // type="button" in the template, so clicking them no longer submits the form.
    // Previously, buttons inside <form> without type="button" defaulted to
    // type="submit", firing ngSubmit with empty data BEFORE EditRow_onClick ran,
    // which set form.submitted=true and locked the controls — causing form.valid=false.
    this.goal = row;

    // Coerce date strings to Date objects — new Material datepicker requires
    // instanceof Date; strings from the API make the control report invalid.
    if (!(this.goal.starT_DATE instanceof Date) || isNaN(this.goal.starT_DATE.getTime())) {
      this.goal.starT_DATE = new Date(row.starT_DATE);
    }
    if (!(this.goal.enD_DATE instanceof Date) || isNaN(this.goal.enD_DATE.getTime())) {
      this.goal.enD_DATE = new Date(row.enD_DATE);
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  SubmitForm_Goal(form: any): void {
    if (!form.valid) {
      this._util.showWarning('Please enter required fields');
      return;
    }

    if (this.CheckIfAlreadyExist()) {
      this._util.showWarning('KPI Goal already exists');
      return;
    }

    if (this.goal.id === 0 || this.goal.id === undefined) {
      let dbGoal = this._util.CopyObject(this.goal);
      dbGoal.id = 0;
      if (this.goal.displaY_ORDER == undefined || this.goal.displaY_ORDER == null)
        this.goal.displaY_ORDER = 1;
      dbGoal.starT_DATE = this._util.setLocaleDate(this.goal.starT_DATE);
      dbGoal.enD_DATE = this._util.setLocaleDate(this.goal.enD_DATE);
      dbGoal.customeR_ID = this.custId;
      dbGoal.projecT_ID = this.projId;
      dbGoal.createD_BY = localStorage.getItem('empid') || '';
      dbGoal.createD_DATE = new Date();
      dbGoal.updateD_BY = localStorage.getItem('empid') || '';
      dbGoal.updateD_DATE = new Date();
      dbGoal.isactive = true;
      this.service_addKpiGoal(dbGoal);
      this.goal = new KpiGoalModel();
      // Clear submitted so next Edit does not start with a locked form
      if (this.goalFormRef) this.goalFormRef.resetForm();
    } else {
      let dbGoal = this._util.CopyObject(this.goal);
      dbGoal.starT_DATE = this._util.setLocaleDate(this.goal.starT_DATE);
      dbGoal.enD_DATE = this._util.setLocaleDate(this.goal.enD_DATE);
      dbGoal.updateD_BY = localStorage.getItem('empid') || '';
      dbGoal.updateD_DATE = new Date();
      this.service_updateKpiGoal(dbGoal);
      this.goal = new KpiGoalModel();
      // Clear submitted so next Edit does not start with a locked form
      if (this.goalFormRef) this.goalFormRef.resetForm();
    }
  }

  DeleteRow_onClick(row: KpiGoalModel): void {
    this._util.showDeleteConfirmation(
      'Are you sure you want to delete this goal? This action cannot be undone.',
      'Confirm Delete Goal'
    ).subscribe((result: boolean) => {
      if (result) {
        this.service_deleteKpiGoal(row);
      }
    });
  }

  RefreshTable(): void {
    this.dataSource.data = [...(this.goals || [])];
  }

  CheckIfAlreadyExist(): boolean {
    let item = null;
    if (this.goal.id === 0 || this.goal.id === undefined) {
      item = this.goals.filter(x =>
        x.description.toLowerCase() === this.goal.description.toLowerCase()
      );
    } else {
      item = this.goals.filter(x =>
        x.description.toLowerCase() === this.goal.description.toLowerCase() &&
        x.id !== this.goal.id
      );
    }
    return item.length > 0;
  }

  setGoalExpiry(goals: KpiGoalModel[]): void {
    if (!goals || goals.length === 0) return;

    const currentDate = new Date();
    goals.forEach(goal => {
      goal.isExpired = new Date(goal.enD_DATE) < currentDate;
    });

    goals.sort((a, b) => {
      if (!a.isExpired && b.isExpired) return -1;
      if (a.isExpired && !b.isExpired) return 1;
      return 0;
    });
  }

  SetSelectedGoal(): void {
    if (this.goals.length > 0) {
      this._kpiService.selectedGoal = this.goals[0];
    }
  }

  formreset(goalForm: any): void {
    this.goal = new KpiGoalModel();
    if (this.projId) this.triggerLoad();
    goalForm.submitted = false;
  }

  service_addKpiGoal(_goal: KpiGoalModel): void {
    if (!_goal.projecT_ID) {
      this._util.showWarning('Select Project to add KPI goal');
      return;
    }
    this._appservice.AddKpiGoal(_goal).subscribe({
      next: (data: any) => {
        this.goals.push(data);
        this.setGoalExpiry(this.goals);
        this.dataSource.data = [...this.goals];
        this._util.showSuccess('Added Successfully');
      },
      error: (error: any) => {
        if (error.status === 409) this._util.showError(error.error);
        this._util.serviceError(error);
      }
    });
  }

  service_updateKpiGoal(_goal: KpiGoalModel): void {
    this._appservice.UpdateKpiGoal(_goal).subscribe({
      next: (data: any) => {
        const index = this.goals.findIndex(g => g.id === _goal.id);
        if (index !== -1) {
          this.goals[index] = data || _goal;
        }
        this.setGoalExpiry(this.goals);
        this.dataSource.data = [...this.goals];
        this._util.showSuccess('Updated Successfully');
      },
      error: (error: any) => {
        if (error.status === 409) this._util.showError(error.error);
        this._util.serviceError(error);
      }
    });
  }

  service_deleteKpiGoal(row: KpiGoalModel): void {
    this._appservice.DeleteKpiGoal(row).subscribe({
      next: (data: any) => {
        this.goals.splice(this.goals.indexOf(row), 1);
        this.dataSource.data = [...this.goals];
        this._util.showSuccess('Deleted Successfully');
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.errorStr = error.error;
        this._util.showError(this.errorStr);
        this.errorStr = '';
      }
    });
  }
}