import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { ViewCsatComponent } from './view-csat.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { LayoutService } from '../layout/layout.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';

describe('ViewCsatComponent', () => {
  let component: ViewCsatComponent;
  let fixture: ComponentFixture<ViewCsatComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockLayoutService: any;
  let mockAccess: any;
  let mockDialog: any;
  let mockSnackBar: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      tableYear: 2024,
      Years: jasmine.createSpy('Years').and.returnValue([2024, 2023, 2022])
    };

    mockAccess = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false),
      IsLoggedIn: jasmine.createSpy('IsLoggedIn').and.returnValue(true)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockSnackBar = {
      open: jasmine.createSpy('open')
    };

    mockLayoutService = {
      selectedCust: '',
      GetAllCustomerUser: jasmine.createSpy('GetAllCustomerUser').and.returnValue(of([]))
    };

    mockAppService = {
      GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of([])),
      getAllCustomerUser: jasmine.createSpy('getAllCustomerUser').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ViewCsatComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: AccessControlService, useValue: mockAccess },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: DatePipe, useClass: DatePipe },
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ custid: 'C001', projid: 'P001', year: '2024' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCsatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set input_customerid from route params', () => {
      expect(component.input_customerid).toBe('C001');
    });

    it('should set input_projectid from route params', () => {
      expect(component.input_projectid).toBe('P001');
    });

    it('should call getDBConfig on init', () => {
      expect(mockAppService.GetDBConfigValue).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize loading to false', () => {
      expect(component.loading).toBe(false);
    });

    it('should initialize showSurveyGuid to false', () => {
      expect(component.showSurveyGuid).toBe(false);
    });

    it('should initialize showSurveyText to false', () => {
      expect(component.showSurveyText).toBe(false);
    });

    it('should initialize showPreconnect to false', () => {
      expect(component.showPreconnect).toBe(false);
    });

    it('should initialize showProjectDropdown to true', () => {
      expect(component.showProjectDropdown).toBe(true);
    });

    it('should initialize isEditable to false', () => {
      expect(component.isEditable).toBe(false);
    });
  });

  describe('onViewTypeChange', () => {
    it('should clear input_projectid when showProjectDropdown is false', () => {
      component.input_projectid = 'P001';
      component.showProjectDropdown = false;
      component.onViewTypeChange();
      expect(component.input_projectid).toBe('');
    });

    it('should set first project when showProjectDropdown is true and projNames available', () => {
      component.projNames = [{ proJ_ID: 'P999' }];
      component.showProjectDropdown = true;
      component.onViewTypeChange();
      expect(component.input_projectid).toBe('P999');
    });
  });

  describe('onYearChange', () => {
    it('should clear guid', () => {
      component.guid = ['some-guid'];
      component.onYearChange();
      expect(component.guid).toEqual([]);
    });
  });

  describe('onQuarterChange', () => {
    it('should clear guid', () => {
      component.guid = ['some-guid'];
      component.onQuarterChange();
      expect(component.guid).toEqual([]);
    });
  });

  describe('getQuarterorMonth', () => {
    it('should be a function', () => {
      expect(typeof component.getQuarterorMonth).toBe('function');
    });
  });
});
