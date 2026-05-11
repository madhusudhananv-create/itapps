import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AchievementTrendComponent } from './achievement-trend.component';
import { AppsService } from '../../../../core/services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { DateSelectionModel } from '../../../../models/date-selection.model';

const mockChartData = {
  chart: { type: 'line' },
  title: { text: 'Achievement Trend' },
  series: [
    { name: 'Project Alpha', data: [80, 85, 90, 88, 92, 95] }
  ]
};

describe('AchievementTrendComponent', () => {
  let component: AchievementTrendComponent;
  let fixture: ComponentFixture<AchievementTrendComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockDialogRef: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      GetAchievementTrendByMonthLine: jasmine.createSpy('GetAchievementTrendByMonthLine')
        .and.returnValue(of(mockChartData))
    };

    mockMyUtility = {
      getMonthAbr: jasmine.createSpy('getMonthAbr').and.callFake((month: number) => {
        const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month + 1] || 'Dec';
      }),
      Month: jasmine.createSpy('Month').and.returnValue('Apr'),
      Year: jasmine.createSpy('Year').and.returnValue(2026),
      serviceError: jasmine.createSpy('serviceError')
    };

    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    TestBed.configureTestingModule({
      imports: [AchievementTrendComponent],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { custid: 'CUST01', projids: ['P001', 'P002'] }
        },
        provideHttpClient(),
        provideAnimations()
      ]
    })
    .overrideComponent(AchievementTrendComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementTrendComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set custId from dialog data', () => {
      fixture.detectChanges();
      expect(component.custId).toBe('CUST01');
    });

    it('should set projId to first element when projids is an array', () => {
      fixture.detectChanges();
      expect(component.projId).toBe('P001');
    });

    it('should set projId directly when projids is a string', () => {
      (component as any).data = { custid: 'CUST02', projids: 'P999' };
      component.ngOnInit();
      expect(component.projId).toBe('P999');
    });

    it('should not throw when data is undefined', () => {
      (component as any).data = undefined;
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should call setStartAndEndDate on init', () => {
      spyOn(component, 'setStartAndEndDate');
      fixture.detectChanges();
      expect(component.setStartAndEndDate).toHaveBeenCalledWith(component.DateSelection);
    });

    it('should call service_GetAchievementTrendByMonthLine on init', () => {
      spyOn(component, 'service_GetAchievementTrendByMonthLine');
      fixture.detectChanges();
      expect(component.service_GetAchievementTrendByMonthLine).toHaveBeenCalled();
    });
  });

  // ─── setStartAndEndDate ───────────────────────────────────────────────────

  describe('setStartAndEndDate', () => {
    it('should set endDate to current date', () => {
      const before = new Date();
      component.setStartAndEndDate(component.DateSelection);
      const after = new Date();
      expect(component.DateSelection.endDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(component.DateSelection.endDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should set startDate to 6 months before endDate', () => {
      component.setStartAndEndDate(component.DateSelection);
      const expectedStartMonth = (component.DateSelection.endDate.getMonth() - 6 + 12) % 12;
      expect(component.DateSelection.startDate.getMonth()).toBe(expectedStartMonth);
    });

    it('should call getMonthAbr for end month', () => {
      component.setStartAndEndDate(component.DateSelection);
      expect(mockMyUtility.getMonthAbr).toHaveBeenCalledWith(component.DateSelection.endDate.getMonth());
    });

    it('should call getMonthAbr for start month', () => {
      component.setStartAndEndDate(component.DateSelection);
      expect(mockMyUtility.getMonthAbr).toHaveBeenCalledWith(component.DateSelection.startDate.getMonth());
    });

    it('should set selectedEndYear to current year', () => {
      component.setStartAndEndDate(component.DateSelection);
      expect(component.DateSelection.selectedEndYear).toBe(new Date().getFullYear());
    });
  });

  // ─── service_GetAchievementTrendByMonthLine ───────────────────────────────

  describe('service_GetAchievementTrendByMonthLine', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call GetAchievementTrendByMonthLine with correct arguments', () => {
      expect(mockAppsService.GetAchievementTrendByMonthLine).toHaveBeenCalledWith(
        'CUST01',
        'P001',
        component.DateSelection.startDate,
        component.DateSelection.endDate
      );
    });

    it('should assign lineGraphData on success', () => {
      expect(component.lineGraphData).toEqual(mockChartData);
    });

    it('should fix chart type when backend returns 0 instead of "line"', () => {
      const dataWithBadType = { chart: { type: 0 }, series: [] };
      mockAppsService.GetAchievementTrendByMonthLine.and.returnValue(of(dataWithBadType));
      component.service_GetAchievementTrendByMonthLine();
      expect(component.lineGraphData.chart.type).toBe('line');
    });

    it('should fix chart type when backend returns null chart type', () => {
      const dataWithNullType = { chart: { type: null }, series: [] };
      mockAppsService.GetAchievementTrendByMonthLine.and.returnValue(of(dataWithNullType));
      component.service_GetAchievementTrendByMonthLine();
      expect(component.lineGraphData.chart.type).toBe('line');
    });

    it('should add chart object when missing from response', () => {
      const dataWithoutChart = { series: [{ name: 'Test', data: [1, 2, 3] }] };
      mockAppsService.GetAchievementTrendByMonthLine.and.returnValue(of(dataWithoutChart));
      component.service_GetAchievementTrendByMonthLine();
      expect(component.lineGraphData.chart).toEqual({ type: 'line' });
    });

    it('should set lineGraphData to null on error', () => {
      mockAppsService.GetAchievementTrendByMonthLine.and.returnValue(throwError(() => new Error('API error')));
      component.service_GetAchievementTrendByMonthLine();
      expect(component.lineGraphData).toBeNull();
    });

    it('should log error on failure', () => {
      spyOn(console, 'error');
      mockAppsService.GetAchievementTrendByMonthLine.and.returnValue(throwError(() => new Error('fail')));
      component.service_GetAchievementTrendByMonthLine();
      expect(console.error).toHaveBeenCalledWith('Error fetching achievement trend:', jasmine.any(Error));
    });
  });

  // ─── closePopup ───────────────────────────────────────────────────────────

  describe('closePopup', () => {
    it('should call dialogRef.close()', () => {
      fixture.detectChanges();
      component.closePopup();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  // ─── DateSelection ────────────────────────────────────────────────────────

  describe('DateSelection', () => {
    it('should be an instance of DateSelectionModel', () => {
      expect(component.DateSelection).toBeInstanceOf(DateSelectionModel);
    });
  });

  // ─── Highcharts ───────────────────────────────────────────────────────────

  describe('Highcharts', () => {
    it('should have Highcharts assigned', () => {
      fixture.detectChanges();
      expect(component.Highcharts).toBeDefined();
    });
  });
});

