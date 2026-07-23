import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExternalKpiDataUploadComponent } from './external-kpi-data-upload.component';
import { MyUtility } from '../../../shared/my-utility';
import { environment } from '../../../../environments/environment';

describe('ExternalKpiDataUploadComponent', () => {
  let component: ExternalKpiDataUploadComponent;
  let fixture: ComponentFixture<ExternalKpiDataUploadComponent>;
  let httpMock: HttpTestingController;
  let mockDialogRef: any;
  let mockMyUtility: any;
  const mockDialogData = { custId: 'CUST123' };

  beforeEach(async () => {
    // Create mock objects
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockMyUtility = jasmine.createSpyObj('MyUtility', ['serviceError', 'showSuccess', 'showWarning', 'showError']);
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
        ExternalKpiDataUploadComponent,
        HttpClientTestingModule,
        MatDialogModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        MatSelectModule,
        FormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalKpiDataUploadComponent);
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

  describe('Component Initialization', () => {
    it('should initialize with dialog data', () => {
      expect(component.custId).toBe('CUST123');
    });

    it('should initialize with default values', () => {
      expect(component._loading).toBe(false);
      expect(component.selSource).toBe('');
      expect(component.message).toEqual([]);
      expect(component.file).toBeNull();
      expect(component.isDragOver).toBe(false);
    });

    it('should call ngOnInit', () => {
      spyOn(component, 'ngOnInit');
      component.ngOnInit();
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('should close the dialog', () => {
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Modern UI Methods', () => {
    it('should reset file on source change', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.file = mockFile;
      
      component.onSourceChange();
      
      expect(component.file).toBeNull();
    });

    it('should handle file change event', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const mockEvent = { target: { files: [mockFile] } } as any;
      const mockFileInput = document.createElement('input');

      component.onFileChange(mockEvent, mockFileInput);
      
      expect(component.file).toBe(mockFile);
    });

    it('should handle drag over event', () => {
      const dragEvent = new DragEvent('dragover');
      spyOn(dragEvent, 'preventDefault');
      spyOn(dragEvent, 'stopPropagation');

      component.onDragOver(dragEvent);

      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(dragEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragOver).toBe(true);
    });

    it('should handle drag leave event', () => {
      component.isDragOver = true;
      const dragEvent = new DragEvent('dragleave');
      spyOn(dragEvent, 'preventDefault');
      spyOn(dragEvent, 'stopPropagation');

      component.onDragLeave(dragEvent);

      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(dragEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
    });

    it('should remove file when remove button clicked', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.file = mockFile;
      const clickEvent = new Event('click');
      spyOn(clickEvent, 'stopPropagation');

      component.removeFile(clickEvent);

      expect(clickEvent.stopPropagation).toHaveBeenCalled();
      expect(component.file).toBeNull();
    });

    it('should format file size correctly', () => {
      expect(component.getFileSize(0)).toBe('0 Bytes');
      expect(component.getFileSize(1024)).toBe('1 KB');
      expect(component.getFileSize(1024 * 1024)).toBe('1 MB');
      expect(component.getFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(component.getFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('validateDroppedFile', () => {
    beforeEach(() => {
      component.selSource = 'freshworks';
    });

    it('should return false for file exceeding 16 MB', () => {
      const largeFile = new File(['x'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(largeFile, 'size', { value: 17 * 1024 * 1024 });

      const result = component.validateDroppedFile(largeFile);

      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please drop a file smaller than 16 MB');
    });

    it('should return false for wrong file type (CSV for FreshWorks)', () => {
      const wrongFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(wrongFile, 'size', { value: 1024 });

      const result = component.validateDroppedFile(wrongFile);

      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please drop a CSV file only');
    });

    it('should return false for wrong file type (JSON for ZIF)', () => {
      component.selSource = 'zif';
      const wrongFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(wrongFile, 'size', { value: 1024 });

      const result = component.validateDroppedFile(wrongFile);

      expect(result).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please drop a JSON file only');
    });

    it('should return true for valid CSV file', () => {
      const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });

      const result = component.validateDroppedFile(validFile);

      expect(result).toBe(true);
      expect(mockMyUtility.showWarning).not.toHaveBeenCalled();
    });

    it('should return true for valid JSON file', () => {
      component.selSource = 'zif';
      const validFile = new File(['{}'], 'test.json', { type: 'application/json' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });

      const result = component.validateDroppedFile(validFile);

      expect(result).toBe(true);
      expect(mockMyUtility.showWarning).not.toHaveBeenCalled();
    });
  });

  describe('service_AddFile', () => {
    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
      component.selSource = 'freshworks';
    });

    it('should show warning when no file is selected', () => {
      component.file = null;
      
      component.service_AddFile();
      
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please select a file to upload');
      httpMock.expectNone(environment.webapiuri + 'UploadExternalKPIData');
    });

    it('should show warning when no source is selected', () => {
      component.file = mockFile;
      component.selSource = '';
      
      component.service_AddFile();
      
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please select a data source');
      httpMock.expectNone(environment.webapiuri + 'UploadExternalKPIData');
    });

    it('should show warning for wrong file type (not CSV for FreshWorks)', () => {
      const jsonFile = new File(['{}'], 'test.json', { type: 'application/json' });
      component.file = jsonFile;
      component.selSource = 'freshworks';
      
      component.service_AddFile();
      
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please upload a CSV file only');
      httpMock.expectNone(environment.webapiuri + 'UploadExternalKPIData');
    });

    it('should show warning for wrong file type (not JSON for ZIF)', () => {
      component.file = mockFile;
      component.selSource = 'zif';
      
      component.service_AddFile();
      
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please upload a JSON file only');
      httpMock.expectNone(environment.webapiuri + 'UploadExternalKPIData');
    });

    it('should show warning for file exceeding 16 MB', () => {
      const largeFile = new File(['x'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(largeFile, 'size', { value: 17 * 1024 * 1024 });
      component.file = largeFile;
      
      component.service_AddFile();
      
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please upload a file smaller than 16 MB');
      httpMock.expectNone(environment.webapiuri + 'UploadExternalKPIData');
    });

    it('should upload file successfully for FreshWorks', () => {
      component.file = mockFile;
      component.custId = 'CUST123';
      component.selSource = 'freshworks';

      const mockResponse = 'File uploaded successfully';

      component.service_AddFile();

      expect(component._loading).toBe(true);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadExternalKPIData');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('empId')).toBe('12345');
      expect(req.request.headers.get('token')).toBe('test-token-123');
      expect(req.request.headers.get('customerId')).toBe('CUST123');
      expect(req.request.headers.get('source')).toBe('freshworks');
      expect(req.request.headers.get('fileType')).toBe('data');
      expect(req.request.body instanceof FormData).toBe(true);

      req.flush(mockResponse);

      expect(component.message).toBe(mockResponse);
      expect(component._loading).toBe(false);
      expect(mockMyUtility.showSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should upload file successfully for ZIF', () => {
      const jsonFile = new File(['{"key": "value"}'], 'test.json', { type: 'application/json' });
      component.file = jsonFile;
      component.custId = 'CUST456';
      component.selSource = 'zif';

      const mockResponse = ['Upload completed'];

      component.service_AddFile();

      const req = httpMock.expectOne(environment.webapiuri + 'UploadExternalKPIData');
      expect(req.request.headers.get('source')).toBe('zif');
      expect(req.request.headers.get('customerId')).toBe('CUST456');

      req.flush(mockResponse);

      expect(component.message).toEqual(mockResponse);
      expect(component._loading).toBe(false);
      expect(mockMyUtility.showSuccess).toHaveBeenCalledWith('Upload successful');
    });

    it('should handle upload error', () => {
      component.file = mockFile;
      component.custId = 'CUST123';

      const mockError = { status: 500, statusText: 'Internal Server Error' };

      component.service_AddFile();

      const req = httpMock.expectOne(environment.webapiuri + 'UploadExternalKPIData');
      req.error(new ErrorEvent('Network error'), mockError);

      expect(mockMyUtility.serviceError).toHaveBeenCalled();
      expect(component._loading).toBe(false);
    });
  });

  describe('Source Selection', () => {
    it('should default to empty string (force selection)', () => {
      expect(component.selSource).toBe('');
    });

    it('should allow changing source', () => {
      component.selSource = 'zif';
      expect(component.selSource).toBe('zif');
    });

    it('should validate based on selected source', () => {
      const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(csvFile, 'size', { value: 1024 * 1024 });

      // CSV valid for freshworks
      component.selSource = 'freshworks';
      expect(component.validateDroppedFile(csvFile)).toBe(true);

      // CSV invalid for ZIF
      component.selSource = 'zif';
      expect(component.validateDroppedFile(csvFile)).toBe(false);
      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please drop a JSON file only');
    });
  });

  describe('Component Rendering', () => {
    it('should display the dialog title', () => {
      const compiled = fixture.nativeElement;
      const titleElement = compiled.querySelector('.dialog-title');
      expect(titleElement.textContent.trim()).toBe('Upload KPI Data');
    });

    it('should display close button', () => {
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.close-btn');
      expect(closeButton).toBeTruthy();
    });

    it('should display source selection dropdown', () => {
      const compiled = fixture.nativeElement;
      const selectElement = compiled.querySelector('#selectSource');
      expect(selectElement).toBeTruthy();
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
      const closeButton = compiled.querySelector('.close-btn');
      closeButton.click();
      expect(component.onClose).toHaveBeenCalled();
    });

    it('should show FreshWorks upload section when source is freshworks', async () => {
      component.selSource = 'freshworks';
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const fileInput = compiled.querySelector('input[accept=".csv"]');
      expect(fileInput).toBeTruthy();
    });

    it('should show ZIF upload section when source is zif', async () => {
      component.selSource = 'zif';
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const fileInput = compiled.querySelector('input[accept=".json"]');
      expect(fileInput).toBeTruthy();
    });

    it('should disable controls when loading', async () => {
      component._loading = true;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const selectElement = compiled.querySelector('#selectSource');
      expect(selectElement.disabled).toBe(true);
    });

    it('should show modern dialog header with gradient', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('.dialog-header');
      expect(header).toBeTruthy();
      expect(header.querySelector('.header-icon')).toBeTruthy();
    });
  });

  describe('Upload Button State', () => {
    it('should disable upload button when no file is selected', async () => {
      component.selSource = 'freshworks';
      component.file = null;
      component._loading = false;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const uploadButton = compiled.querySelector('.upload-btn');
      expect(uploadButton).toBeTruthy();
      expect(uploadButton.disabled).toBe(true);
    });

    it('should disable upload button when loading', async () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selSource = 'freshworks';
      component.file = mockFile;
      component._loading = true;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const uploadButton = compiled.querySelector('.upload-btn');
      expect(uploadButton.disabled).toBe(true);
    });

    it('should enable upload button when file is selected and not loading', async () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selSource = 'freshworks';
      component.file = mockFile;
      component._loading = false;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const uploadButton = compiled.querySelector('.upload-btn');
      expect(uploadButton.disabled).toBe(false);
    });

    it('should disable cancel button when loading', async () => {
      component._loading = true;
      component.selSource = 'freshworks';
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const cancelButton = compiled.querySelector('.cancel-btn');
      expect(cancelButton).toBeTruthy();
      expect(cancelButton.disabled).toBe(true);
    });

    it('should show upload text when not loading', async () => {
      component._loading = false;
      component.selSource = 'freshworks';
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.file = mockFile;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const uploadButton = compiled.querySelector('.upload-btn');
      expect(uploadButton.textContent.trim()).toContain('Upload');
    });

    it('should show uploading text when loading', async () => {
      component._loading = true;
      component.selSource = 'freshworks';
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.file = mockFile;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const compiled = fixture.nativeElement;
      const uploadButton = compiled.querySelector('.upload-btn');
      expect(uploadButton.textContent.trim()).toContain('Uploading');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full upload workflow for FreshWorks', () => {
      const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
      
      component.file = mockFile;
      component.selSource = 'freshworks';

      component.service_AddFile();
      expect(component._loading).toBe(true);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadExternalKPIData');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('source')).toBe('freshworks');

      req.flush('Upload completed successfully');

      expect(component._loading).toBe(false);
      expect(mockMyUtility.showSuccess).toHaveBeenCalledWith('Upload completed successfully');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should complete full upload workflow for ZIF', () => {
      const mockFile = new File(['{"data": "test"}'], 'test.json', { type: 'application/json' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
      
      component.file = mockFile;
      component.selSource = 'zif';

      component.service_AddFile();
      expect(component._loading).toBe(true);

      const req = httpMock.expectOne(environment.webapiuri + 'UploadExternalKPIData');
      expect(req.request.headers.get('source')).toBe('zif');
      expect(req.request.headers.get('fileType')).toBe('data');

      req.flush(['Success']);

      expect(component._loading).toBe(false);
      expect(mockMyUtility.showSuccess).toHaveBeenCalled();
    });

    it('should handle validation failure workflow', () => {
      component.file = null;

      component.service_AddFile();

      expect(mockMyUtility.showWarning).toHaveBeenCalledWith('Please select a file to upload');
      expect(component._loading).toBe(false);
      httpMock.expectNone(environment.webapiuri + 'UploadExternalKPIData');
    });
  });
});
