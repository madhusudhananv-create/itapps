import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { RiskRepositoryComponent } from './risk-repository.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { SharedService } from '../../shared/shared.service';
import { AccessControl } from '../../shared/access-control';
import { provideHttpClient } from '@angular/common/http';

describe('RiskRepositoryComponent — standalone mode', () => {
  let component: RiskRepositoryComponent;
  let fixture: ComponentFixture<RiskRepositoryComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockSharedService: any;
  let mockAccessControl: any;
  let mockDialog: any;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      }),
      CopyObject: jasmine.createSpy('CopyObject').and.callFake((o: any) => JSON.parse(JSON.stringify(o))),
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.returnValue([])
    };

    mockAppService = {
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      GetAllRiskFromRepository: jasmine.createSpy('GetAllRiskFromRepository').and.returnValue(of([])),
      AddUpdateRiskRepo: jasmine.createSpy('AddUpdateRiskRepo').and.returnValue(of({})),
      DeleteRiskFromRepository: jasmine.createSpy('DeleteRiskFromRepository').and.returnValue(of({})),
      getRiskFromRepository: jasmine.createSpy('getRiskFromRepository').and.returnValue(of([])),
      addRiskList: jasmine.createSpy('addRiskList').and.returnValue(of({}))
    };

    mockSharedService = {
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.returnValue([])
    };

    mockAccessControl = {
      canEdit: jasmine.createSpy('canEdit').and.returnValue(true),
      canDelete: jasmine.createSpy('canDelete').and.returnValue(true),
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockActivatedRoute = {
      snapshot: { params: {} }
    };

    TestBed.configureTestingModule({
      imports: [RiskRepositoryComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient(),
        provideAnimations()
      ]
    });
    TestBed.overrideComponent(RiskRepositoryComponent, { set: { imports: [], template: '<div></div>' } });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in standalone mode', () => {
    expect(component).toBeTruthy();
  });

  it('should set isDialogMode to false when no MAT_DIALOG_DATA', () => {
    expect(component.isDialogMode).toBe(false);
  });

  it('should call GetServiceTower on init', () => {
    expect(mockAppService.getServiceAreaList).toHaveBeenCalled();
  });

  it('should call GetAllRiskFromRepository on init', () => {
    expect(mockAppService.GetAllRiskFromRepository).toHaveBeenCalled();
  });

  describe('GetServiceTower', () => {
    it('should populate serviceTowerList and ServiceAreaList on success', () => {
      const mockData = [{ id: 1, name: 'Tower A' }];
      mockAppService.getServiceAreaList.and.returnValue(of(mockData));
      component.GetServiceTower();
      expect(component.serviceTowerList.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.getServiceAreaList.and.returnValue(throwError(() => new Error('error')));
      component.GetServiceTower();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('GetAllRiskFromRepository', () => {
    it('should populate result on success', () => {
      const mockData = [{ id: 1, description: 'Risk A' }];
      mockAppService.GetAllRiskFromRepository.and.returnValue(of(mockData));
      component.GetAllRiskFromRepository();
      expect(component.result.length).toBe(1);
    });

    it('should call serviceError on failure', () => {
      mockAppService.GetAllRiskFromRepository.and.returnValue(throwError(() => new Error('error')));
      component.GetAllRiskFromRepository();
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('Edit_onClick', () => {
    it('should set editmode to true when flag is truthy', () => {
      component.Edit_onClick(1);
      expect(component.editmode).toBe(true);
    });

    it('should set editmode to true and isAddMode when flag is 0', () => {
      component.Edit_onClick(0);
      expect(component.editmode).toBe(true);
      expect(component.isAddMode).toBe(true);
    });
  });

  describe('EditRow_onClick', () => {
    it('should copy element into editItem', () => {
      const row = { id: 1, risK_DESCRIPTION: 'Risk X' };
      component.EditRow_onClick(row);
      expect(component.editItem.id).toBe(1);
    });

    it('should set editmode to true after EditRow_onClick', () => {
      const row = { id: 2, risK_DESCRIPTION: 'Risk Y' };
      component.EditRow_onClick(row);
      expect(component.editmode).toBe(true);
    });
  });

  describe('Cancel_onClick', () => {
    it('should reset editmode to false', () => {
      component.editmode = true;
      component.Cancel_onClick();
      expect(component.editmode).toBe(false);
    });
  });

  describe('SubmitForm', () => {
    it('should call AddUpdateRiskRepo when form is valid', () => {
      component.editItem = { id: 0, risK_DESCRIPTION: 'New Risk' };
      component.SubmitForm(true);
      expect(mockAppService.AddUpdateRiskRepo).toHaveBeenCalled();
    });

    it('should not call AddUpdateRiskRepo when form is invalid', () => {
      mockAppService.AddUpdateRiskRepo.calls.reset();
      component.SubmitForm(false);
      expect(mockAppService.AddUpdateRiskRepo).not.toHaveBeenCalled();
    });
  });

  describe('DeleteRow_onClick', () => {
    it('should call DeleteRiskFromRepository after confirmation', () => {
      const row = { id: 1, description: 'Risk A' };
      spyOn(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(true) } as any);
      component.DeleteRow_onClick(row);
      expect(mockAppService.DeleteRiskFromRepository).toHaveBeenCalled();
    });
  });

  describe('Filter_onChange', () => {
    it('should call ApplyCriteriaRange on filter change', () => {
      component.result = [{ id: 1 }] as any;
      component.Filter_onChange('filter text');
      expect(mockUtil.ApplyCriteriaRange).toHaveBeenCalled();
    });
  });

  describe('isAllSelected', () => {
    it('should return true when dataSource is empty and selection is empty', () => {
      component.selection.clear();
      component.dataSource.data = [];
      expect(component.isAllSelected()).toBe(true);
    });
  });

  describe('masterToggle', () => {
    it('should clear selection when all are selected', () => {
      component.dataSource.data = [{ id: 1 }] as any;
      component.selection.select(component.dataSource.data[0]);
      spyOn(component, 'isAllSelected').and.returnValue(true);
      component.masterToggle();
      expect(component.selection.selected.length).toBe(0);
    });

    it('should select all when not all are selected', () => {
      component.dataSource.data = [{ id: 1 }, { id: 2 }] as any;
      component.selection.clear();
      spyOn(component, 'isAllSelected').and.returnValue(false);
      component.masterToggle();
      expect(component.selection.selected.length).toBe(2);
    });
  });

  describe('displayedColumns', () => {
    it('should have standalone displayedColumns defined', () => {
      expect(component.displayedColumns).toContain('description');
    });
  });
});

describe('RiskRepositoryComponent — dialog mode', () => {
  let component: RiskRepositoryComponent;
  let fixture: ComponentFixture<RiskRepositoryComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockSharedService: any;
  let mockAccessControl: any;
  let mockDialogRef: any;
  let mockActivatedRoute: any;

  const dialogData = { CustomerId: 'C001', ProjectId: 'P001' };

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockAppService = {
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      GetAllRiskFromRepository: jasmine.createSpy('GetAllRiskFromRepository').and.returnValue(of([])),
      getRiskFromRepository: jasmine.createSpy('getRiskFromRepository').and.returnValue(of([{ id: 1, description: 'Repo Risk' }])),
      addRiskList: jasmine.createSpy('addRiskList').and.returnValue(of({}))
    };

    mockSharedService = {
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.returnValue([])
    };

    mockAccessControl = {
      canEdit: jasmine.createSpy('canEdit').and.returnValue(true),
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };

    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    mockActivatedRoute = {
      snapshot: { params: {} }
    };

    TestBed.configureTestingModule({
      imports: [RiskRepositoryComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient()
      ]
    });
    TestBed.overrideComponent(RiskRepositoryComponent, { set: { imports: [], template: '<div></div>' } });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in dialog mode', () => {
    expect(component).toBeTruthy();
  });

  it('should set isDialogMode to true when dialog data has CustomerId and ProjectId', () => {
    expect(component.isDialogMode).toBe(true);
  });

  it('should call getRiskFromRepository on init in dialog mode', () => {
    expect(mockAppService.getRiskFromRepository).toHaveBeenCalledWith('C001', 'P001');
  });

  it('should populate riskData on getRiskFromRepository success', () => {
    expect(component.riskData.length).toBe(1);
  });

  describe('AddRisk', () => {
    it('should not call addRiskList when nothing is selected', () => {
      component.selection.clear();
      component.AddRisk();
      expect(mockAppService.addRiskList).not.toHaveBeenCalled();
    });

    it('should call addRiskList when items are selected', () => {
      component.riskData = [{ id: 1, description: 'Risk A' }] as any;
      component.selection.select(component.riskData[0]);
      component.AddRisk();
      expect(mockAppService.addRiskList).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear selection on clear', () => {
      component.riskData = [{ id: 1 }] as any;
      component.selection.select(component.riskData[0]);
      component.clear();
      expect(component.selection.selected.length).toBe(0);
    });
  });

  describe('displayedColumnsDialog', () => {
    it('should have dialog displayedColumnsDialog defined', () => {
      expect(component.displayedColumnsDialog).toContain('riskDescription');
    });
  });
});
