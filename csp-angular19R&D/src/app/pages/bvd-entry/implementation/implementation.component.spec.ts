import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImplementationComponent } from './implementation.component';
import { BvdEntryService } from '../services/bvd-entry.service';
import { MyUtility } from '../../../shared/my-utility';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('ImplementationComponent', () => {
  let component: ImplementationComponent;
  let fixture: ComponentFixture<ImplementationComponent>;
  let mockBvdService: any;
  let mockUtil: any;

  beforeEach(waitForAsync(() => {
    mockBvdService = {
      ideA_ID: 7,
      isIdeaApproved: false,
      bvdimplementationschdules: [],
      resources: [],
      getIdeaStatus: jasmine.createSpy('getIdeaStatus').and.returnValue(of([])),
      getImplementationSchdule: jasmine.createSpy('getImplementationSchdule').and.returnValue(of([])),
      updateImplementationSchdule: jasmine.createSpy('updateImplementationSchdule').and.returnValue(of({ id: 1 })),
      deleteImplementationSchdule: jasmine.createSpy('deleteImplementationSchdule').and.returnValue(of({}))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarning: jasmine.createSpy('showWarning'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(false)
      })
    };

    TestBed.configureTestingModule({
      imports: [
        ImplementationComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BvdEntryService, useValue: mockBvdService },
        { provide: MyUtility, useValue: mockUtil },
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
    fixture = TestBed.createComponent(ImplementationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.iEditIndex).toBe(-1);
    expect(component.isLoading).toBe(false);
    expect(component.isComplete).toBe(false);
    expect(component.implementationSchdules).toEqual([]);
    expect(component.dataSource).toEqual([]);
  });

  it('should call getIdeaStatus on ngOnInit', () => {
    expect(mockBvdService.getIdeaStatus).toHaveBeenCalled();
  });

  it('should filter status to stagE_ID 5 only', () => {
    mockBvdService.getIdeaStatus.and.returnValue(of([
      { id: 1, stagE_ID: 1, title: 'Draft' },
      { id: 8, stagE_ID: 5, title: 'Completed' },
      { id: 9, stagE_ID: 5, title: 'In Progress' }
    ]));
    component.getIdeaStatus();
    expect(component.status.length).toBe(2);
    expect(component.status.every((s: any) => s.stagE_ID === 5)).toBe(true);
  });

  it('should call getSchdules when isIdeaApproved is true on ngOnChanges', () => {
    mockBvdService.isIdeaApproved = true;
    component.ngOnChanges();
    expect(mockBvdService.getImplementationSchdule).toHaveBeenCalledWith(7);
  });

  it('should not call getSchdules when isIdeaApproved is false on ngOnChanges', () => {
    mockBvdService.isIdeaApproved = false;
    mockBvdService.getImplementationSchdule.calls.reset();
    component.ngOnChanges();
    expect(mockBvdService.getImplementationSchdule).not.toHaveBeenCalled();
  });

  it('should not call getImplementationSchdule when ideA_ID is 0', () => {
    mockBvdService.ideA_ID = 0;
    mockBvdService.getImplementationSchdule.calls.reset();
    component.getSchdules(0);
    expect(mockBvdService.getImplementationSchdule).not.toHaveBeenCalled();
  });

  it('should populate implementationSchdules and dataSource after getSchdules', () => {
    const schedules = [
      { id: 1, ideA_STATUS_ID: 7 },
      { id: 2, ideA_STATUS_ID: 8, iscomplete: false }
    ] as any[];
    mockBvdService.getImplementationSchdule.and.returnValue(of(schedules));
    component.getSchdules(7);
    expect(component.implementationSchdules.length).toBe(2);
    expect(component.implementationSchdules[1].iscomplete).toBe(true);
  });

  it('should set isLoading=false on getSchdules error', () => {
    mockBvdService.getImplementationSchdule.and.returnValue(throwError(() => new Error('err')));
    component.getSchdules(7);
    expect(component.isLoading).toBe(false);
  });

  it('should return correct status title from getstatus', () => {
    component.status = [{ id: 8, title: 'Completed' }] as any[];
    expect(component.getstatus(8)).toBe('Completed');
  });

  it('should return empty string from getstatus when id not found', () => {
    component.status = [];
    expect(component.getstatus(99)).toBe('');
  });

  it('should set iEditIndex and populate dates on EditRow_onClick', () => {
    const row = {
      id: 1,
      actuaL_START_DATE: '2024-01-01',
      actuaL_END_DATE: '2024-06-30'
    } as any;
    component.EditRow_onClick(row, 0);
    expect(component.iEditIndex).toBe(0);
    expect(component.actualstartDate).not.toBeNull();
    expect(component.actualendDate).not.toBeNull();
  });

  it('should set iEditIndex to -1 and clear dates on CancelEdit_onClick', () => {
    component.iEditIndex = 2;
    component.actualstartDate = new Date();
    component.actualendDate = new Date();
    component.CancelEdit_onClick();
    expect(component.iEditIndex).toBe(-1);
    expect(component.actualstartDate).toBeNull();
    expect(component.actualendDate).toBeNull();
  });

  it('should refresh dataSource on refreshTable', () => {
    const data = [{ id: 1 }, { id: 2 }] as any[];
    component.refreshTable(data);
    expect(component.dataSource.length).toBe(2);
  });

  it('should return row count from getRowCount', () => {
    component.implementationSchdules = [{ id: 1 }, { id: 2 }] as any[];
    expect(component.getRowCount()).toBe(2);
  });

  it('should return null from getFormattedDate when date is null', () => {
    expect(component.getFormattedDate(null)).toBeNull();
  });

  it('should emit setStep(4) on setBack after delay', (done) => {
    spyOn(component.setStep, 'emit');
    component.setBack();
    setTimeout(() => {
      expect(component.setStep.emit).toHaveBeenCalledWith(4);
      done();
    }, 500);
  });
});
