import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BvdEntryService } from '../services/bvd-entry.service';
import { MyUtility } from '../../../shared/my-utility';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { IdeaStatus } from '../../../models/bvd-entry/idea-model';

@Component({
  selector: 'app-implementation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,
    DatePipe
  ],
  templateUrl: './implementation.component.html',
  styleUrl: './implementation.component.scss'
})
export class ImplementationComponent implements OnInit, OnChanges {
  status: IdeaStatus[] = [];
  implementationSchdules: ImplementationPlan[] = [];
  iEditIndex = -1;
  displayedColumns: string[] = ['milestonetask', 'description', 'efforts', 'responsible', 'comments', 'estimatedDate', 'actualstartDate', 'status', 'actions'];
  dataSource: ImplementationPlan[] = [];
  isLoading: boolean = false;
  
  @Input('issubmitted') issubmitted: boolean = false;
  @Input('isapproved') isapproved: boolean = false;
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();
  
  actualstartDate: Date | null = null;
  actualendDate: Date | null = null;
  isComplete: boolean = false;

  constructor(
    public _bvdService: BvdEntryService,
    private _util: MyUtility
  ) {}

  ngOnInit(): void {
    this.getIdeaStatus();
  }

  ngOnChanges(): void {
    
    if (this._bvdService.isIdeaApproved) {
      this.getSchdules(this._bvdService.ideA_ID);
    }
  }

  getIdeaStatus(): void {
    
    this._bvdService.getIdeaStatus().subscribe({
      next: (data: IdeaStatus[]) => {
        this.status = data.filter(x => x.stagE_ID == 5);
      },
      error: (err) => {
        console.error('Error loading idea status:', err);
        this._util.serviceError(err);
      }
    });
  }

  getSchdules(idea: number): void {
    if (!this._bvdService.ideA_ID || this._bvdService.ideA_ID == 0) {
      return;
    }

    this.isLoading = true;
    this._bvdService.getImplementationSchdule(idea).subscribe({
      next: (data: ImplementationPlan[]) => {
        
        this.implementationSchdules = data;
        this.implementationSchdules.forEach(x => {
          if (x.ideA_STATUS_ID == 8) {
            x.iscomplete = true;
          }
        });
        
        this.refreshTable(this.implementationSchdules);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.isLoading = false;
        this._util.serviceError(err);
      }
    });
  }

  getstatus(id: number): string {
    let rec = this.status.find(x => x.id == id);
    if (rec != null) {
      return rec.title;
    } else {
      return "";
    }
  }

  UpdateRecord(rec: ImplementationPlan): void {
    
    if (rec.ideA_STATUS_ID == 8) {
      if (this.actualstartDate == null || this.actualendDate == null) {
        this._util.showWarningPopup("Please enter actual start and end date to mark as complete");
        return;
      }
    }
    
    if (this.actualstartDate) {
      rec.actuaL_START_DATE = new Date(this.actualstartDate).toDateString();
    }
    
    if (this.actualendDate) {
      rec.actuaL_END_DATE = new Date(this.actualendDate).toDateString();
    }
    
    this.isLoading = true;
    this._bvdService.updateImplementationSchdule(rec).subscribe({
      next: (data: ImplementationPlan) => {
        this._util.showSuccessPopup('Data updated Successfully');
        
        rec = data;
        if (rec.ideA_STATUS_ID == 8) {
          rec.iscomplete = true;
        }
        
        this.iEditIndex = -1;
        this.actualstartDate = null;
        this.actualendDate = null;
        
        this.getSchdules(this._bvdService.ideA_ID);  // isLoading reset inside
      },
      error: (err) => {
        console.error('Error updating record:', err);
        this.isLoading = false;
        this._util.serviceError(err);
      }
    });
  }

  DeleteRow_onClick(listImplementation: ImplementationPlan): void {
    
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure want to delete',
      'Delete Implementation'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.isLoading = true;
        this._bvdService.deleteImplementationSchdule(listImplementation.id).subscribe({
          next: (data) => {
            this._util.showSuccessPopup("Deleted Successfully");
            
            this.implementationSchdules = this.implementationSchdules.filter(x => x.id != listImplementation.id);
            this.refreshTable(this.implementationSchdules);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error deleting row:', err);
            this.isLoading = false;
            this._util.serviceError(err);
          }
        });
      }
    });
  }

  getFormattedDate(date: any): string | null {
    if (date == null || date == "Invalid Date") {
      return null;
    }

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'dd-MM-yyyy');
  }

  refreshTable(data: ImplementationPlan[]): void {
    this.dataSource = [...data];
  }

  EditRow_onClick(row: ImplementationPlan, id: number): void {
    
    if (row.actuaL_START_DATE != null) {
      this.actualstartDate = new Date(row.actuaL_START_DATE);
    } else {
      this.actualstartDate = null;
    }

    if (row.actuaL_END_DATE != null) {
      this.actualendDate = new Date(row.actuaL_END_DATE);
    } else {
      this.actualendDate = null;
    }

    this.iEditIndex = id;
  }

  setBack(): void {
    this.isLoading = true;
    setTimeout(() => { this.isLoading = false; this.setStep.emit(4); }, 350);
  }

  CancelEdit_onClick(): void {
    this.iEditIndex = -1;
    this.actualstartDate = null;
    this.actualendDate = null;
  }

  getRowCount(): number {
    return this.implementationSchdules.length;
  }
}
