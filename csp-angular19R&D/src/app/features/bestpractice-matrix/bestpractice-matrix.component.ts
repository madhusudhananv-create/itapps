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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { ProjectsModel } from '../../models/projects-model';

@Component({
  selector: 'app-bestpractice-matrix',
  templateUrl: './bestpractice-matrix.component.html',
  styleUrls: ['./bestpractice-matrix.component.scss'],
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
    MatProgressBarModule,
    MatSnackBarModule
  ],
  providers: [provideNativeDateAdapter()]
})
export class BestpracticeMatrixComponent implements OnInit {
  private _appservice = inject(AppsService);
  public _util = inject(MyUtility);
  private dialogRef = inject(MatDialogRef<BestpracticeMatrixComponent>);
  private _snackBar = inject(MatSnackBar);

  input_processarea: string = 'All';
  input_servicearea: string = 'All';
  input_deptId: number = 4;
  displayedColumns: string[] = ['position'];
  matrixdata: any[] = [];
  itVertical: number = 0;
  projData: ProjectsModel[] = [];
  proj: ProjectsModel | undefined;
  startDate: Date = new Date();
  minValue: Date | undefined;
  maxValue: Date | undefined;
  _loading: boolean = false;
  endDate: Date = new Date();
  p: number = 1;
  legend: boolean = false;
  statusChange: string = '';
  ddstatus: string = 'All';
  ddProcessArea: string[] = [];
  ddServiceArea: string[] = [];
  lstStatus: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public matData: any) {
    // Initialize from dialog data
    if (matData) {
      if (matData.processArea === "all" && matData.dept_id === undefined) {
        this.input_processarea = "All";
        this.input_deptId = 4;
      } else if (matData.processArea === "All" && matData.dept_id !== undefined) {
        this.input_processarea = "All";
        this.input_deptId = matData.dept_id;
      }
      
      if (matData.serviceArea === "all" && matData.dept_id === undefined) {
        this.input_servicearea = "All";
        this.input_deptId = 4;
      } else if (matData.serviceArea === "All" && matData.dept_id !== undefined) {
        this.input_servicearea = "All";
        this.input_deptId = matData.dept_id;
      }
      
      if (matData.status !== undefined) {
        this.ddstatus = matData.status;
      }
    }
  }

  ngOnInit() {
    this.getOrder();
    this.getDate();
    this.getAllProjName();
    this.getProcessArea();
    this.getServiceArea();
    this.getBPStatus();
  }

  getDate() {
    const b: Date = new Date();
    const m: number = b.getMonth();
    const y: number = b.getFullYear();
    
    if (m === 3 || m === 4 || m === 5) {
      const date: string = y.toString() + '-' + "04" + "-01";
      this.startDate = new Date(date);
    } else if (m === 6 || m === 7 || m === 8) {
      const date: string = y.toString() + '-' + "07" + "-01";
      this.startDate = new Date(date);
    } else if (m === 9 || m === 10 || m === 11) {
      const date: string = y.toString() + '-' + "10" + "-01";
      this.startDate = new Date(date);
    } else if (m === 0 || m === 1 || m === 2) {
      const date: string = y.toString() + '-' + "01" + "-01";
      this.startDate = new Date(date);
    }
  }

  getOrder() {
    if (this.input_deptId === 3)
      this.itVertical = 1;
    else
      this.itVertical = 0;
  }

  getBPStatus() {
    this._appservice.GetParametersByType('BP_STATUS').subscribe({
      next: (data: any) => {
        this.lstStatus = data.map((t: any) => t.options);
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  getProcessArea() {
    if (this.input_deptId === 3) {
      this._appservice.GetParametersByType('BP_PROCESS_AREA_ADM').subscribe({
        next: (data: any) => {
          this.ddProcessArea = data.map((t: any) => t.options);
          this.ddProcessArea.unshift("All");
        },
        error: (error: any) => {
          this._util.serviceError(error);
        }
      });
    } else {
      this._appservice.GetParametersByType('BP_PROCESS_AREA_IMS').subscribe({
        next: (data: any) => {
          this.ddProcessArea = data.map((t: any) => t.options);
          this.ddProcessArea.unshift("All");
        },
        error: (error: any) => {
          this._util.serviceError(error);
        }
      });
    }
  }

  getServiceArea() {
    if (this.input_deptId === 3) {
      this._appservice.GetParametersByType('BP_SERVICE_AREA_ADM').subscribe({
        next: (data: any) => {
          this.ddServiceArea = data.map((t: any) => t.options);
          this.ddServiceArea.unshift("All");
        },
        error: (error: any) => {
          this._util.serviceError(error);
        }
      });
    } else {
      this._appservice.GetParametersByType('BP_SERVICE_AREA_IMS').subscribe({
        next: (data: any) => {
          this.ddServiceArea = data.map((t: any) => t.options);
          this.ddServiceArea.unshift("All");
        },
        error: (error: any) => {
          this._util.serviceError(error);
        }
      });
    }
  }

  getBestPracticeMatrix() {
    if (this.input_deptId !== undefined) {
      this._loading = true;
      this._appservice.getBestPracticeMatrix(
        this.ddstatus,
        this.input_servicearea,
        this.input_processarea,
        this.input_deptId,
        new Date(this.startDate).toDateString(),
        new Date(this.endDate).toDateString()
      ).subscribe({
        next: (data: any) => {
          this._loading = false;
          this.matrixdata = data;
        },
        error: (error: any) => {
          this._loading = false;
          this._util.serviceError(error);
        }
      });
    }
  }

  enablestatus() {
    this.legend = true;
  }

  disablestatus() {
    this.legend = false;
  }

  getAllProjName() {
    this._appservice.getAllProjectsName().subscribe({
      next: (data: any) => {
        this.projData = data;
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }

  statusCheck(): boolean {
    if (this._util.IsEditable() && this.matrixdata.length !== 0)
      return true;
    else 
      return false;
  }

  selectedTab(event: any) {
    if (event.index === 1)
      this.input_deptId = 3;
    else
      this.input_deptId = 4;
    
    this.getBestPracticeMatrix();
    this.getProcessArea();
    this.getServiceArea();
    this.input_processarea = "All";
  }

  GetColor(status: string): string {
    if (status === "Not Implemented")
      return "#ffcccc";
    else if (status === "Planned")
      return "#feeb84";
    else if (status === "Started")
      return "#bff2ff";
    else if (status === "Completed")
      return "#bfffbf";
    else if (status === "Cancelled/Rejected")
      return "#dddddd";
    else if (status === "Not Applicable")
      return "#9e9e9e";
    else
      return "#ffffff";
  }

  GetProjName(projId: string): string {
    this.proj = this.projData.filter(t => t.proJ_ID === projId)[0];
    return this.proj ? this.proj.proJ_NM : '';
  }

  CancelOnClick() {
    this.dialogRef.close();
  }

  OnChange(bp: any, mat: any, event: any) {
    if (event.checked === true) {
      mat.selected = true;
    } else if (event.checked === false) {
      mat.selected = false;
    }
  }

  SaveStatus(matrixdata: any) {
    if (this.statusChange === undefined || this.statusChange === '') {
      this.showToast('Please select any one of three options to apply', 'warn');
      return;
    }
    this._appservice.addBestPracticesByMattrix(matrixdata, this.statusChange).subscribe({
      next: (data: any) => {
        this.showToast('Saved successfully', 'success');
        this.getOrder();
        this.getBestPracticeMatrix();
        this.getAllProjName();
      },
      error: (error: any) => {
        this._util.serviceError(error);
        this.showToast('Something went wrong', 'error');
      }
    });
  }

  // Toast notification helper (bottom-center position)
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
}
