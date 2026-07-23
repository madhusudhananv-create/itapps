import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError, Subject } from 'rxjs';

import { CustomerObjectivesPageComponent } from './customer-objectives-page.component';
import { AppsService } from '../../core/services/apps.service';
import { LayoutService } from '../layout/layout.service';
import { enumRoles } from '../../shared/enum';
import { ProjectsModel } from '../../models/projects.model';

const mockProjects: ProjectsModel[] = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

describe('CustomerObjectivesPageComponent', () => {
  let component: CustomerObjectivesPageComponent;
  let fixture: ComponentFixture<CustomerObjectivesPageComponent>;
  let mockAppsService: any;
  let mockLayoutService: any;
  let mockActivatedRoute: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjects)),
      getProjectScopeByProjId: jasmine.createSpy('getProjectScopeByProjId').and.returnValue(of([])),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of([])),
      GetProjectInScope: jasmine.createSpy('GetProjectInScope').and.returnValue(of([])),
      updateScope: jasmine.createSpy('updateScope').and.returnValue(of({})),
      DeleteInScope: jasmine.createSpy('DeleteInScope').and.returnValue(of({}))
    };

    mockLayoutService = {
      selectedCust: ''
    };

    mockActivatedRoute = {
      params: paramSubject.asObservable()
    };

    TestBed.configureTestingModule({
      imports: [CustomerObjectivesPageComponent],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerObjectivesPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set allproj to true for BUHeadIMS role', () => {
      localStorage.setItem('role', enumRoles.BUHeadIMS.toString());
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST01' });
      expect(component.allproj).toBe(true);
      localStorage.removeItem('role');
    });

    it('should set allproj to true for PMO role', () => {
      localStorage.setItem('role', enumRoles.PMO.toString());
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST01' });
      expect(component.allproj).toBe(true);
      localStorage.removeItem('role');
    });

    it('should set allproj to true for Quality role', () => {
      localStorage.setItem('role', enumRoles.Quality.toString());
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST01' });
      expect(component.allproj).toBe(true);
      localStorage.removeItem('role');
    });

    it('should leave allproj false for non-elevated role', () => {
      localStorage.setItem('role', '1');
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST01' });
      expect(component.allproj).toBe(false);
      localStorage.removeItem('role');
    });

    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST99' });
      expect(component.input_customerid).toBe('CUST99');
    });

    it('should update layoutService.selectedCust from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST99' });
      expect(mockLayoutService.selectedCust).toBe('CUST99');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      spyOn(component, 'getAllProjectsFromCustomer');
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST01' });
      expect(component.getAllProjectsFromCustomer).toHaveBeenCalled();
    });
  });

  describe('getAllProjectsFromCustomer', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'CUST01' });
    });

    it('should fetch projects and populate projNames', () => {
      expect(mockAppsService.GetCustomerProjectsName).toHaveBeenCalled();
      expect(component.projNames.length).toBe(2);
      expect(component.projNames[0].proJ_ID).toBe('P001');
    });

    it('should set input_projectid to first project proJ_ID', () => {
      expect(component.input_projectid).toBe('P001');
    });

    it('should not set input_projectid when projects list is empty', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(of([]));
      component.input_projectid = '';
      component.getAllProjectsFromCustomer();
      expect(component.input_projectid).toBe('');
    });

    it('should not set input_projectid when projects list is null', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(of(null));
      component.input_projectid = '';
      component.getAllProjectsFromCustomer();
      expect(component.input_projectid).toBe('');
    });

    it('should log error when service call fails', () => {
      spyOn(console, 'error');
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('Network error')));
      component.getAllProjectsFromCustomer();
      expect(console.error).toHaveBeenCalledWith('Error fetching projects:', jasmine.any(Error));
    });
  });
});
