import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProcessChecklistMappingComponent } from './process-checklist-mapping.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { UtilityService } from '../../../core/services/utility.service';
import { provideHttpClient } from '@angular/common/http';

describe('ProcessChecklistMappingComponent', () => {
  let component: ProcessChecklistMappingComponent;
  let fixture: ComponentFixture<ProcessChecklistMappingComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockUtilityService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      GetUserName: jasmine.createSpy('GetUserName').and.returnValue('testuser')
    };

    mockUtilityService = {
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess')
    };

    mockAppService = {
      getChecklistList: jasmine.createSpy('getChecklistList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      getCategory: jasmine.createSpy('getCategory').and.returnValue(of([])),
      getWeightageForAllChecklist: jasmine.createSpy('getWeightageForAllChecklist').and.returnValue(of([])),
      getMaturiryLevel: jasmine.createSpy('getMaturiryLevel').and.returnValue(of([])),
      getProcessAreaByServiceTower: jasmine.createSpy('getProcessAreaByServiceTower').and.returnValue(of([])),
      getProcessByServiceArea: jasmine.createSpy('getProcessByServiceArea').and.returnValue(of([])),
      getProcessChecklistMapping: jasmine.createSpy('getProcessChecklistMapping').and.returnValue(of([])),
      addProcessChecklistMapping: jasmine.createSpy('addProcessChecklistMapping').and.returnValue(of({})),
      deleteProcessChecklistMapping: jasmine.createSpy('deleteProcessChecklistMapping').and.returnValue(of({})),
      getQuestionCategory: jasmine.createSpy('getQuestionCategory').and.returnValue(of([])),
      getMaturityLevel: jasmine.createSpy('getMaturityLevel').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ProcessChecklistMappingComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: UtilityService, useValue: mockUtilityService },
        provideHttpClient()
      ]
    }).overrideComponent(ProcessChecklistMappingComponent, { set: { imports: [], template: '<div></div>' } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessChecklistMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call service_getChecklistList on init', () => {
      expect(mockAppService.getChecklistList).toHaveBeenCalled();
    });

    it('should call Service_GetServiceAreaList on init', () => {
      expect(mockAppService.getServiceAreaList).toHaveBeenCalled();
    });

    it('should call getCategory on init', () => {
      expect(mockAppService.getQuestionCategory).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize bAddNewServiceArea to false', () => {
      expect(component.bAddNewServiceArea).toBe(false);
    });
  });
});
