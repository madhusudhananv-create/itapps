import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PspdComponent } from './pspd.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

describe('PspdComponent', () => {
  let component: PspdComponent;
  let fixture: ComponentFixture<PspdComponent>;
  let mockAppService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockAppService = {
      getProcessModelList: jasmine.createSpy('getProcessModelList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getServiceTowersProjectMapping: jasmine.createSpy('getServiceTowersProjectMapping').and.returnValue(of([])),
      getProjectServiceAreaProcessMapping: jasmine.createSpy('getProjectServiceAreaProcessMapping').and.returnValue(of([])),
      saveServiceTowerMapping: jasmine.createSpy('saveServiceTowerMapping').and.returnValue(of({})),
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [PspdComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    TestBed.overrideComponent(PspdComponent, {
      set: { imports: [], template: '<div></div>' }
    });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PspdComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetProcessModelList on init', () => {
      fixture.detectChanges();
      expect(mockAppService.getProcessModelList).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize serviceAreaList as empty array', () => {
      fixture.detectChanges();
      expect(component.serviceAreaList).toEqual([]);
    });

    it('should initialize processModelList as empty array', () => {
      fixture.detectChanges();
      expect(component.processModelList).toEqual([]);
    });

    it('should initialize enableDiv to false', () => {
      fixture.detectChanges();
      expect(component.enableDiv).toBe(false);
    });

    it('should initialize isProcessMapped to true', () => {
      fixture.detectChanges();
      expect(component.isProcessMapped).toBe(true);
    });
  });

  describe('IsAllCheckedOnInitialLoad', () => {
    it('should return true when all items are selected', () => {
      const list = [{ bSelected: true }, { bSelected: true }] as any[];
      expect(component.IsAllCheckedOnInitialLoad(list)).toBe(true);
    });

    it('should return false when some items are not selected', () => {
      const list = [{ bSelected: true }, { bSelected: false }] as any[];
      expect(component.IsAllCheckedOnInitialLoad(list)).toBe(false);
    });

    it('should return true when list is empty (no unselected item)', () => {
      expect(component.IsAllCheckedOnInitialLoad([])).toBe(true);
    });
  });
});

describe('PspdComponent (second)', () => {
  let component: PspdComponent;
  let fixture: ComponentFixture<PspdComponent>;

  beforeEach(waitForAsync(() => {
    const mockAppSvc = {
      getProcessModelList: jasmine.createSpy('getProcessModelList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getServiceTowersProjectMapping: jasmine.createSpy('getServiceTowersProjectMapping').and.returnValue(of([])),
      getProjectServiceAreaProcessMapping: jasmine.createSpy('getProjectServiceAreaProcessMapping').and.returnValue(of([])),
      saveServiceTowerMapping: jasmine.createSpy('saveServiceTowerMapping').and.returnValue(of({})),
      getCustomerList: jasmine.createSpy('getCustomerList').and.returnValue(of([]))
    };
    TestBed.configureTestingModule({
      imports: [PspdComponent],
      providers: [
        { provide: AppsService, useValue: mockAppSvc },
        { provide: MyUtility, useValue: { serviceError: jasmine.createSpy('serviceError'), showError: jasmine.createSpy('showError'), showSuccess: jasmine.createSpy('showSuccess'), GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser') } },
        provideRouter([]),
        provideHttpClient()
      ]
    });
    TestBed.overrideComponent(PspdComponent, {
      set: { imports: [], template: '<div></div>' }
    });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PspdComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
