import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PresurveyConnectComponent } from './presurvey-connect.component';
import { AppsService } from '../../core/services/apps.service';
import { SharedService } from '../../shared/shared.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControlService } from '../../core/services/access-control.service';
import { provideHttpClient } from '@angular/common/http';

const mockOverallData = {
  csS_BATCH_CUSTOMER_ID: 1,
  actuaL_DATE: '2024-01-01',
  planneD_DATE: '2024-02-01',
  status: 'In Progress',
  remarks: 'Looking good',
  updateD_BY_NAME: 'Test User'
};

describe('PresurveyConnectComponent', () => {
  let component: PresurveyConnectComponent;
  let fixture: ComponentFixture<PresurveyConnectComponent>;
  let mockAppsService: any;
  let mockSharedService: any;
  let mockMyUtility: any;
  let mockAccessService: any;
  let mockDialogRef: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      getOverallPreconnectData: jasmine.createSpy('getOverallPreconnectData').and.returnValue(of(mockOverallData)),
      savePreconnectSurveyData: jasmine.createSpy('savePreconnectSurveyData').and.returnValue(of({}))
    };

    mockSharedService = {
      showWarningPopup: jasmine.createSpy('showWarningPopup')
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      Today: jasmine.createSpy('Today').and.returnValue(new Date()),
      setLocaleDate: jasmine.createSpy('setLocaleDate').and.callFake((d: any) => d)
    };

    mockAccessService = {};

    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [
        PresurveyConnectComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: SharedService, useValue: mockSharedService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControlService, useValue: mockAccessService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { isDisabled: false, isEditable: true, batchCustomerId: 1 } },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresurveyConnectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── Constructor / initial state ──────────────────────────────────────────

  describe('constructor / initial state', () => {
    it('should set isDisabled from MAT_DIALOG_DATA', () => {
      fixture.detectChanges();
      expect(component.isDisabled).toBe(false);
    });

    it('should set isEditable from MAT_DIALOG_DATA', () => {
      fixture.detectChanges();
      expect(component.isEditable).toBe(true);
    });

    it('should set batchCustomerId from MAT_DIALOG_DATA', () => {
      fixture.detectChanges();
      expect(component.batchCustomerId).toBe(1);
    });
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getPreconnectDataList', () => {
      spyOn(component, 'getPreconnectDataList');
      fixture.detectChanges();
      expect(component.getPreconnectDataList).toHaveBeenCalled();
    });

    it('should set presurveyformData.csS_BATCH_CUSTOMER_ID to batchCustomerId', () => {
      fixture.detectChanges();
      expect(component.presurveyformData.csS_BATCH_CUSTOMER_ID).toBe(1);
    });

    it('should set presurveyformData.status to "To Be Planned"', () => {
      mockAppsService.getOverallPreconnectData.and.returnValue(of(null));
      fixture.detectChanges();
      expect(component.presurveyformData.status).toBe('To Be Planned');
    });
  });

  // ─── getPreconnectDataList ─────────────────────────────────────────────────

  describe('getPreconnectDataList', () => {
    it('should set overallPreconnectData from service', () => {
      fixture.detectChanges();
      expect(component.overallPreconnectData).toEqual(mockOverallData);
    });

    it('should copy data to presurveyformData', () => {
      fixture.detectChanges();
      expect(component.presurveyformData.status).toBe('To Be Planned');
      expect(component.presurveyformData.remarks).toBe('Looking good');
    });

    it('should set isLoading=false after success', () => {
      fixture.detectChanges();
      expect(component.isLoading).toBe(false);
    });

    it('should call setDisabledState after loading data', () => {
      spyOn(component, 'setDisabledState');
      fixture.detectChanges();
      expect(component.setDisabledState).toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getOverallPreconnectData.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── setDisabledState ─────────────────────────────────────────────────────

  describe('setDisabledState', () => {
    it('should set isDisabledData=true when isEditable=false', () => {
      component.isEditable = false;
      component.setDisabledState();
      expect(component.isDisabledData).toBe(true);
    });

    it('should set isDisabledData=false when editable and not completed', () => {
      component.isEditable = true;
      component.presurveyformData.status = 'In Progress';
      component.presurveyformData.actuaL_DATE = null;
      component.setDisabledState();
      expect(component.isDisabledData).toBe(false);
    });

    it('should set isDisabledData=true when editable, Completed, and actualDate set', () => {
      component.isEditable = true;
      component.presurveyformData.status = 'Completed';
      component.presurveyformData.actuaL_DATE = new Date('2024-01-15');
      component.setDisabledState();
      expect(component.isDisabledData).toBe(true);
    });
  });

  // ─── SubmitForm ───────────────────────────────────────────────────────────

  describe('SubmitForm', () => {
    it('should not call savePreconnectData when isValid=false', () => {
      fixture.detectChanges();
      spyOn(component, 'savePreconnectData');
      component.SubmitForm(false);
      expect(component.savePreconnectData).not.toHaveBeenCalled();
    });

    it('should call savePreconnectData when isValid=true', () => {
      fixture.detectChanges();
      spyOn(component, 'savePreconnectData');
      component.SubmitForm(true);
      expect(component.savePreconnectData).toHaveBeenCalled();
    });
  });

  // ─── savePreconnectData ───────────────────────────────────────────────────

  describe('savePreconnectData', () => {
    it('should call savePreconnectSurveyData on save', () => {
      fixture.detectChanges();
      component.savePreconnectData();
      expect(mockAppsService.savePreconnectSurveyData).toHaveBeenCalled();
    });

    it('should call dialogRef.close(true) on success', () => {
      fixture.detectChanges();
      component.savePreconnectData();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should show warning popup with success message', () => {
      fixture.detectChanges();
      spyOn(component, 'showWarningPopup');
      component.savePreconnectData();
      expect(component.showWarningPopup).toHaveBeenCalledWith('Data saved successfully.');
    });

    it('should show warning popup with error message on failure', () => {
      mockAppsService.savePreconnectSurveyData.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      spyOn(component, 'showWarningPopup');
      component.savePreconnectData();
      expect(component.showWarningPopup).toHaveBeenCalled();
    });
  });

  // ─── closePopup ───────────────────────────────────────────────────────────

  describe('closePopup', () => {
    it('should call dialogRef.close()', () => {
      fixture.detectChanges();
      component.closePopup();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
