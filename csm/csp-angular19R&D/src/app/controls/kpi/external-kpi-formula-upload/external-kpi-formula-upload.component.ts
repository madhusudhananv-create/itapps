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
 * External KPI Formula Upload Component
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
  selector: 'app-external-kpi-formula-upload',
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
  templateUrl: './external-kpi-formula-upload.component.html',
  styleUrl: './external-kpi-formula-upload.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ExternalKpiFormulaUploadComponent implements OnInit {
  // Dependency injection using modern inject() function
  private dialog = inject(MatDialogRef<ExternalKpiFormulaUploadComponent>);
  private _util = inject(MyUtility);
  private _http = inject(HttpClient);

  // Component properties
  custId: string;
  _loading: boolean = false;
  selSource: string = "";
  message: any[] = [];
  
  // Modern UI properties for drag & drop
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
   * Handle source change - reset file selection
   */
  onSourceChange(): void {
    this.file = null;
  }

  /**
   * Handle file input change
   */
  onFileChange(event: Event, fileInput: HTMLInputElement): void {
    const files = fileInput.files;
    if (files && files.length > 0) {
      this.file = files[0];
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

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      
      // Validate the dropped file
      if (this.validateDroppedFile(droppedFile)) {
        this.file = droppedFile;
        
        // Update the file input (optional, for form consistency)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInput.files = dataTransfer.files;
      }
    }
  }

  /**
   * Validate dropped file based on source type
   */
  validateDroppedFile(file: File): boolean {
    const maxSize = 16 * 1024 * 1024; // 16 MB
    
    // Check file size
    if (file.size > maxSize) {
      this._util.showWarning('File size exceeds 16 MB limit');
      return false;
    }

    // Check file type based on source
    if (this.selSource === 'freshworks') {
      if (!file.name.endsWith('.csv')) {
        this._util.showWarning('Please select a CSV file');
        return false;
      }
    } else if (this.selSource === 'zif') {
      if (!file.name.endsWith('.json')) {
        this._util.showWarning('Please select a JSON file');
        return false;
      }
    }

    return true;
  }

  /**
   * Remove selected file
   */
  removeFile(event: Event): void {
    event.stopPropagation();
    this.file = null;
  }

  /**
   * Format file size for display
   */
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Handle Save button click - validates and uploads file
   * Now uses the file property instead of HTMLInputElement
   */
  service_AddFile(): void {
    // Validate file existence
    if (!this.file) {
      this._util.showWarning('Please select a file to upload');
      return;
    }

    // Validate source selection
    if (!this.selSource) {
      this._util.showWarning('Please select a data source');
      return;
    }

    // Validate file type
    const fileType = this.file.name.split('.').pop()?.toLowerCase();
    if (this.selSource === 'freshworks' && fileType !== 'csv') {
      this._util.showWarning('Please select a CSV file for FreshWorks');
      return;
    }
    if (this.selSource === 'zif' && fileType !== 'json') {
      this._util.showWarning('Please select a JSON file for ZIF');
      return;
    }

    // Validate file size (max 16 MB)
    const maxSize = 16 * 1024 * 1024;
    if (this.file.size > maxSize) {
      this._util.showWarning('File size exceeds 16 MB limit');
      return;
    }

    // Prepare upload
    this._loading = true;
    let apiuri: string = environment.webapiuri + 'UploadExternalKPIFormulas';
    let formData: FormData = new FormData();
    formData.append('UploadKPIData', this.file, this.file.name);

    // Create headers with authentication and metadata
    let headers = new HttpHeaders()
      .set('empId', localStorage.getItem('empid') || '')
      .set('token', this._util.AppSettings.token)
      .set('customerId', this.custId)
      .set('source', this.selSource)
      .set('fileType', 'formula');

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
