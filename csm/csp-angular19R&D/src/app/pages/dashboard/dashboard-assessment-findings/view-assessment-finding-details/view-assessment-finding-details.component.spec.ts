import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewAssessmentFindingDetailsComponent } from './view-assessment-finding-details.component';
import { AppsService } from '../../../../core/services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('ViewAssessmentFindingDetailsComponent', () => {
  let component: ViewAssessmentFindingDetailsComponent;
  let fixture: ComponentFixture<ViewAssessmentFindingDetailsComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialogRef: any;

  const dialogData = {
    assessmentFindingInputs: {
      cusT_ID: 'C1',
      findinG_STATUS: 'Open',
      findinG_TYPE: ['Weakness'],
      fromDate: new Date(),
      toDate: new Date()
    }
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getAssessmentFindingsViewDetails: jasmine.createSpy().and.returnValue(of({
        assessmenT_FINDINGS_DETAILS: []
      }))
    };
    mockUtil = {
      serviceError: jasmine.createSpy()
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [ViewAssessmentFindingDetailsComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssessmentFindingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component._loading).toBe(false);
    expect(component.projDisplayIndex).toBe(-1);
    expect(component.isExpanded).toBe(false);
  });

  it('should call getAssessmentFindingsViewDetails on init', () => {
    expect(mockAppService.getAssessmentFindingsViewDetails).toHaveBeenCalledWith(dialogData.assessmentFindingInputs);
  });

  it('should set assessmentFindingsViewDetailsData on success', () => {
    const mockData = { assessmenT_FINDINGS_DETAILS: [{ id: 1 }] };
    mockAppService.getAssessmentFindingsViewDetails.and.returnValue(of(mockData));
    component.getAssessmentFindingsViewDetails();
    expect(component.assessmentFindingsViewDetailsData).toEqual(mockData);
  });

  it('should set _loading to false after data fetch', () => {
    component.getAssessmentFindingsViewDetails();
    expect(component._loading).toBe(false);
  });

  it('should call serviceError on failure', () => {
    mockAppService.getAssessmentFindingsViewDetails.and.returnValue(throwError(() => new Error('error')));
    component.getAssessmentFindingsViewDetails();
    expect(mockUtil.serviceError).toHaveBeenCalled();
  });

  it('should close dialog when onClose is called', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should toggle projDisplayIndex in setProjectIndex', () => {
    component.assessmentFindingsViewDetailsData = {
      assessmenT_FINDINGS_DETAILS: [{ isexpanded: false }, { isexpanded: false }]
    };
    component.setProjectIndex(0, {});
    expect(component.projDisplayIndex).toBe(0);
    expect(component.assessmentFindingsViewDetailsData.assessmenT_FINDINGS_DETAILS[0].isexpanded).toBe(true);
  });

  it('should collapse when same index is clicked again', () => {
    component.assessmentFindingsViewDetailsData = {
      assessmenT_FINDINGS_DETAILS: [{ isexpanded: true }]
    };
    component.projDisplayIndex = 0;
    component.setProjectIndex(0, {});
    expect(component.projDisplayIndex).toBe(-1);
    expect(component.assessmentFindingsViewDetailsData.assessmenT_FINDINGS_DETAILS[0].isexpanded).toBe(false);
  });
});
