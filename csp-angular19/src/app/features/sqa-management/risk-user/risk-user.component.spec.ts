import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RiskUserComponent } from './risk-user.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

describe('RiskUserComponent', () => {
  let component: RiskUserComponent;
  let fixture: ComponentFixture<RiskUserComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess')
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) })
    };

    mockAppService = {
      GetRiskCategory1List: jasmine.createSpy('GetRiskCategory1List').and.returnValue(of([])),
      GetAllRiskCategory2List: jasmine.createSpy('GetAllRiskCategory2List').and.returnValue(of([])),
      GetAllRiskCategory3List: jasmine.createSpy('GetAllRiskCategory3List').and.returnValue(of([])),
      getObjectivesList: jasmine.createSpy('getObjectivesList').and.returnValue(of([])),
      GetRiskOwnersList: jasmine.createSpy('GetRiskOwnersList').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      GetRiskObjectivesMappingData: jasmine.createSpy('GetRiskObjectivesMappingData').and.returnValue(of([])),
      GetProcessModelRisksNew: jasmine.createSpy('GetProcessModelRisksNew').and.returnValue(of([])),
      GetRiskCategory2List: jasmine.createSpy('GetRiskCategory2List').and.returnValue(of([])),
      GetRiskCategory3ListByRisk2: jasmine.createSpy('GetRiskCategory3ListByRisk2').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [RiskUserComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call Service_GetRiskCategory1List on init', () => {
      expect(mockAppService.GetRiskCategory1List).toHaveBeenCalled();
    });

    it('should call Service_GetRiskCategory2List on init', () => {
      expect(mockAppService.GetAllRiskCategory2List).toHaveBeenCalled();
    });

    it('should call Service_GetRiskCategory3List on init', () => {
      expect(mockAppService.GetAllRiskCategory3List).toHaveBeenCalled();
    });

    it('should call Service_GetObjectivesList on init', () => {
      expect(mockAppService.getObjectivesList).toHaveBeenCalled();
    });

    it('should call Service_GetRiskOwnersList on init', () => {
      expect(mockAppService.GetRiskOwnersList).toHaveBeenCalled();
    });

    it('should call Service_GetServiceAreaList on init', () => {
      expect(mockAppService.getServiceAreaList).toHaveBeenCalled();
    });

    it('should call Service_GetRiskObjectivesMappingData on init', () => {
      expect(mockAppService.GetRiskObjectivesMappingData).toHaveBeenCalled();
    });
  });

  describe('initial state', () => {
    it('should initialize showMapScreen to false', () => {
      expect(component.showMapScreen).toBe(false);
    });

    it('should initialize viewMode to true', () => {
      expect(component.viewMode).toBe(true);
    });

    it('should initialize editMode to false', () => {
      expect(component.editMode).toBe(false);
    });

    it('should initialize showAddScreen to false', () => {
      expect(component.showAddScreen).toBe(false);
    });

    it('should initialize riskList1 as empty array', () => {
      expect(component.riskList1).toEqual([]);
    });

    it('should initialize ObjectivesList as empty array', () => {
      expect(component.ObjectivesList).toEqual([]);
    });
  });

  describe('getRiskCategory1Name', () => {
    it('should return the title of the matching risk category', () => {
      component.riskList1 = [{ id: 1, title: 'Strategic' }];
      expect(component.getRiskCategory1Name(1)).toBe('Strategic');
    });

    it('should return empty string when id not found', () => {
      component.riskList1 = [];
      expect(component.getRiskCategory1Name(99)).toBe('');
    });
  });

  describe('getRiskCategory2Name', () => {
    it('should return the title for a matching level-2 risk', () => {
      component.allriskList2 = [{ id: 2, title: 'Operational' }];
      expect(component.getRiskCategory2Name(2)).toBe('Operational');
    });

    it('should return empty string when not found', () => {
      component.allriskList2 = [];
      expect(component.getRiskCategory2Name(99)).toBe('');
    });
  });

  describe('getRiskCategory3Name', () => {
    it('should return the title for a matching level-3 risk', () => {
      component.allriskList3 = [{ id: 3, title: 'Process Risk' }];
      expect(component.getRiskCategory3Name(3)).toBe('Process Risk');
    });

    it('should return empty string when not found', () => {
      component.allriskList3 = [];
      expect(component.getRiskCategory3Name(99)).toBe('');
    });
  });

  describe('determineIfMapped', () => {
    it('should mark all risks as not mapped when mappingData is empty', () => {
      component.riskList = [{ title: 'Risk A', description: '', risK_CATEGORY_LEVEL1: 0, risK_CATEGORY_LEVEL2: 0, risK_CATEGORY_LEVEL3: 0, risK_OWNER: '', id: 1 }];
      component.mappingData = [];
      component.determineIfMapped();
      expect(component.riskList[0].isMapped).toBe(false);
    });
  });

  describe('Service_GetObjectivesList', () => {
    it('should populate ObjectivesList on success', () => {
      mockAppService.getObjectivesList.and.returnValue(of([{ id: 1, title: 'Obj A', description: '' }]));
      component.Service_GetObjectivesList();
      expect(component.ObjectivesList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getObjectivesList.and.returnValue(throwError(() => new Error('error')));
      component.Service_GetObjectivesList();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
