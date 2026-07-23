import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-risk-statement-guideline',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './risk-statement-guideline.component.html',
  styleUrls: ['./risk-statement-guideline.component.scss']
})
export class RiskStatementGuidelineComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RiskStatementGuidelineComponent>
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
