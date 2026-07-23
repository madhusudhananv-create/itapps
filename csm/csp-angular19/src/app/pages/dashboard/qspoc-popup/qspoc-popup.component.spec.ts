import { provideNoopAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QSPOCPopupComponent } from './qspoc-popup.component';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('QSPOCPopupComponent', () => {
  let component: QSPOCPopupComponent;
  let fixture: ComponentFixture<QSPOCPopupComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockAccess: any;
  let mockDialogRef: any;

  const dialogData = {
    projname: 'Test Project',
    custname: 'Test Customer',
    custid: 'C1',
    projids: 'P1'
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      GetProjectDetails: jasmine.createSpy().and.returnValue(of({
        qaList: [{ emP_ID: 'E1', emP_NAME: 'QA User' }],
        certificationScopeList: [],
        isoStandardList: []
      })),
      getProjectCertificationScope: jasmine.createSpy().and.returnValue(of([])),
      GetProjectHeadsByID: jasmine.createSpy().and.returnValue(of({
        csM_NAME: 'Test CSM',
        qa: 'E1',
        isO_STANDARDS: null,
        certificatioN_SCOPES: null
      })),
      UpdateProjectDetails: jasmine.createSpy().and.returnValue(of({}))
    };
    mockUtil = {
      serviceError: jasmine.createSpy(),
      showSuccessPopup: jasmine.createSpy()
    };
    mockAccess = {
      IsAllowed: jasmine.createSpy().and.returnValue(true)
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [QSPOCPopupComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: AccessControl, useValue: mockAccess },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideProvider(AppsService, { useValue: mockAppService });
    TestBed.overrideProvider(MyUtility, { useValue: mockUtil });
    TestBed.overrideProvider(AccessControl, { useValue: mockAccess });
    TestBed.overrideProvider(MatDialogRef, { useValue: mockDialogRef });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QSPOCPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.editmode).toBe(false);
    expect(component.isLoading).toBe(false);
    expect(component.selectedScope).toEqual([]);
    expect(component.selectedIso).toEqual([]);
  });

  it('should set dialog data on init', () => {
    expect(component.projname).toBe('Test Project');
    expect(component.custname).toBe('Test Customer');
    expect(component.custid).toBe('C1');
    expect(component.projids).toBe('P1');
  });

  it('should call getProjectInputDetails on init', () => {
    expect(mockAppService.GetProjectDetails).toHaveBeenCalled();
  });

  it('should call getProjectCertificationScope on init', () => {
    expect(mockAppService.getProjectCertificationScope).toHaveBeenCalled();
  });

  it('should call GetProjectHeadsByID after getProjectCertificationScope', () => {
    expect(mockAppService.GetProjectHeadsByID).toHaveBeenCalledWith('P1');
  });

  it('should set csM_NAME from GetProjectHeadsByID response', () => {
    expect(component.csM_NAME).toBe('Test CSM');
  });

  it('should set editmode to false when close is called', () => {
    component.editmode = true;
    component.close();
    expect(component.editmode).toBe(false);
  });

  it('should close dialog when Cancel_onClick is called', () => {
    component.Cancel_onClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call UpdateProjectDetails on SaveDetails when valid', () => {
    component.selectedQA = 'E1';
    component.selectedScope = ['Scope1'];
    component.selectedIso = ['ISO1'];
    component.SaveDetails();
    expect(mockAppService.UpdateProjectDetails).toHaveBeenCalled();
  });

  it('should populate QAEmployeeList from GetProjectDetails', () => {
    expect(component.QAEmployeeList).toBeDefined();
  });

  it('should filter scopes by selected ISO standards', () => {
    component.OverallProjectScopes = [
      { isO_STANDARD_ID: 'ISO1', scopE_NAME: 'Scope A' },
      { isO_STANDARD_ID: 'ISO2', scopE_NAME: 'Scope B' }
    ];
    component.filterScopes(['ISO1']);
    expect(component.OverallScopes).toBeDefined();
  });

  it('should apply filter for scope when applyFilterForScope is called', () => {
    component.OverallScopes = [
      { scopE_NAME: 'Scope Alpha', items: [{ scopE_NAME: 'Alpha Item' }] },
      { scopE_NAME: 'Scope Beta', items: [{ scopE_NAME: 'Beta Item' }] }
    ];
    component.applyFilterForScope('alpha');
    expect(component.OverallScopes).toBeDefined();
  });
});
