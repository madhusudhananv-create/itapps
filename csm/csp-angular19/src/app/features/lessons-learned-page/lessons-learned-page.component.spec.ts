import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { LessonsLearnedPageComponent } from './lessons-learned-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { LessonLearntModel } from '../../models/lesson-learnt-model';

const mockProjNames = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockLessonData = {
  lessonlearnt: [
    { id: 1, projecT_ID: 'P001', description: 'Lesson 1', categorY_OF_LESSON: 'Process', procesS_AREA: 'SQA', publisheD_BY: 'John', publisheD_DATE: new Date() },
    { id: 2, projecT_ID: 'P001', description: 'Lesson 2', categorY_OF_LESSON: 'Quality', procesS_AREA: 'Dev', publisheD_BY: 'Jane', publisheD_DATE: new Date() }
  ],
  ddCategoryOfLesson: ['Process', 'Quality', 'Risk'],
  ddProcessArea: ['SQA', 'Dev', 'Testing']
};

describe('LessonsLearnedPageComponent', () => {
  let component: LessonsLearnedPageComponent;
  let fixture: ComponentFixture<LessonsLearnedPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockLayoutService: any;
  let mockDialog: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjNames)),
      getLessonLearntbyProjId: jasmine.createSpy('getLessonLearntbyProjId').and.returnValue(of(mockLessonData)),
      deleteLessonLearnt: jasmine.createSpy('deleteLessonLearnt').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      AppSettings: { token: 'test-token', empid: 'EMP001' }
    };

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(true)
    };
    mockLayoutService = { selectedCust: '' };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [LessonsLearnedPageComponent, HttpClientTestingModule, MatSnackBarModule, MatDialogModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonsLearnedPageComponent);
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
      expect(mockLayoutService.selectedCust).toBe('');
    });

    it('should set allproj=true for BUHeadIMS role', () => {
      localStorage.setItem('role', '4');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.GetCustomerProjectsName).toHaveBeenCalled();
    });
  });

  // ─── getAllProjectsFromCustomer ────────────────────────────────────────────

  describe('getAllProjectsFromCustomer', () => {
    it('should populate projNames and set first project', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
      expect(component.input_projectid).toBe('P001');
    });

    it('should call onProjectChange after loading projects', () => {
      spyOn(component, 'onProjectChange');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.onProjectChange).toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getLessonLearntforProject ────────────────────────────────────────────

  describe('getLessonLearntforProject', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should populate dataSource with lesson learnt records', () => {
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should populate ddCategoryOfLesson', () => {
      expect(component.ddCategoryOfLesson).toEqual(['Process', 'Quality', 'Risk']);
    });

    it('should populate ddProcessArea', () => {
      expect(component.ddProcessArea).toEqual(['SQA', 'Dev', 'Testing']);
    });

    it('should set showdetails=true and _loading=false', () => {
      expect(component.showdetails).toBe(true);
      expect(component._loading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getLessonLearntbyProjId.and.returnValue(throwError(() => new Error('fail')));
      component.getLessonLearntforProject();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Edit_onClick / Cancel_onClick ────────────────────────────────────────

  describe('Edit_onClick', () => {
    it('should set editmode=true and readonlymode=false', () => {
      fixture.detectChanges();
      component.Edit_onClick();
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });
  });

  describe('Cancel_onClick', () => {
    it('should reset to readonly mode and clear editLessonLearnt', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.editmode).toBe(false);
      expect(component.readonlymode).toBe(true);
      expect(component.editLessonLearnt).toBeInstanceOf(LessonLearntModel);
    });
  });

  // ─── EditRow_onClick ──────────────────────────────────────────────────────

  describe('EditRow_onClick', () => {
    it('should set editLessonLearnt to element and switch to edit mode', () => {
      fixture.detectChanges();
      const element = mockLessonData.lessonlearnt[0] as any;
      component.EditRow_onClick(element);
      expect(component.editLessonLearnt).toBe(element);
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });
  });

  // ─── SubmitForm ───────────────────────────────────────────────────────────

  describe('SubmitForm', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should not proceed when isValid=false', () => {
      component.SubmitForm(false);
      expect(component._loading).toBe(false);
    });

    it('should set readonlymode=true and editmode=false after new submit', () => {
      component.editLessonLearnt = new LessonLearntModel();
      component.editLessonLearnt.id = 0;
      component.input_projectid = 'P001';
      component.SubmitForm(true);
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should set readonlymode=true and editmode=false after update submit', () => {
      component.editLessonLearnt = { ...mockLessonData.lessonlearnt[0] } as any;
      component.editLessonLearnt.id = 1;
      component.SubmitForm(true);
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should reset editLessonLearnt to new model after submit', () => {
      component.editLessonLearnt.id = 0;
      component.input_projectid = 'P001';
      component.SubmitForm(true);
      expect(component.editLessonLearnt).toBeInstanceOf(LessonLearntModel);
    });
  });

  // ─── DeleteRow_onClick ────────────────────────────────────────────────────

  describe('DeleteRow_onClick', () => {
    let dialogSpy: jasmine.Spy;

    beforeEach(() => {
      fixture.detectChanges();
      dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(true) } as any);
    });

    it('should open confirmation dialog', () => {
      component.DeleteRow_onClick(mockLessonData.lessonlearnt[0] as any);
      expect(dialogSpy).toHaveBeenCalled();
    });

    it('should call deleteLessonLearnt on confirm', () => {
      component.DeleteRow_onClick(mockLessonData.lessonlearnt[0] as any);
      expect(mockAppsService.deleteLessonLearnt).toHaveBeenCalled();
    });

    it('should NOT call deleteLessonLearnt when dialog cancelled', () => {
      dialogSpy.and.returnValue({ afterClosed: () => of(false) } as any);
      mockAppsService.deleteLessonLearnt.calls.reset();
      component.DeleteRow_onClick(mockLessonData.lessonlearnt[0] as any);
      expect(mockAppsService.deleteLessonLearnt).not.toHaveBeenCalled();
    });

    it('should call serviceError on delete failure', () => {
      mockAppsService.deleteLessonLearnt.and.returnValue(throwError(() => new Error('fail')));
      component.DeleteRow_onClick(mockLessonData.lessonlearnt[0] as any);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── ToggleFilter_onClick ─────────────────────────────────────────────────

  describe('ToggleFilter_onClick', () => {
    it('should toggle bShowFilter', () => {
      fixture.detectChanges();
      component.bShowFilter = true;
      component.ToggleFilter_onClick();
      expect(component.bShowFilter).toBe(false);
      component.ToggleFilter_onClick();
      expect(component.bShowFilter).toBe(true);
    });
  });

  // ─── Filter_onChange ──────────────────────────────────────────────────────

  describe('Filter_onChange', () => {
    it('should update dataSource with filtered data', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      const filtered = [mockLessonData.lessonlearnt[0]];
      component.Filter_onChange(filtered);
      expect(component.dataSource.data.length).toBe(1);
    });
  });
});
