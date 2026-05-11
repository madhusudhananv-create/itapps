import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-project-status',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatTabsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './project-status.component.html',
  styleUrls: ['./project-status.component.scss']
})
export class ProjectStatusComponent implements OnInit {
  projectForeCast: any;
  customerName: string = '';

  constructor(
    private dialogRef: MatDialogRef<ProjectStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data != null) {
      this.projectForeCast = this.data.projectStatus;
      this.customerName = this.data.custName;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
