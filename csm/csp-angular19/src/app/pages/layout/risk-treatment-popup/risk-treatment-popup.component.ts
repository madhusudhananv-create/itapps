import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AppsService } from '../../../services/apps.service';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-risk-treatment-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './risk-treatment-popup.component.html',
  styleUrls: ['./risk-treatment-popup.component.scss']
})
export class RiskTreatmentPopupComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<RiskTreatmentPopupComponent>);
  private _appservice = inject(AppsService);
  _util = inject(UtilityService);

  data: any[] = [];
  isLoading: boolean = true;
  riskTreatmentStrategy: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any) {}

  ngOnInit(): void {
    if (this.dialogData && this.dialogData.element) {
      this.riskTreatmentStrategy = this.dialogData.element.risK_TREATMENT_STRATEGY || '';
      this.getActionItems(this.dialogData.element.projecT_ID, this.dialogData.element.id);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getActionItems(projectId: string, riskId: number): void {
    this.isLoading = true;
    this._appservice.getActionItemsforRisk(projectId, riskId).subscribe({
      next: (data) => {
        this.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        this._util.serviceError(error);
        this.isLoading = false;
      }
    });
  }
}
