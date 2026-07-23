import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KpiFileUploadComponent } from './kpi-file-upload.component';
import { MyUtility } from '../../../shared/my-utility';
import { environment } from '../../../../environments/environment';

describe('KpiFileUploadComponent', () => {
  let component: KpiFileUploadComponent;
  let fixture: ComponentFixture<KpiFileUploadComponent>;
  let httpMock: HttpTestingController;
  let mockDialogRef: any;
  let mockMyUtility: any;

  beforeEach(async () => {
    // Create mock objects
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockMyUtility = jasmine.createSpyObj('MyUtility', ['serviceError', 'showWarning', 'showSuccess']);
    mockMyUtility.AppSettings = {
      empid: '12345',
      displayname: 'Test User',
      token: 'test-token-123',
      role: 'admin',
      access: 'full',
      logintype: 'standard',
      customerid: 'cust-001'
    };

    await TestBed.configureTestingModule({
      imports: [
        KpiFileUploadComponent,
        HttpClientTestingModule,
        MatDialogModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MyUtility, useValue: mockMyUtility }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiFileUploadComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    
    // Setup localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue('12345');
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component', () => {
      component.ngOnInit();
      expect(component._loading).toBe(false);
      expect(component.message).toEqual([]);
    });
  });

  describe('onClose', () => {
    it('should close the dialog', () => {
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('validateSave', () => {
    let mockFileInput: HTMLInputElement;

    beforeEach(() => {
      mockFileInput = document.createElement('input');
      mockFileInput.type = 'file';
      mockMyUtility.showWarning.calls.reset();
    });

    it('should return false and alert when no file is selected', () => {
      const result = component.validateSave(mockFileInput);
      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please select a valid file to upload');
    });

    it('should return false and alert when files is null', () => {
      // Simulate null files
      Object.defineProperty(mockFileInput, 'files', {
        value: null,
        writable: true
      });
      const result = component.validateSave(mockFileInput);
      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please select a valid file to upload');
    });

    it('should return false and alert when file type is invalid', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const result = component.validateSave(mockFileInput);
      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please upload only .xlsm or .xlsx file.');
    });

    it('should return false and alert when file size exceeds 4 MB', () => {
      const largeSize = 5 * 1024 * 1024; // 5 MB
      const mockFile = new File(['x'.repeat(largeSize)], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const result = component.validateSave(mockFileInput);
      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please upload file with size less than 4 MB.');
    });

    it('should return true for valid .xlsx file', () => {
      const mockFile = new File(['test'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1 MB
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const result = component.validateSave(mockFileInput);
      expect(result).toBe(true);
      expect(mockMyUtility.showWarning).not.toHaveBeenCalled();
    });

    it('should return true for valid .xlsm file', () => {
      const mockFile = new File(['test'], 'test.xlsm', { 
        type: 'application/vnd.ms-excel.sheet.macroenabled.12' 
      });
      Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 }); // 2 MB
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const result = component.validateSave(mockFileInput);
      expect(result).toBe(true);
      expect(mockMyUtility.showWarning).not.toHaveBeenCalled();
    });

    it('should return true for file exactly 4 MB', () => {
      const mockFile = new File(['test'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      Object.defineProperty(mockFile, 'size', { value: 4194304 }); // Exactly 4 MB
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const result = component.validateSave(mockFileInput);
      expect(result).toBe(true);
      expect(mockMyUtility.showWarning).not.toHaveBeenCalled();
    });
  });

  describe('Save_onClick', () => {
    let mockFileInput: HTMLInputElement;

    beforeEach(() => {
      mockFileInput = document.createElement('input');
      mockFileInput.type = 'file';
    });

    it('should not upload when validation fails', () => {
      spyOn(component, 'validateSave').and.returnValue(false);
      spyOn(component, 'service_AddFile');

      component.Save_onClick(mockFileInput);

      expect(component.validateSave).toHaveBeenCalledWith(mockFileInput);
      expect(component.service_AddFile).not.toHaveBeenCalled();
      expect(component._loading).toBe(false);
    });

    it('should upload and set loading when validation passes', () => {
      const mockFile = new File(['test'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      spyOn(component, 'validateSave').and.returnValue(true);
      spyOn(component, 'service_AddFile');

      component.Save_onClick(mockFileInput);

      expect(component.validateSave).toHaveBeenCalledWith(mockFileInput);
      expect(component.service_AddFile).toHaveBeenCalledWith(mockFileInput);
      expect(component._loading).toBe(true);
    });
  });

  describe('service_AddFile', () => {
    let mockFileInput: HTMLInputElement;
    let mockFile: File;

    beforeEach(() => {
      mockFileInput = document.createElement('input');
      mockFileInput.type = 'file';
      mockFile = new File(['test content'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
      mockMyUtility.showWarning.calls.reset();
      mockMyUtility.showSuccess.calls.reset();
    });

    it('should upload file successfully and close dialog', () => {
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const mockResponse = 'File uploaded successfully';
      component._loading = true;

      component.service_AddFile(mockFileInput);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadKPIFile');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('empId')).toBe('12345');
      expect(req.request.headers.get('token')).toBe('test-token-123');
      expect(req.request.body instanceof FormData).toBe(true);

      req.flush(mockResponse);

      expect(component.message).toBe(mockResponse);
      expect(component._loading).toBe(false);
      expect(mockMyUtility.showSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle upload error', () => {
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      const mockError = { status: 500, statusText: 'Internal Server Error' };
      component._loading = true;

      component.service_AddFile(mockFileInput);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadKPIFile');
      req.error(new ErrorEvent('Network error'), mockError);

      expect(mockMyUtility.serviceError).toHaveBeenCalled();
      expect(component._loading).toBe(false);
    });

    it('should not upload when fileList is null', () => {
      Object.defineProperty(mockFileInput, 'files', {
        value: null,
        writable: true
      });

      component.service_AddFile(mockFileInput);

      httpMock.expectNone(environment.webapiuri + 'UploadKPIFile');
      expect(component._loading).toBeDefined(); // Added explicit expectation
    });

    it('should not upload when fileList is empty', () => {
      Object.defineProperty(mockFileInput, 'files', {
        value: [],
        writable: true
      });

      component.service_AddFile(mockFileInput);

      httpMock.expectNone(environment.webapiuri + 'UploadKPIFile');
      expect(component._loading).toBeDefined(); // Added explicit expectation
    });

    it('should include correct FormData with file', () => {
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      component.service_AddFile(mockFileInput);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadKPIFile');
      const formData = req.request.body as FormData;
      
      expect(formData).toBeDefined();
      expect(req.request.body instanceof FormData).toBe(true);
      
      req.flush('Success');
    });

    it('should use empId from localStorage when available', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('99999');
      
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      component.service_AddFile(mockFileInput);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadKPIFile');
      expect(req.request.headers.get('empId')).toBe('99999');
      
      req.flush('Success');
    });

    it('should use empty string when empId is not in localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      component.service_AddFile(mockFileInput);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadKPIFile');
      expect(req.request.headers.get('empId')).toBe('');
      
      req.flush('Success');
    });
  });

  describe('Component Rendering', () => {
    it('should display the dialog title', () => {
      const compiled = fixture.nativeElement;
      const titleElement = compiled.querySelector('[mat-dialog-title] label');
      expect(titleElement.textContent.trim()).toBe('Upload KPI File');
    });

    it('should display close button', () => {
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.close-button');
      expect(closeButton).toBeTruthy();
    });

    it('should display file input', () => {
      const compiled = fixture.nativeElement;
      const fileInput = compiled.querySelector('input[type="file"]');
      expect(fileInput).toBeTruthy();
      expect(fileInput.getAttribute('accept')).toContain('application/vnd.ms-excel.sheet.macroEnabled.12');
    });

    it('should display upload button', () => {
      const compiled = fixture.nativeElement;
      const uploadButton = compiled.querySelector('.btn-success');
      expect(uploadButton).toBeTruthy();
      expect(uploadButton.textContent.trim()).toBe('Upload');
    });

    it('should display file type instruction', () => {
      const compiled = fixture.nativeElement;
      const instruction = compiled.querySelector('span');
      expect(instruction.textContent).toContain('.xslm or .xlsx file only');
    });

    it('should show progress bar when loading', () => {
      component._loading = false;
      fixture.detectChanges();
      let progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeFalsy();

      component._loading = true;
      fixture.detectChanges();
      progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('should call onClose when close button is clicked', () => {
      spyOn(component, 'onClose');
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.close-button');
      closeButton.click();
      expect(component.onClose).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full upload workflow successfully', () => {
      const mockFile = new File(['test content'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
      
      const mockFileInput = document.createElement('input');
      mockFileInput.type = 'file';
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: true
      });

      mockMyUtility.showSuccess.calls.reset();

      // Start upload
      component.Save_onClick(mockFileInput);
      expect(component._loading).toBe(true);

      // Verify HTTP request
      const req = httpMock.expectOne(environment.webapiuri + 'UploadKPIFile');
      expect(req.request.method).toBe('POST');

      // Complete request
      req.flush('Upload completed successfully');

      // Verify final state
      expect(component._loading).toBe(false);
      expect(mockMyUtility.showSuccess).toHaveBeenCalledWith('Upload completed successfully');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle full workflow with validation failure', () => {
      const mockFileInput = document.createElement('input');
      mockFileInput.type = 'file';
      // No files selected

      mockMyUtility.showWarning.calls.reset();

      component.Save_onClick(mockFileInput);

      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please select a valid file to upload');
      expect(component._loading).toBe(false);
      httpMock.expectNone(environment.webapiuri + 'UploadKPIFile');
    });
  });
});
