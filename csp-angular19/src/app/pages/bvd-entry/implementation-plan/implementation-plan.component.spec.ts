import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImplementationPlanComponent } from './implementation-plan.component';
import { BvdEntryService } from '../services/bvd-entry.service';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('ImplementationPlanComponent', () => {
  let component: ImplementationPlanComponent;
  let fixture: ComponentFixture<ImplementationPlanComponent>;
  let mockBvdService: any;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialog: any;

  beforeEach(waitForAsync(() => {
    mockBvdService = {
      ideA_ID: 8,
      projecT_ID: 'P1',
      bvdimplementationschdules: [],
      resources: [],
      isIdeaSubmitted: false,
      currentStep: 2,
      bvdidea: { ideA_STATUS_ID: 1 },
      submitIdea: jasmine.createSpy('submitIdea').and.returnValue(of({})),
      saveIdeaImplementationDetails: jasmine.createSpy('saveIdeaImplementationDetails').and.returnValue(of({ id: 1, milestone: 'M1' })),
      deleteImplementationSchdule: jasmine.createSpy('deleteImplementationSchdule').and.returnValue(of({})),
      getIdeaStages: jasmine.createSpy('getIdeaStages').and.returnValue(of([]))
    };

    mockAppService = {
      getProjectResourceByProjId: jasmine.createSpy('getProjectResourceByProjId').and.returnValue(of([])),
      getEmpInfo: jasmine.createSpy('getEmpInfo').and.returnValue(of([]))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showError: jasmine.createSpy('showError')
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(false)
      }),
      openDialogs: [],
      afterOpened: new Subject(),
      afterAllClosed: new Subject(),
      _getAfterAllClosed: () => new Subject(),
      _afterAllClosed: new Subject()
    };

    TestBed.configureTestingModule({
      imports: [
        ImplementationPlanComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BvdEntryService, useValue: mockBvdService },
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'empid') return 'emp001';
      if (key === 'token') return 'test-token';
      return null;
    });
    fixture = TestBed.createComponent(ImplementationPlanComponent);
    component = fixture.componentInstance;
    component.projectId = 'P1'; // Set projectId so getProjectResource is called
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.isSubmitted).toBe(false);
    expect(component._edit).toBe(false);
    expect(component.scheduleExpanded).toBe(true);
    expect(component.implementationSchdules).toEqual([]);
    expect(component.estStartDate).toBeNull();
    expect(component.estEndDate).toBeNull();
  });

  it('should call getProjectResource on ngOnInit', () => {
    expect(mockAppService.getProjectResourceByProjId).toHaveBeenCalled();
  });

  it('should not call getProjectResourceByProjId when projectId is empty', () => {
    mockAppService.getProjectResourceByProjId.calls.reset();
    component.projectId = '';
    component.getProjectResource();
    expect(mockAppService.getProjectResourceByProjId).not.toHaveBeenCalled();
  });

  it('should load resources from getProjectResourceByProjId', () => {
    const resources = [{ id: 1, name: 'Alice' }];
    mockAppService.getProjectResourceByProjId.and.returnValue(of(resources));
    component.projectId = 'P2';
    component.getProjectResource();
    expect(mockBvdService.resources).toEqual(resources);
  });

  it('should set resources to empty on getProjectResource error', () => {
    mockAppService.getProjectResourceByProjId.and.returnValue(throwError(() => new Error('err')));
    component.projectId = 'P2';
    component.getProjectResource();
    expect(mockBvdService.resources).toEqual([]);
  });

  it('should warn when no milestones on submitForm', () => {
    component.implementationSchdules = [];
    component.submitForm('submit');
    expect(mockUtil.showWarning).toHaveBeenCalled();
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should warn when milestone fields are invalid on submitForm', () => {
    component.implementationSchdules = [{ milestone: '', estimateD_EFFORTS: null, responsible: null, estimateD_START_DATE: null, estimateD_TARGET_DATE: null } as any];
    component.submitForm('submit');
    expect(mockUtil.showWarning).toHaveBeenCalled();
  });

  it('should open confirmation dialog when all milestones are valid', () => {
    const dialogSpy = spyOn<any>(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(false)
    });
    component.implementationSchdules = [{
      id: 1, milestone: 'M1', estimateD_EFFORTS: 8, responsible: 'Alice',
      estimateD_START_DATE: '2024-01-01', estimateD_TARGET_DATE: '2024-06-30'
    } as any];
    component.submitForm('submit');
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should warn when milestone is empty on saveSchdule', () => {
    component.implementationPlan.milestone = '';
    component.saveSchdule();
    expect(mockUtil.showWarning).toHaveBeenCalled();
    expect(mockBvdService.saveIdeaImplementationDetails).not.toHaveBeenCalled();
  });

  it('should call saveIdeaImplementationDetails when milestone is valid', () => {
    component.implementationPlan.milestone = 'Deploy feature';
    mockBvdService.saveIdeaImplementationDetails.and.returnValue(of({ id: 1, milestone: 'Deploy feature' }));
    component.saveSchdule();
    expect(mockBvdService.saveIdeaImplementationDetails).toHaveBeenCalled();
  });

  it('should add saved schedule to implementationSchdules list', () => {
    component.implementationPlan.milestone = 'New milestone';
    mockBvdService.saveIdeaImplementationDetails.and.returnValue(of({ id: 99, milestone: 'New milestone' }));
    component.saveSchdule();
    expect(component.implementationSchdules.some((s: any) => s.id === 99)).toBe(true);
  });

  it('should update existing schedule entry on saveSchdule', () => {
    component.implementationSchdules = [{ id: 5, milestone: 'Old milestone' } as any];
    component.implementationPlan.milestone = 'Updated milestone';
    mockBvdService.saveIdeaImplementationDetails.and.returnValue(of({ id: 5, milestone: 'Updated milestone' }));
    component.saveSchdule();
    expect(component.implementationSchdules[0].milestone).toBe('Updated milestone');
  });

  it('should set _edit=false and reset plan on cancelUpdate', () => {
    component._edit = true;
    component.cancelUpdate();
    expect(component._edit).toBe(false);
    expect(component.estStartDate).toBeNull();
    expect(component.estEndDate).toBeNull();
  });

  it('should set _edit=true and populate dates on editRow', () => {
    const rec = { id: 1, milestone: 'M1', estimateD_START_DATE: '2024-01-01', estimateD_TARGET_DATE: '2024-06-30' } as any;
    component.editRow(rec);
    expect(component._edit).toBe(true);
    expect(component.estStartDate).not.toBeNull();
    expect(component.estEndDate).not.toBeNull();
  });

  it('should emit setStep(1) on setBack', () => {
    spyOn(component.setStep, 'emit');
    component.setBack();
    expect(component.setStep.emit).toHaveBeenCalledWith(1);
  });

  it('should call getIdeaStages and emit setStep(3) on setNext success', () => {
    spyOn(component.setStep, 'emit');
    mockBvdService.getIdeaStages.and.returnValue(of([]));
    component.setNext();
    expect(component.setStep.emit).toHaveBeenCalledWith(3);
  });

  it('should call deleteImplementationSchdule via deleteRow when dialog confirms', () => {
    const dialogSpy = spyOn<any>(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true)
    });
    const rec = { id: 3, milestone: 'M3' } as any;
    component.implementationSchdules = [rec];
    component.deleteRow(rec);
    expect(dialogSpy).toHaveBeenCalled();
    expect(mockBvdService.deleteImplementationSchdule).toHaveBeenCalledWith(3);
  });

  it('should not call deleteImplementationSchdule when dialog is cancelled', () => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(false) });
    const rec = { id: 3, milestone: 'M3' } as any;
    component.deleteRow(rec);
    expect(mockBvdService.deleteImplementationSchdule).not.toHaveBeenCalled();
  });

  it('should refresh table datasource on refreshTable', () => {
    const data = [{ id: 1 }, { id: 2 }] as any[];
    component.refreshTable(data);
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should call submitIdea on submitIdea method', () => {
    mockBvdService.submitIdea.and.returnValue(of({}));
    component.submitIdea();
    expect(mockBvdService.submitIdea).toHaveBeenCalledWith(8);
    expect(mockBvdService.isIdeaSubmitted).toBe(true);
  });
});
