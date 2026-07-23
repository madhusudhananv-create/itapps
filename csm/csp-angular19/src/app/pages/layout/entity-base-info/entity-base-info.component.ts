import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppsService } from '../../../core/services/apps.service';

@Component({
  selector: 'app-entity-base-info',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './entity-base-info.component.html',
  styleUrls: ['./entity-base-info.component.scss']
})
export class EntityBaseInfoComponent implements OnInit {
  response: any;
  header: string = '';
  project: string = '';
  loading: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EntityBaseInfoComponent>,
    private appService: AppsService
  ) {}

  ngOnInit() {
    this.header = this.data.header;
    this.project = this.data.project;
    this.getEntityGeneralInfo();
  }

  closeInfo() {
    this.dialogRef.close();
  }

  getEntityGeneralInfo() {
    this.loading = true;
    this.appService.getEntityGeneralInfo(this.data.entity, this.data.entityType).subscribe({
      next: (data) => {
        this.response = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching entity info:', err);
        this.loading = false;
      }
    });
  }
}
