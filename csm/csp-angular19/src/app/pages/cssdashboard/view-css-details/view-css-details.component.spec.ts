import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ViewCssDetailsComponent } from './view-css-details.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';

describe('ViewCssDetailsComponent', () => {
  let component: ViewCssDetailsComponent;
  let fixture: ComponentFixture<ViewCssDetailsComponent>;
  let mockAppService: any;
  let mockUtil: any;
  let mockDialogRef: any;

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getCSSViewDetails: jasmine.createSpy('getCSSViewDetails').and.returnValue(of({}))
    };

    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [
        ViewCssDetailsComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { cssInputs: new CssdashboardInputs() } },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCssDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component._loading).toBe(false);
    expect(component.projDisplayIndex).toBe(-1);
    expect(component.isExpanded).toBe(false);
  });

  it('should call getCSSViewDetails on ngOnInit when data is provided', () => {
    expect(mockAppService.getCSSViewDetails).toHaveBeenCalled();
  });

  it('should set cssViewDetailsData on successful getCSSViewDetails()', () => {
    const data = { frequencY_LIST: [], csaT_DETAILS: [] };
    mockAppService.getCSSViewDetails.and.returnValue(of(data));
    component.getCSSViewDetails();
    expect(component.cssViewDetailsData).toEqual(data);
    expect(component._loading).toBe(false);
  });

  it('should call serviceError on getCSSViewDetails failure', () => {
    mockAppService.getCSSViewDetails.and.returnValue(throwError(() => new Error('err')));
    component.getCSSViewDetails();
    expect(mockUtil.serviceError).toHaveBeenCalled();
    expect(component._loading).toBe(false);
  });

  it('should call dialogRef.close on onClose()', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should open a new window on openWin()', () => {
    spyOn(window, 'open');
    component.openWin('https://example.com');
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('should set projDisplayIndex on setProjectIndex() for a new index', () => {
    component.cssViewDetailsData = {
      csaT_DETAILS: [
        { isexpanded: false },
        { isexpanded: false }
      ]
    };
    component.projDisplayIndex = -1;
    component.setProjectIndex(0, null);
    expect(component.projDisplayIndex).toBe(0);
    expect(component.cssViewDetailsData.csaT_DETAILS[0].isexpanded).toBe(true);
  });

  it('should collapse row when same index is clicked again on setProjectIndex()', () => {
    component.cssViewDetailsData = {
      csaT_DETAILS: [
        { isexpanded: true }
      ]
    };
    component.projDisplayIndex = 0;
    component.setProjectIndex(0, null);
    expect(component.projDisplayIndex).toBe(-1);
    expect(component.cssViewDetailsData.csaT_DETAILS[0].isexpanded).toBe(false);
  });

  it('should return correct padding from getPaddingLeftPercentage() for single frequency with no data', () => {
    component.cssViewDetailsData = { frequencY_LIST: ['Q1'] };
    const result = component.getPaddingLeftPercentage(0, 0);
    expect(result).toBe(9);
  });

  it('should return 4 for multi-frequency with no action data', () => {
    component.cssViewDetailsData = { frequencY_LIST: ['Q1', 'Q2'] };
    const result = component.getPaddingLeftPercentage(0, 0);
    expect(result).toBe(4);
  });

  it('should return 7 for single frequency with action plans', () => {
    component.cssViewDetailsData = { frequencY_LIST: ['Q1'] };
    const result = component.getPaddingLeftPercentage(1, 0);
    expect(result).toBe(7);
  });

  it('should return 3 for multi-frequency with action plans', () => {
    component.cssViewDetailsData = { frequencY_LIST: ['Q1', 'Q2'] };
    const result = component.getPaddingLeftPercentage(2, 0);
    expect(result).toBe(3);
  });
});
