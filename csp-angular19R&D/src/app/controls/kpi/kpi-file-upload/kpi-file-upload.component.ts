import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MyUtility } from '../../../shared/my-utility';
import { environment } from '../../../../environments/environment';

/**
 * KPI File Upload Component
 * Migrated from Angular 6 to Angular 19
 * 
 * Allows users to upload KPI files in .xlsx or .xlsm format
 * 
 * Features:
 * - File upload with validation (type, size)
 * - Progress indicator during upload
 * - Upload status messages
 * - Supports .xlsx and .xlsm file formats only
 * - Maximum file size: 4 MB
 * 
 * Migration Changes:
 * - Updated to Angular 19 inject() pattern
 * - Replaced deprecated @angular/http with HttpClient
 * - Updated RxJS imports and operators
 * - Modernized as standalone component
 * - Preserved all business logic and validation rules
 * - Maintained exact functionality from legacy version
 */
@Component({
  selector: 'app-kpi-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './kpi-file-upload.component.html',
  styleUrls: ['./kpi-file-upload.component.scss']
})
export class KpiFileUploadComponent implements OnInit {
  // Dependency injection using modern inject() function
  private dialog = inject(MatDialogRef<KpiFileUploadComponent>);
  private _util = inject(MyUtility);
  private _http = inject(HttpClient);

  // Component properties
  _loading: boolean = false;
  message: any[] = [];

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
   * Handle Save button click - validates and uploads file
   * @param fileName - File input element with selected file
   */
  Save_onClick(fileName: HTMLInputElement): void {
    if (this.validateSave(fileName)) {
      this.service_AddFile(fileName);
      this._loading = true;
    }
  }

  /**
   * Validate the selected file
   * @param fileName - File input element
   * @returns boolean - true if valid, false otherwise
   */
  validateSave(fileName: HTMLInputElement): boolean {
    let isValid = false;
    let fileType = [
      "application/vnd.ms-excel.sheet.macroenabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (fileName.files === null || fileName.files.length === 0) {
      this._util.showWarning("Please select a valid file to upload");
      return false;
    }
    else if (!fileType.includes(fileName.files[0].type)) {
      this._util.showWarning("Please upload only .xlsm or .xlsx file.");
      return false;
    }
    else if (fileName.files[0].size > 4194304) { // 4 MB in Bytes
      this._util.showWarning("Please upload file with size less than 4 MB.");
      return false;
    }
    else {
      return true;
    }
  }

  /**
   * Upload file to server
   * @param fileName - File input element containing the file to upload
   */
  service_AddFile(fileName: HTMLInputElement): void {
    let apiuri: string = environment.webapiuri + 'UploadKPIFile';
    let fileList: FileList | null = fileName.files;

    if (fileList && fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);

      // Create headers with authentication
      let headers = new HttpHeaders()
        .set('empId', localStorage.getItem('empid') || '')
        .set('token', this._util.AppSettings.token);

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
}
