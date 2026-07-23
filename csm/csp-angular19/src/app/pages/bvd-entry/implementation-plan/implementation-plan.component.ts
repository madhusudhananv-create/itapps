import { Component, OnInit, Input, Output, EventEmitter, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BvdEntryService } from '../services/bvd-entry.service';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-implementation-plan',
  templateUrl: './implementation-plan.component.html',
  styleUrls: ['./implementation-plan.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatTableModule,
    MatExpansionModule,
    MatDialogModule
  ]
})
export class ImplementationPlanComponent implements OnInit {
  public _bvdService = inject(BvdEntryService);
  private _appService = inject(AppsService);
  private _util = inject(MyUtility);
  private dialog = inject(MatDialog);

  @Input() projectId: string = '';
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('impForm') impForm!: NgForm;

  status: any[] = [];
  implementationPlan = new ImplementationPlan();
  isSubmitted: boolean = false;
  estStartDate: Date | null = null;
  estEndDate: Date | null = null;
  actStartDate: Date | null = null;
  actEndDate: Date | null = null;
  stages: any[] = [];
  implementationSchdules: ImplementationPlan[] = [];
  dataSource = new MatTableDataSource(this.implementationSchdules);
  displayedColumns: string[] = ['milestonetask', 'description', 'efforts', 'responsible', 'comments', 'estimatedDates', 'actions'];
  _edit: boolean = false;
  scheduleExpanded: boolean = true;

  ngOnInit() {
    
    // Load project resources
    this.getProjectResource();
    
    if (this._bvdService.bvdimplementationschdules && this._bvdService.bvdimplementationschdules.length > 0) {
      this.fillDetails();
    }
  }

  ngOnChanges() {
    this.getProjectResource();
  }

  async fillDetails() {
    try {
      // Note: Using placeholder until proper method is available
      this._bvdService.resources = [];
      this.implementationSchdules = this._bvdService.bvdimplementationschdules;
      this.refreshTable(this.implementationSchdules);
    } catch (error) {
      (this._util as any).showError('There is an error in getting data from server');
      return;
    }
  }

  refreshTable(source: ImplementationPlan[]) {
    this.dataSource = new MatTableDataSource(source);
  }

  getProjectResource() {
    if (!this.projectId || this.projectId == '')
      return;

    const projId = this.projectId || this._bvdService.projecT_ID;
    
    this._appService.getProjectResourceByProjId(projId).subscribe({
      next: (data) => {
        this._bvdService.resources = data;
        if (this._bvdService.resources && this._bvdService.resources.length > 0) {
        }
      },
      error: (err: any) => {
        console.error('Error loading project resources:', err);
        (this._util as any).serviceError(err);
        this._bvdService.resources = [];
      }
    });
  }

  submitForm(status: string) {
    if (!this.implementationSchdules || this.implementationSchdules.length == 0) {
      (this._util as any).showWarning('There are no milestones entered. Please enter one');
      return;
    }

    for (let schdule of this.implementationSchdules) {
      if (!schdule.milestone || schdule.milestone.trim().length == 0 || !schdule.estimateD_EFFORTS || 
          !schdule.responsible || !schdule.estimateD_START_DATE || !schdule.estimateD_TARGET_DATE) {
        (this._util as any).showWarning("Please enter valid values for mandatory fields of all the schedules and save");
        return;
      }
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Submit Idea',
        message: 'On clicking this, Idea will be submitted. You will not be able to edit after. Do you want to submit and send for approval?',
        confirmText: 'Submit',
        cancelText: 'Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitIdea();
      }
    });
  }

  submitIdea() {
    this._bvdService.submitIdea(this._bvdService.ideA_ID).subscribe({
      next: (data) => {
        (this._util as any).showSuccess("Idea submitted successfully");
        this._bvdService.isIdeaSubmitted = true;
        this._bvdService.bvdidea.ideA_STATUS_ID = 2;
        this._bvdService.currentStep = this._bvdService.currentStep + 1;
      },
      error: (err: any) => (this._util as any).serviceError(err)
    });
  }

  ngOnDestroy() {
  }

  updateSchdule() {
    this.saveSchdule();
    this._edit = false;
  }

  cancelUpdate() {
    this._edit = false;
    this.implementationPlan = new ImplementationPlan();
    this.estStartDate = null;
    this.estEndDate = null;
  }

  saveSchdule() {
    if (!this.implementationPlan.milestone || this.implementationPlan.milestone.trim().length == 0) {
      (this._util as any).showWarning("Please enter the milestone");
      return;
    }

    this.implementationPlan.issubmitted = false;
    this.implementationPlan.ideA_ID = this._bvdService.ideA_ID;
    this.implementationPlan.estimateD_START_DATE = this.estStartDate != null ? new Date(this.estStartDate).toDateString() : '';
    this.implementationPlan.estimateD_TARGET_DATE = this.estEndDate != null ? new Date(this.estEndDate).toDateString() : '';
    this.isSubmitted = true;

    this._bvdService.saveIdeaImplementationDetails(this.implementationPlan).subscribe({
      next: (data) => {
        (this._util as any).showSuccess('Implementation Plan Saved successfully');
        this.isSubmitted = false;
        let index = this.implementationSchdules.findIndex(x => x.id == data.id);
        if (index > -1)
          this.implementationSchdules[index] = data;
        else
          this.implementationSchdules.push(data);

        this.refreshTable(this.implementationSchdules);

        this.implementationPlan = new ImplementationPlan();
        this.estEndDate = null;
        this.estStartDate = null;
        this._bvdService.bvdimplementationschdules = this.implementationSchdules;
      },
      error: (err: any) => {
        (this._util as any).serviceError(err);
        this.isSubmitted = false;
      }
    });
  }

  setBack() {
    this.setStep.emit(1);
  }

  setNext() {
    this.getIdeaStages();
  }

  getIdeaStages() {
    this._bvdService.getIdeaStages(this._bvdService.ideA_ID).subscribe({
      next: (data) => {
        this._bvdService.bvdstages = data;
        this.setStep.emit(3);
      },
      error: (err: any) => (this._util as any).serviceError(err)
    });
  }

  editRow(impRec: ImplementationPlan) {
    this._edit = true;
    this.implementationPlan = impRec;
    this.estStartDate = impRec.estimateD_START_DATE != null ? new Date(impRec.estimateD_START_DATE) : null;
    this.estEndDate = impRec.estimateD_TARGET_DATE != null ? new Date(impRec.estimateD_TARGET_DATE) : null;
  }

  deleteRow(impRec: ImplementationPlan) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this implementation task?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSubmitted = true;
        this._bvdService.deleteImplementationSchdule(impRec.id).subscribe({
          next: (data) => {
            (this._util as any).showSuccess('Task deleted successfully');
            this.isSubmitted = false;
            this.implementationSchdules = this.implementationSchdules.filter(x => x.id != impRec.id);
            this.refreshTable(this.implementationSchdules);
          },
          error: (err: any) => {
            (this._util as any).serviceError(err);
            this.isSubmitted = false;
          }
        });
      }
    });
  }
}
