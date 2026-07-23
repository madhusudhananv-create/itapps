import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { FeedbackPageComponent } from './feedback-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { FeedbackModel } from '../../core/models/feedback-model';
import { provideHttpClient } from '@angular/common/http';

const mockFeedbacks: FeedbackModel[] = [
  {
    id: 1, customeR_ID: 'C001', customeR_EMAILID: 'user@test.com',
    feedback: 'Great service', status: 'New', comments: 'None',
    createD_DATE: new Date(), targeT_DATE: new Date(), isactive: true
  },
  {
    id: 2, customeR_ID: 'C001', customeR_EMAILID: 'user2@test.com',
    feedback: 'Needs improvement', status: 'Submitted', comments: 'Follow up',
    createD_DATE: new Date(), targeT_DATE: new Date(), isactive: true
  }
];

describe('FeedbackPageComponent', () => {
  let component: FeedbackPageComponent;
  let fixture: ComponentFixture<FeedbackPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockLayoutService: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      getFeedbacks: jasmine.createSpy('getFeedbacks').and.callFake(() => of([...mockFeedbacks])),
      addFeedback: jasmine.createSpy('addFeedback').and.returnValue(of({ ...mockFeedbacks[0], id: 3 })),
      updateFeedback: jasmine.createSpy('updateFeedback').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.returnValue(mockFeedbacks),
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false)
    };

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };    mockLayoutService = {
      selectedCust: ''
    };

    TestBed.configureTestingModule({
      imports: [FeedbackPageComponent, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackPageComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set CUST_ID from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.CUST_ID).toBe('C001');
    });

    it('should set layoutService.selectedCust from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should call LoadDetails on init', () => {
      spyOn(component, 'LoadDetails');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.LoadDetails).toHaveBeenCalled();
    });

    it('should initialize newFeedback as FeedbackModel', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.newFeedback).toBeInstanceOf(FeedbackModel);
    });
  });

  // ─── LoadDetails ──────────────────────────────────────────────────────────

  describe('LoadDetails', () => {
    beforeEach(() => {
      component.CUST_ID = 'C001';
      mockAppsService.getFeedbacks.calls.reset();
      component.LoadDetails();
    });

    it('should call getFeedbacks with CUST_ID', () => {
      expect(mockAppsService.getFeedbacks).toHaveBeenCalledWith('C001');
    });

    it('should populate feedbacks array', () => {
      expect(component.feedbacks.length).toBe(2);
    });

    it('should initialize dataSource with feedbacks', () => {
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should set _loading to false on success', () => {
      expect(component._loading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getFeedbacks.and.returnValue(throwError(() => new Error('fail')));
      component.LoadDetails();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── AddFeedback_onClick ──────────────────────────────────────────────────

  describe('AddFeedback_onClick', () => {
    it('should set editmode to true and hide table', () => {
      component.AddFeedback_onClick();
      expect(component.editmode).toBe(true);
      expect(component.showTable).toBe(false);
    });
  });

  // ─── Cancel_onClick / ClientCancel_OnClick ────────────────────────────────

  describe('Cancel_onClick', () => {
    it('should reset to readonly mode and show table', () => {
      component.editmode = true;
      component.showTable = false;
      component.Cancel_onClick();
      expect(component.editmode).toBe(false);
      expect(component.showTable).toBe(true);
    });
  });

  describe('ClientCancel_OnClick', () => {
    it('should reset editmode, showTable, and newFeedback', () => {
      component.editmode = true;
      component.showTable = false;
      component.ClientCancel_OnClick();
      expect(component.editmode).toBe(false);
      expect(component.showTable).toBe(true);
      expect(component.newFeedback).toBeInstanceOf(FeedbackModel);
    });
  });

  // ─── EditRow_onClick ──────────────────────────────────────────────────────

  describe('EditRow_onClick', () => {
    beforeEach(() => {
      component.newFeedback = new FeedbackModel();
    });

    it('should populate newFeedback with element data', () => {
      const element = mockFeedbacks[0];
      component.EditRow_onClick(element);
      expect(component.newFeedback.id).toBe(1);
      expect(component.newFeedback.feedback).toBe('Great service');
      expect(component.newFeedback.status).toBe('New');
    });

    it('should switch to edit mode and hide table', () => {
      component.EditRow_onClick(mockFeedbacks[0]);
      expect(component.editmode).toBe(true);
      expect(component.showTable).toBe(false);
    });
  });

  // ─── SubmitForm (new feedback) ────────────────────────────────────────────

  describe('SubmitForm - new feedback (id = 0)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.newFeedback = new FeedbackModel();
      component.newFeedback.id = 0;
      component.newFeedback.feedback = 'New test feedback';
    });

    it('should not submit when isValid is false', () => {
      component.SubmitForm(false);
      expect(mockAppsService.addFeedback).not.toHaveBeenCalled();
    });

    it('should call addFeedback when id is 0', () => {
      component.SubmitForm(true);
      expect(mockAppsService.addFeedback).toHaveBeenCalled();
    });

    it('should reload feedbacks after successful add', () => {
      component.SubmitForm(true);
      expect(mockAppsService.getFeedbacks).toHaveBeenCalled();
    });

    it('should reset editmode after submit', () => {
      component.SubmitForm(true);
      expect(component.editmode).toBe(false);
      expect(component.showTable).toBe(true);
    });

    it('should call serviceError on addFeedback failure', () => {
      mockAppsService.addFeedback.and.returnValue(throwError(() => new Error('fail')));
      component.SubmitForm(true);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── SubmitForm (update feedback) ────────────────────────────────────────

  describe('SubmitForm - update feedback (id > 0)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.newFeedback = { ...mockFeedbacks[0], id: 1 };
    });

    it('should call updateFeedback when id > 0', () => {
      component.SubmitForm(true);
      expect(mockAppsService.updateFeedback).toHaveBeenCalled();
    });

    it('should reload feedbacks after successful update', () => {
      component.SubmitForm(true);
      expect(mockAppsService.getFeedbacks).toHaveBeenCalled();
    });

    it('should call serviceError on updateFeedback failure', () => {
      mockAppsService.updateFeedback.and.returnValue(throwError(() => new Error('fail')));
      component.SubmitForm(true);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── Filter_onChange / filterData ────────────────────────────────────────

  describe('Filter_onChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should set filterCriteria and call filterData', () => {
      spyOn(component, 'filterData');
      component.Filter_onChange({ criteria: { status: 'New' } });
      expect(component.filterCriteria).toEqual({ status: 'New' });
      expect(component.filterData).toHaveBeenCalled();
    });
  });

  describe('filterData', () => {
    beforeEach(() => {
      component.CUST_ID = 'C001';
      component.LoadDetails();
    });

    it('should apply criteria and refresh table', () => {
      component.filterCriteria = { status: 'New' };
      component.filterData();
      expect(mockMyUtility.ApplyCriteriaRange).toHaveBeenCalledWith({ status: 'New' }, component.feedbacks);
      expect(component.dataSource.data.length).toBe(2);
    });
  });
});
