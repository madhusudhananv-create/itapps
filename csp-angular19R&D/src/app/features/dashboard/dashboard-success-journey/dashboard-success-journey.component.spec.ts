import { fakeAsync, tick, waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { DashboardSuccessJourneyComponent } from './dashboard-success-journey.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

const mockProjects = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha', cusT_NM: 'Customer One' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta',  cusT_NM: 'Customer One' }
];

const mockChartData = {
  chart: { type: 'line' },
  series: [{ name: 'Timeline', data: [] }]
};

describe('DashboardSuccessJourneyComponent', () => {
  let component: DashboardSuccessJourneyComponent;
  let fixture: ComponentFixture<DashboardSuccessJourneyComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      GetCustomerProjectsNameWithCustNM: jasmine.createSpy('GetCustomerProjectsNameWithCustNM').and.returnValue(of(mockProjects)),
      GetCustomerProjectsNameForClient: jasmine.createSpy('GetCustomerProjectsNameForClient').and.returnValue(of(mockProjects)),
      GetTimelineChart: jasmine.createSpy('GetTimelineChart').and.returnValue(of(mockChartData))
    };

    mockMyUtility = {
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(true),
      serviceError: jasmine.createSpy('serviceError')
    };

    TestBed.configureTestingModule({
      imports: [DashboardSuccessJourneyComponent],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        provideHttpClient()
      ]
    })
    .overrideComponent(DashboardSuccessJourneyComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSuccessJourneyComponent);
    component = fixture.componentInstance;
    component.custId = 'C001';
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call LoadProject on init', fakeAsync(() => {
      spyOn(component, 'LoadProject');
      fixture.detectChanges();
      tick(1);
      expect(component.LoadProject).toHaveBeenCalled();
    }));

    it('should call LoadTimelineChart on init', fakeAsync(() => {
      spyOn(component, 'LoadTimelineChart');
      fixture.detectChanges();
      tick(1);
      expect(component.LoadTimelineChart).toHaveBeenCalled();
    }));
  });

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should call LoadProject on change', () => {
      fixture.detectChanges();
      spyOn(component, 'LoadProject');
      component.ngOnChanges();
      expect(component.LoadProject).toHaveBeenCalled();
    });
  });

  // ─── LoadProject (GAVS) ───────────────────────────────────────────────────

  describe('LoadProject (GAVS user)', () => {
    beforeEach(() => {
      mockMyUtility.IsGAVS.and.returnValue(true);
    });

    it('should call GetCustomerProjectsNameWithCustNM for GAVS user', fakeAsync(() => {
      fixture.detectChanges();
      tick(1);
      expect(mockAppsService.GetCustomerProjectsNameWithCustNM).toHaveBeenCalledWith('C001', 'EMP01');
    }));

    it('should populate Projects array', fakeAsync(() => {
      fixture.detectChanges();
      tick(1);
      expect(component.Projects.length).toBe(2);
    }));

    it('should set projId to first project', fakeAsync(() => {
      fixture.detectChanges();
      tick(1);
      expect(component.projId).toBe('P001');
    }));

    it('should call serviceError on GAVS failure', () => {
      mockAppsService.GetCustomerProjectsNameWithCustNM.and.returnValue(throwError(() => new Error('fail')));
      component.LoadProject();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── LoadProject (Client) ─────────────────────────────────────────────────

  describe('LoadProject (Client user)', () => {
    beforeEach(() => {
      mockMyUtility.IsGAVS.and.returnValue(false);
    });

    it('should call GetCustomerProjectsNameForClient for non-GAVS user', () => {
      component.LoadProject();
      expect(mockAppsService.GetCustomerProjectsNameForClient).toHaveBeenCalledWith('C001', 'EMP01');
    });

    it('should populate Projects from client service', () => {
      component.LoadProject();
      expect(component.Projects.length).toBe(2);
    });

    it('should call serviceError on Client failure', () => {
      mockAppsService.GetCustomerProjectsNameForClient.and.returnValue(throwError(() => new Error('fail')));
      component.LoadProject();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── LoadTimelineChart ────────────────────────────────────────────────────

  describe('LoadTimelineChart', () => {
    it('should set chartOptions to undefined when projId is empty', () => {
      component.projId = '';
      component.LoadTimelineChart();
      expect(component.chartOptions).toBeUndefined();
    });

    it('should call Service_GetTimelineChart when projId is set', () => {
      component.projId = 'P001';
      spyOn(component, 'Service_GetTimelineChart');
      component.LoadTimelineChart();
      expect(component.Service_GetTimelineChart).toHaveBeenCalled();
    });

    it('should reset chartOptions to undefined before fetching', () => {
      component.projId = 'P001';
      component.chartOptions = { some: 'data' };
      component.LoadTimelineChart();
      // It gets reset then reassigned — just ensure Service_GetTimelineChart ran
      expect(mockAppsService.GetTimelineChart).toHaveBeenCalled();
    });
  });

  // ─── Service_GetTimelineChart ─────────────────────────────────────────────

  describe('Service_GetTimelineChart', () => {
    beforeEach(() => {
      component.projId = 'P001';
    });

    it('should call GetTimelineChart with correct params', () => {
      component.Service_GetTimelineChart();
      expect(mockAppsService.GetTimelineChart).toHaveBeenCalledWith(
        'C001', 'P001', component.pickerStartDate, component.pickerEndDate
      );
    });

    it('should assign chartOptions on success', () => {
      component.Service_GetTimelineChart();
      expect(component.chartOptions).toEqual(mockChartData);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetTimelineChart.and.returnValue(throwError(() => new Error('fail')));
      component.Service_GetTimelineChart();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── ddProject_onChange ───────────────────────────────────────────────────

  describe('ddProject_onChange', () => {
    it('should call LoadTimelineChart', () => {
      spyOn(component, 'LoadTimelineChart');
      component.ddProject_onChange();
      expect(component.LoadTimelineChart).toHaveBeenCalled();
    });
  });

  // ─── monthandyearpicker_onChange ──────────────────────────────────────────

  describe('monthandyearpicker_onChange', () => {
    it('should parse JSON string and set picker properties', () => {
      const event = JSON.stringify({
        Option: 'custom', Year: 2026,
        StartDate: '2026-01-01', EndDate: '2026-03-31'
      });
      component.monthandyearpicker_onChange(event);
      expect(component.pickerOption).toBe('custom');
      expect(component.pickerYear).toBe(2026);
    });

    it('should handle object input directly', () => {
      const event = { Option: 'monthly', Year: 2025, StartDate: null, EndDate: null };
      component.monthandyearpicker_onChange(event);
      expect(component.pickerOption).toBe('monthly');
      expect(component.pickerYear).toBe(2025);
    });

    it('should not throw when event is null', () => {
      expect(() => component.monthandyearpicker_onChange(null)).not.toThrow();
    });
  });
});
