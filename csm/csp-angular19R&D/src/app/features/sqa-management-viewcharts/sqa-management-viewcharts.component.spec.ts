import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SqaManagementViewchartsComponent } from './sqa-management-viewcharts.component';
import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { SqaChartParamsWithFilterModel } from '../../models/sqa-project-reports-model';
import { provideHttpClient } from '@angular/common/http';

describe('SqaManagementViewchartsComponent', () => {
  let component: SqaManagementViewchartsComponent;
  let fixture: ComponentFixture<SqaManagementViewchartsComponent>;
  let mockUtil: any;
  let mockAppService: any;

  beforeEach(waitForAsync(() => {
    mockUtil = {
      serviceError: jasmine.createSpy('serviceError')
    };

    mockAppService = {
      GetProjectCharts: jasmine.createSpy('GetProjectCharts').and.returnValue(of([])),
      GetSQAChartsParams: jasmine.createSpy('GetSQAChartsParams').and.returnValue(of([])),
      GetSQAChartFromParams: jasmine.createSpy('GetSQAChartFromParams').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [SqaManagementViewchartsComponent],
      providers: [
        { provide: MyUtility, useValue: mockUtil },
        { provide: AppsService, useValue: mockAppService },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqaManagementViewchartsComponent);
    component = fixture.componentInstance;
    component.projId = 'P001';
    component.custId = 'C001';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call service_GetProjectCharts on init', () => {
      expect(mockAppService.GetProjectCharts).toHaveBeenCalledWith('P001');
    });
  });

  describe('ngOnChanges', () => {
    it('should call service_GetProjectCharts on input change', () => {
      mockAppService.GetProjectCharts.calls.reset();
      component.ngOnChanges();
      expect(mockAppService.GetProjectCharts).toHaveBeenCalled();
    });
  });

  describe('GenerateCharts_onClick', () => {
    it('should return false and alert when projId is empty', () => {
      component.projId = '';
      spyOn(window, 'alert');
      const result = component.GenerateCharts_onClick();
      expect(result).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });

    it('should return false and alert when starT_DATE or enD_DATE is undefined', () => {
      component.projId = 'P001';
      component.starT_DATE = undefined;
      component.enD_DATE = undefined;
      spyOn(window, 'alert');
      const result = component.GenerateCharts_onClick();
      expect(result).toBe(false);
    });

    it('should call service_GetSQAProjectCharts and return true when all inputs are valid', () => {
      component.projId = 'P001';
      component.starT_DATE = new Date(2024, 0, 1);
      component.enD_DATE = new Date(2024, 11, 31);
      const result = component.GenerateCharts_onClick();
      expect(result).toBe(true);
      expect(mockAppService.GetSQAChartsParams).toHaveBeenCalled();
    });
  });

  describe('ChartUsers_onChange', () => {
    beforeEach(() => {
      component.projectCharts = [
        { charT_USER: 'PROJECT', category: 'Process performance' } as any,
        { charT_USER: 'PROJECT', category: 'Find patterns' } as any,
        { charT_USER: 'SYSTEM', category: 'System Group' } as any
      ];
    });

    it('should reset selectedChartGroup and build lstChartGroups for the selected user', () => {
      component.ChartUsers_onChange('PROJECT');
      expect(component.lstChartGroups.length).toBe(2);
      expect(component.lstChartGroups).toContain('Process performance');
    });

    it('should remove duplicate groups', () => {
      component.projectCharts.push({ charT_USER: 'PROJECT', category: 'Process performance' } as any);
      component.ChartUsers_onChange('PROJECT');
      const processCount = component.lstChartGroups.filter(g => g === 'Process performance').length;
      expect(processCount).toBe(1);
    });

    it('should set filteredCharts to empty when no groups found', () => {
      component.projectCharts = [];
      component.ChartUsers_onChange('PROJECT');
      expect(component.filteredCharts.length).toBe(0);
    });

    it('should auto-select first group and call ChartGroups_onChange', () => {
      spyOn(component, 'ChartGroups_onChange').and.callThrough();
      component.ChartUsers_onChange('PROJECT');
      expect(component.ChartGroups_onChange).toHaveBeenCalled();
    });
  });

  describe('ChartGroups_onChange', () => {
    beforeEach(() => {
      component.projectCharts = [
        { charT_USER: 'PROJECT', category: 'Process performance' } as any,
        { charT_USER: 'SYSTEM', category: 'Find patterns' } as any
      ];
      component.selectedChartGroup = 'Process performance';
    });

    it('should filter charts matching the selected group', () => {
      component.ChartGroups_onChange('Process performance');
      expect(component.filteredCharts.length).toBe(1);
      expect(component.filteredCharts[0].category).toBe('Process performance');
    });
  });

  describe('Refresh_onClick', () => {
    it('should call service_GetProjectCharts with current projId', () => {
      mockAppService.GetProjectCharts.calls.reset();
      component.projId = 'P001';
      component.Refresh_onClick();
      expect(mockAppService.GetProjectCharts).toHaveBeenCalledWith('P001');
    });
  });

  describe('stopLoading', () => {
    it('should set _loadingCharts to false when iChartCurrent > iChartCount', () => {
      component._loadingCharts = true;
      component.iChartCount = 2;
      component.iChartCurrent = 3;
      component.stopLoading();
      expect(component._loadingCharts).toBe(false);
    });

    it('should keep _loadingCharts true when iChartCurrent <= iChartCount', () => {
      component._loadingCharts = true;
      component.iChartCount = 3;
      component.iChartCurrent = 2;
      component.stopLoading();
      expect(component._loadingCharts).toBe(true);
    });
  });

  describe('service_GetProjectCharts', () => {
    it('should populate projectCharts on success', () => {
      const mockCharts: SqaChartParamsWithFilterModel[] = [
        { id: 1, charT_USER: 'PROJECT', category: 'Process performance' } as any
      ];
      mockAppService.GetProjectCharts.and.returnValue(of(mockCharts));
      component.service_GetProjectCharts('P001');
      expect(component.projectCharts.length).toBe(1);
    });

    it('should call ChartUsers_onChange after loading charts', () => {
      spyOn(component, 'ChartUsers_onChange');
      mockAppService.GetProjectCharts.and.returnValue(of([]));
      component.service_GetProjectCharts('P001');
      expect(component.ChartUsers_onChange).toHaveBeenCalledWith(component.selectedChartUser);
    });

    it('should call serviceError on failure', () => {
      mockAppService.GetProjectCharts.and.returnValue(throwError(() => new Error('error')));
      component.service_GetProjectCharts('P001');
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });

  describe('service_GetSQAProjectCharts', () => {
    it('should reset chart counts and call GetSQAChartsParams', () => {
      component.service_GetSQAProjectCharts('P001', new Date(), new Date());
      expect(component.iChartCount).toBe(0);
      expect(mockAppService.GetSQAChartsParams).toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppService.GetSQAChartsParams.and.returnValue(throwError(() => new Error('error')));
      component.service_GetSQAProjectCharts('P001', new Date(), new Date());
      expect(mockUtil.serviceError).toHaveBeenCalled();
    });
  });
});
