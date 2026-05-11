import { Component, Inject, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MyUtility } from '../../../shared/my-utility';
import { environment } from '../../../../environments/environment';

/**
 * External KPI Data Upload Component
 * Migrated from Angular 6 to Angular 19
 * UI/UX: Apple-Inspired Modern Design
 * 
 * Features:
 * - Glassmorphism UI with backdrop blur
 * - Smooth animations and transitions
 * - Drag & drop file upload
 * - Source selection (FreshWorks, ZIF)
 * - File validation (type, size)
 * - Progress indicator
 * - Toast notifications
 * - Maximum file size: 16 MB
 */
@Component({
  selector: 'app-external-kpi-data-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSelectModule
  ],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }))
      ])
    ]),
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './external-kpi-data-upload.component.html',
  styleUrl: './external-kpi-data-upload.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ExternalKpiDataUploadComponent implements OnInit {
  // Dependency injection using modern inject() function
  private dialog = inject(MatDialogRef<ExternalKpiDataUploadComponent>);
  private _util = inject(MyUtility);
  private _http = inject(HttpClient);

  // Component properties
  custId: string;
  _loading: boolean = false;
  selSource: string = "";
  message: any[] = [];
  file: File | null = null;
  isDragOver: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.custId = data.custId;
  }

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Close the dialog
   */
  onClose(): void {
    this.dialog.close();
  }

  /**
   * Handle source selection change
   */
  onSourceChange(): void {
    // Reset file when source changes
    this.file = null;
  }

  /**
   * Handle file input change event
   */
  onFileChange(event: Event, fileInput: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Handle file drop event
   */
  onDrop(event: DragEvent, fileInput: HTMLInputElement): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      
      // Validate file type based on source
      const isValid = this.validateDroppedFile(droppedFile);
      if (isValid) {
        this.file = droppedFile;
        
        // Create a DataTransfer object to set the files on the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInput.files = dataTransfer.files;
      }
    }
  }

  /**
   * Validate dropped file
   */
  validateDroppedFile(file: File): boolean {
    // Check file type
    if (this.selSource === 'zif') {
      if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        this._util.showWarning('Please drop a JSON file only');
        return false;
      }
    } else if (this.selSource === 'freshworks') {
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        this._util.showWarning('Please drop a CSV file only');
        return false;
      }
    }

    // Check file size (16 MB)
    if (file.size > 16777216) {
      this._util.showWarning('Please drop a file smaller than 16 MB');
      return false;
    }

    return true;
  }

  /**
   * Remove selected file
   */
  removeFile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.file = null;
  }

  /**
   * Get formatted file size
   */
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Upload file to server
   */
  service_AddFile(): void {
    // Validate file exists
    if (!this.file) {
      this._util.showWarning('Please select a file to upload');
      return;
    }

    // Validate source
    if (!this.selSource) {
      this._util.showWarning('Please select a data source');
      return;
    }

    // Validate file type
    if (this.selSource === 'zif') {
      if (!this.file.type.includes('json') && !this.file.name.endsWith('.json')) {
        this._util.showWarning('Please upload a JSON file only');
        return;
      }
    } else if (this.selSource === 'freshworks') {
      if (!this.file.type.includes('csv') && !this.file.name.endsWith('.csv')) {
        this._util.showWarning('Please upload a CSV file only');
        return;
      }
    }

    // Validate file size (16 MB)
    if (this.file.size > 16777216) {
      this._util.showWarning('Please upload a file smaller than 16 MB');
      return;
    }

    // Start upload
    this._loading = true;
    let apiuri: string = environment.webapiuri + 'UploadExternalKPIData';
    let formData: FormData = new FormData();
    formData.append('UploadKPIData', this.file, this.file.name);

    // Create headers with authentication and metadata
    let headers = new HttpHeaders()
      .set('empId', localStorage.getItem('empid') || '')
      .set('token', this._util.AppSettings.token)
      .set('customerId', this.custId)
      .set('source', this.selSource)
      .set('fileType', 'data');

    // Upload file
    this._http.post(apiuri, formData, { headers: headers })
      .pipe(
        map((res: any) => res),
        catchError(error => {
          this._util.serviceError(error);
          this._loading = false;
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.message = data;
          this._loading = false;
          const successMessage = typeof this.message === 'string' ? this.message : 'Upload successful';
          this._util.showSuccess(successMessage);
          this.onClose();
        },
        error: (error) => {
          this._util.serviceError(error);
          this._loading = false;
        }
      });
  }
}
