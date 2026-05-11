import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { ProcessPageComponent } from './process-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';

const mockProjNames = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockProcessData = {
  projecT_PROCESS_TYPE: [
    {
      reporT_TYPE: 'WSR',
      projecT_PROCESS: [{ filE_NAME: 'file1.pdf', filE_EXTENSION: '.pdf' }],
      procesS_CATEGORY: [{ reporT_CATEGORY: 'Weekly', projecT_PROCESS: [] }]
    }
  ],
  ddData: [{ reporT_TYPE: 'WSR', reporT_CATEGORY: ['Weekly'] }]
};

const mockRagData = { rag: 'green', process: 'green' };

describe('ProcessPageComponent', () => {
  let component: ProcessPageComponent;
  let fixture: ComponentFixture<ProcessPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockLayoutService: any;
  let mockHttpClient: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjNames)),
      getProcessNew: jasmine.createSpy('getProcessNew').and.returnValue(of(mockProcessData)),
      getProjectProcessByProjId: jasmine.createSpy('getProjectProcessByProjId').and.returnValue(of([])),
      getProjectRagsByProjId: jasmine.createSpy('getProjectRagsByProjId').and.returnValue(of(mockRagData)),
      deleteProcess: jasmine.createSpy('deleteProcess').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      updateRAG: jasmine.createSpy('updateRAG'),
      getDate: jasmine.createSpy('getDate').and.returnValue('2024-01-01'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      }),
      IsEditable: jasmine.createSpy('IsEditable').and.returnValue(true),
      getRAG: jasmine.createSpy('getRAG').and.returnValue('green'),
      AppSettings: { token: 'test-token' }
    };

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };
    mockLayoutService = { selectedCust: '' };
    mockHttpClient = {
      post: jasmine.createSpy('post').and.returnValue(of({})),
      get: jasmine.createSpy('get').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [ProcessPageComponent, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessPageComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP001');
    localStorage.setItem('role', '5');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
    localStorage.removeItem('role');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_customerid).toBe('C001');
    });

    it('should set layoutService.selectedCust', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set allproj=true for BUHeadIMS role', () => {
      localStorage.setItem('role', '4');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      spyOn(component, 'getAllProjectsFromCustomer');
      fixture.detectChanges();
      expect(component.getAllProjectsFromCustomer).toHaveBeenCalled();
    });
  });

  // ─── getAllProjectsFromCustomer ────────────────────────────────────────────

  describe('getAllProjectsFromCustomer', () => {
    it('should populate projNames', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
    });

    it('should set first project id and call onProjectChange', () => {
      spyOn(component, 'onProjectChange');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_projectid).toBe('P001');
      expect(component.onProjectChange).toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── onProjectChange ──────────────────────────────────────────────────────

  describe('onProjectChange', () => {
    it('should set _loading=true and reset modes', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.input_projectid = 'P001';
      component.onProjectChange();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should call getProcessNew', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.onProjectChange();
      expect(mockAppsService.getProcessNew).toHaveBeenCalledWith('P001');
    });

    it('should call getProjectRagsByProjId', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.onProjectChange();
      expect(mockAppsService.getProjectRagsByProjId).toHaveBeenCalledWith('P001');
    });
  });

  // ─── getProcessNew ────────────────────────────────────────────────────────

  describe('getProcessNew', () => {
    it('should set report_data and showdetails=true', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.getProcessNew();
      expect(component.report_data).toEqual(mockProcessData);
      expect(component.showdetails).toBe(true);
      expect(component._loading).toBe(false);
    });

    it('should reset form fields after load', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.report_type = 'OLD';
      component.getProcessNew();
      expect(component.report_type).toBe('');
      expect(component.report_category).toBe('');
      expect(component.selectedDate).toBeNull();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProcessNew.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProcessNew();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Edit_onClick / Cancel_onClick ────────────────────────────────────────

  describe('Edit_onClick', () => {
    it('should set readonlymode=false and editmode=true', () => {
      fixture.detectChanges();
      component.Edit_onClick();
      expect(component.readonlymode).toBe(false);
      expect(component.editmode).toBe(true);
    });
  });

  describe('Cancel_onClick', () => {
    it('should set readonlymode=true and editmode=false', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  // ─── validateSave ─────────────────────────────────────────────────────────

  describe('validateSave', () => {
    it('should return false when reportType is empty', () => {
      fixture.detectChanges();
      const result = component.validateSave('', new Date(), { files: [{}] });
      expect(result).toBe(false);
    });

    it('should return false when selectedDate is null', () => {
      fixture.detectChanges();
      const result = component.validateSave('WSR', null, { files: [{}] });
      expect(result).toBe(false);
    });

    it('should return false when no file selected', () => {
      fixture.detectChanges();
      const result = component.validateSave('WSR', new Date(), { files: [] });
      expect(result).toBe(false);
    });

    it('should return true when all fields are valid', () => {
      fixture.detectChanges();
      const result = component.validateSave('WSR', new Date(), { files: [{}] });
      expect(result).toBe(true);
    });
  });

  // ─── AddNewType / AddType / AddNewCategory / AddCategory ──────────────────

  describe('AddNewType', () => {
    it('should enable type input and disable type div', () => {
      fixture.detectChanges();
      component.AddNewType(null);
      expect(component.enableTypeInput).toBe(true);
      expect(component.disableTypediv).toBe(true);
    });
  });

  describe('AddType', () => {
    it('should add type to report_data.ddData and reset flag', () => {
      fixture.detectChanges();
      component.report_data.ddData = [];
      component.report_type = 'NewType';
      component.AddType(null);
      expect(component.report_data.ddData.length).toBe(1);
      expect(component.enableTypeInput).toBe(false);
    });

    it('should not add if report_type is empty', () => {
      fixture.detectChanges();
      component.report_data.ddData = [];
      component.report_type = '';
      component.AddType(null);
      expect(component.report_data.ddData.length).toBe(0);
    });
  });

  describe('AddNewCategory', () => {
    it('should enable category input and disable cat div', () => {
      fixture.detectChanges();
      component.AddNewCategory(null);
      expect(component.enableCategoryInput).toBe(true);
      expect(component.disableCatdiv).toBe(true);
    });
  });

  describe('AddCategory', () => {
    it('should add category to selectedReportType and reset flag', () => {
      fixture.detectChanges();
      component.selectedReportType.reporT_CATEGORY = [];
      component.report_category = 'Monthly';
      component.AddCategory(null);
      expect(component.selectedReportType.reporT_CATEGORY!.length).toBe(1);
      expect(component.enableCategoryInput).toBe(false);
    });
  });

  // ─── SaveRAG_onClick ──────────────────────────────────────────────────────

  describe('SaveRAG_onClick', () => {
    it('should not call updateRAG when rag is empty', () => {
      fixture.detectChanges();
      component.SaveRAG_onClick('');
      expect(mockMyUtility.updateRAG).not.toHaveBeenCalled();
    });

    it('should call updateRAG with valid rag', () => {
      fixture.detectChanges();
      component.input_rag = mockRagData;
      component.SaveRAG_onClick('green');
      expect(mockMyUtility.updateRAG).toHaveBeenCalledWith(mockRagData, 'process', 'green');
    });
  });

  // ─── getIcon / getIconName / getIconClass ─────────────────────────────────

  describe('getIcon', () => {
    it('should return ppt icon class for .pptx', () => {
      fixture.detectChanges();
      const result = component.getIcon('.pptx');
      expect(result).toContain('powerpoint');
    });

    it('should return excel icon class for .xlsx', () => {
      fixture.detectChanges();
      expect(component.getIcon('.xlsx')).toContain('excel');
    });

    it('should return pdf icon class for .pdf', () => {
      fixture.detectChanges();
      expect(component.getIcon('.pdf')).toContain('pdf');
    });

    it('should return default icon class for unknown extension', () => {
      fixture.detectChanges();
      expect(component.getIcon('.unknown')).toBe('fa fa-file');
    });
  });

  describe('getIconName', () => {
    it('should return "slideshow" for .pptx', () => {
      fixture.detectChanges();
      expect(component.getIconName('.pptx')).toBe('slideshow');
    });

    it('should return "insert_drive_file" for unknown', () => {
      fixture.detectChanges();
      expect(component.getIconName('.xyz')).toBe('insert_drive_file');
    });
  });

  // ─── DeleteRow_onClick ────────────────────────────────────────────────────

  describe('DeleteRow_onClick', () => {
    it('should call deleteProcess when dialog confirmed', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.DeleteRow_onClick({ id: 1 }, 0, null, null);
      expect(mockAppsService.deleteProcess).toHaveBeenCalled();
    });

    it('should not call deleteProcess when dialog cancelled', () => {
      mockMyUtility.showWarningConfirmation.and.returnValue({ afterClosed: () => of(false) });
      fixture.detectChanges();
      component.DeleteRow_onClick({ id: 1 }, 0, null, null);
      expect(mockAppsService.deleteProcess).not.toHaveBeenCalled();
    });
  });

  // ─── getProjectRagsByProjId ───────────────────────────────────────────────

  describe('getProjectRagsByProjId', () => {
    it('should set input_rag from service', () => {
      fixture.detectChanges();
      component.getProjectRagsByProjId('P001');
      expect(component.input_rag).toEqual(mockRagData);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProjectRagsByProjId.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProjectRagsByProjId('P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });
});
