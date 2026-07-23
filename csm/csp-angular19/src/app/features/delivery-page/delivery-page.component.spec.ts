import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Subject, of, throwError } from 'rxjs';

import { DeliveryPageComponent } from './delivery-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { enumRoles, enumDateRange } from '../../shared/enum';
import { ProjectsModel } from '../../models/projects-model';

const mockProjects: ProjectsModel[] = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' } as ProjectsModel,
  { proJ_ID: 'P002', proJ_NM: 'Project Beta'  } as ProjectsModel
];

const mockDeliveryData = {
  delivery: {
    lastweeK_ACHIEVED: 'Completed feature X',
    nextweeK_MILESTONE: 'Release v2',
    riskS_ISSUES: 'None',
    customeR_SUPPORT: 'N/A',
    rag: 'Green'
  },
  daterange: {
    startDate: new Date('2026-03-24'),
    endDate:   new Date('2026-03-30')
  }
};

describe('DeliveryPageComponent', () => {
  let component: DeliveryPageComponent;
  let fixture: ComponentFixture<DeliveryPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockLayoutService: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjects)),
      getDelivery: jasmine.createSpy('getDelivery').and.returnValue(of(mockDeliveryData)),
      getProjectTask: jasmine.createSpy('getProjectTask').and.returnValue(of([])),
      getProjectResourceByProjId: jasmine.createSpy('getProjectResourceByProjId').and.returnValue(of([])),
      GetSubProjects: jasmine.createSpy('GetSubProjects').and.returnValue(of([])),
      getSubProjectTaskResponsibilityList: jasmine.createSpy('getSubProjectTaskResponsibilityList').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      AppSettings: { token: 'mock-token' }
    };

    mockAccessControl = {};

    mockLayoutService = {
      selectedCust: '',
      selectedProj: ''
    };

    TestBed.configureTestingModule({
      imports: [DeliveryPageComponent, HttpClientTestingModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryPageComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP01');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
    localStorage.removeItem('role');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- ngOnInit -------------------------------------------------------------

  describe('ngOnInit', () => {
    it('should set allproj true for BUHeadIMS role', () => {
      localStorage.setItem('role', enumRoles.BUHeadIMS.toString());
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
    });

    it('should set allproj true for PMO role', () => {
      localStorage.setItem('role', enumRoles.PMO.toString());
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
    });

    it('should set allproj true for Quality role', () => {
      localStorage.setItem('role', enumRoles.Quality.toString());
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
    });

    it('should leave allproj false for non-elevated role', () => {
      localStorage.setItem('role', '1');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(false);
    });

    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_customerid).toBe('C001');
    });

    it('should set layoutService.selectedCust from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set input_projectid when projid is in params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001', projid: 'P001' });
      expect(component.input_projectid).toBe('P001');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      spyOn(component, 'getAllProjectsFromCustomer');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.getAllProjectsFromCustomer).toHaveBeenCalled();
    });
  });

  // --- getAllProjectsFromCustomer --------------------------------------------

  describe('getAllProjectsFromCustomer', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should populate projNames', () => {
      expect(component.projNames.length).toBe(2);
    });

    it('should set input_projectid to first project when no layout selectedProj', () => {
      mockLayoutService.selectedProj = '';
      component.getAllProjectsFromCustomer();
      expect(component.input_projectid).toBe('P001');
    });

    it('should use layout selectedProj when available', () => {
      mockLayoutService.selectedProj = 'P002';
      component.getAllProjectsFromCustomer();
      expect(component.input_projectid).toBe('P002');
    });

    it('should set showdetails to true when projects found', () => {
      component.getAllProjectsFromCustomer();
      expect(component.showdetails).toBe(true);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      component.getAllProjectsFromCustomer();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // --- LoadData -------------------------------------------------------------

  describe('LoadData', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.input_projectid = 'P001';
    });

    it('should call getDelivery with correct args', () => {
      component.LoadData(enumDateRange.Weekly);
      expect(mockAppsService.getDelivery).toHaveBeenCalledWith(
        'P001',
        jasmine.any(String),
        enumDateRange.Weekly
      );
    });

    it('should populate delivery fields from response', () => {
      component.LoadData(enumDateRange.Weekly);
      expect(component.input.delivery!.rag).toBe('Green');
      expect(component.input.delivery!.lastweeK_ACHIEVED).toBe('Completed feature X');
    });

    it('should set _loading to false on success', () => {
      component.LoadData(enumDateRange.Weekly);
      expect(component._loading).toBe(false);
    });

    it('should not call service when input_projectid is empty', () => {
      mockAppsService.getDelivery.calls.reset();
      component.input_projectid = '';
      component.LoadData(enumDateRange.Weekly);
      expect(mockAppsService.getDelivery).not.toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getDelivery.and.returnValue(throwError(() => new Error('fail')));
      component.LoadData(enumDateRange.Weekly);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // --- PreviousWeek / NextWeek ----------------------------------------------

  describe('PreviousWeek', () => {
    it('should call LoadData with PreviousWeek range', () => {
      spyOn(component, 'LoadData');
      component.PreviousWeek();
      expect(component.LoadData).toHaveBeenCalledWith(enumDateRange.PreviousWeek);
    });
  });

  describe('NextWeek', () => {
    it('should call LoadData with NextWeek range', () => {
      spyOn(component, 'LoadData');
      component.NextWeek();
      expect(component.LoadData).toHaveBeenCalledWith(enumDateRange.NextWeek);
    });
  });

  // --- Edit_onClick / Cancel_onClick ----------------------------------------

  describe('Edit_onClick', () => {
    it('should switch to edit mode', () => {
      component.Edit_onClick();
      expect(component.editmode).toBe(true);
      expect(component.readonlymode).toBe(false);
    });
  });

  describe('Cancel_onClick', () => {
    it('should switch to readonly mode', () => {
      component.editmode = true;
      component.readonlymode = false;
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  // --- Save_onClick ---------------------------------------------------------

  describe('Save_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.input_projectid = 'P001';
    });

    it('should alert when rag is empty', () => {
      spyOn(window, 'alert');
      component.Save_onClick('', 'done', 'milestone', 'none', 'n/a');
      expect(window.alert).toHaveBeenCalledWith('Please select RAG');
    });

    it('should set delivery properties and switch to readonly on valid save', () => {
      component.Save_onClick('Green', 'done', 'milestone', 'none', 'n/a');
      expect(component.input.delivery!.rag).toBe('Green');
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  // --- onValChange ---------------------------------------------------------

  describe('onValChange', () => {
    it('should show 4 Quadrant view when "4Quadrant" is selected', () => {
      component.onValChange('4Quadrant');
      expect(component.bShow4Quadrant).toBe(true);
      expect(component.selectedOption).toBe('4Quadrant');
    });

    it('should hide 4 Quadrant view for other options', () => {
      component.bShow4Quadrant = true;
      component.onValChange('Task');
      expect(component.bShow4Quadrant).toBe(false);
      expect(component.selectedOption).toBe('Task');
    });
  });
});
