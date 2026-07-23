import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActionitemModelNew } from '../../../shared/models/action-items.model';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-risk-action-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './risk-action-items.component.html',
  styleUrls: ['./risk-action-items.component.scss']
})
export class RiskActionItemsComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<RiskActionItemsComponent>);
  private _appservice = inject(AppsService);
  _util = inject(UtilityService);

  EditActionitem: ActionitemModelNew = new ActionitemModelNew();
  projectName: string = '';
  projectId: string = '';
  riskId: number = 0;
  selectedCust: string = '';
  isEditMode: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    if (this.data) {
      this.projectName = this.data.ProjectName || '';
      this.projectId = this.data.ProjectId || '';
      this.selectedCust = this.data.CustomerId || '';

      if (this.data.Flag === 'add') {
        this.riskId = this.data.RiskId || 0;
        this.isEditMode = false;
        this.newEditActionitem();
      } else {
        this.isEditMode = true;
        this.EditActionitem = { ...this.data.ActionItem };
      }
    }
  }

  SubmitForm(isValid: boolean): void {
    if (!isValid) {
      alert('Please enter valid values for required fields');
      return;
    }

    const tDate = new Date(this.EditActionitem.targeT_DATE!);
    tDate.setHours(0, 0, 0, 0);

    const iDate = new Date(this.EditActionitem.identifieD_DATE!);
    iDate.setHours(0, 0, 0, 0);

    let cDate: Date | null = null;
    if (this.EditActionitem.completioN_DATE) {
      cDate = new Date(this.EditActionitem.completioN_DATE);
      cDate.setHours(0, 0, 0, 0);
    }

    if (!this.IsDateValid(tDate, iDate)) {
      alert('Please enter valid target and identified dates');
      return;
    }

    if (cDate && !this.IsCompletionDateValid(cDate, iDate)) {
      alert('Please enter valid identified and completion dates');
      return;
    }

    if (this.EditActionitem.id === 0 || this.EditActionitem.id === undefined) {
      // Add mode
      this.EditActionitem.cusT_ID = this.selectedCust;
      this.EditActionitem.proJ_ID = this.projectId;
      this.EditActionitem.rag = 'green';
      this.EditActionitem.createD_BY = localStorage.getItem('empid') || '';
      this.EditActionitem.createD_DATE = new Date();
      this.EditActionitem.updateD_BY = localStorage.getItem('empid') || '';
      this.EditActionitem.updateD_DATE = new Date();
      this.EditActionitem.risk_id = this.riskId;

      this._appservice.addActionitem(this.EditActionitem).subscribe({
        next: (data) => {
          alert('Added Successfully');
          this.dialogRef.close({ success: true, data: data });
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
    } else {
      // Update mode
      this.EditActionitem.updateD_BY = localStorage.getItem('empid') || '';
      this.EditActionitem.updateD_DATE = new Date();

      this._appservice.updateActionitemforRisk(this.EditActionitem).subscribe({
        next: (data) => {
          alert('Updated Successfully');
          this.dialogRef.close({ success: true, data: data });
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
    }
  }

  IsCompletionDateValid(completionDate: Date, identifiedDate: Date): boolean {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (completionDate >= identifiedDate && completionDate <= currentDate && identifiedDate <= currentDate) {
      return true;
    }
    return false;
  }

  IsDateValid(targetDate: Date, identifiedDate: Date): boolean {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (targetDate >= identifiedDate && identifiedDate <= currentDate) {
      return true;
    }
    return false;
  }

  newEditActionitem(): void {
    this.EditActionitem = new ActionitemModelNew();
  }

  Cancel_onClick(): void {
    this.dialogRef.close();
  }
}
