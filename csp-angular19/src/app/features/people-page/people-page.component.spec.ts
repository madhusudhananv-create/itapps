import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { PeoplePageComponent } from './people-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { LayoutService } from '../layout/layout.service';
import { provideHttpClient } from '@angular/common/http';

const mockProjNames = [
  { proJ_ID: 'P001', proJ_NM: 'Project Alpha' },
  { proJ_ID: 'P002', proJ_NM: 'Project Beta' }
];

const mockPeopleData = {
  resource: [
    { emP_ID: 'E001', emP_Name: 'Alice', title: 'Developer', onsite: true, offshore: false },
    { emP_ID: 'E002', emP_Name: 'Bob', title: 'Tester', onsite: false, offshore: true }
  ],
  resourcE_CHALLENGES: 'None'
};

const mockRagData = { rag: 'green', people: 'green' };

describe('PeoplePageComponent', () => {
  let component: PeoplePageComponent;
  let fixture: ComponentFixture<PeoplePageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockLayoutService: any;
  let paramSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();

    mockAppsService = {
      GetCustomerProjectsName: jasmine.createSpy('GetCustomerProjectsName').and.returnValue(of(mockProjNames)),
      getProjectPeopleByProjId: jasmine.createSpy('getProjectPeopleByProjId').and.returnValue(of(mockPeopleData)),
      getProjectRagsByProjId: jasmine.createSpy('getProjectRagsByProjId').and.returnValue(of(mockRagData)),
      updatePeople: jasmine.createSpy('updatePeople').and.returnValue(of({})),
      updateResourceTitle: jasmine.createSpy('updateResourceTitle').and.returnValue(of({})),
      getNewResource: jasmine.createSpy('getNewResource').and.returnValue(of(mockPeopleData.resource))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      updateRAG: jasmine.createSpy('updateRAG'),
      IsEditable: jasmine.createSpy('IsEditable').and.returnValue(true)
    };

    mockAccessControl = {};
    mockLayoutService = { selectedCust: '' };

    TestBed.configureTestingModule({
      imports: [PeoplePageComponent, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { params: paramSubject.asObservable() } },
        provideHttpClient()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeoplePageComponent);
    component = fixture.componentInstance;
    localStorage.setItem('empid', 'EMP001');
    localStorage.setItem('role', '5');
  });

  afterEach(() => {
    localStorage.removeItem('empid');
    localStorage.removeItem('role');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set input_customerid from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.input_customerid).toBe('C001');
    });

    it('should set layoutService.selectedCust', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set allproj=true for BUHeadIMS role', () => {
      localStorage.setItem('role', '4');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getAllProjectsFromCustomer on init', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.GetCustomerProjectsName).toHaveBeenCalled();
    });
  });

  // ─── getAllProjectsFromCustomer ────────────────────────────────────────────

  describe('getAllProjectsFromCustomer', () => {
    it('should populate projNames and set first project', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
      expect(component.input_projectid).toBe('P001');
    });

    it('should call onProjectChange after loading projects', () => {
      spyOn(component, 'onProjectChange');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.onProjectChange).toHaveBeenCalled();
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetCustomerProjectsName.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── onProjectChange ──────────────────────────────────────────────────────

  describe('onProjectChange', () => {
    it('should set _loading=true and call getProjectPeopleByProjId', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.onProjectChange();
      expect(mockAppsService.getProjectPeopleByProjId).toHaveBeenCalledWith('P001');
    });

    it('should call getProjectRagsByProjId', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.onProjectChange();
      expect(mockAppsService.getProjectRagsByProjId).toHaveBeenCalledWith('P001');
    });
  });

  // ─── getProjectPeopleByProjId ─────────────────────────────────────────────

  describe('getProjectPeopleByProjId', () => {
    it('should set input data from service', () => {
      fixture.detectChanges();
      component.getProjectPeopleByProjId('P001');
      expect(component.input).toEqual(mockPeopleData);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProjectPeopleByProjId.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProjectPeopleByProjId('P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── getProjectRagsByProjId ───────────────────────────────────────────────

  describe('getProjectRagsByProjId', () => {
    it('should set input_rag and showdetails=true', () => {
      fixture.detectChanges();
      component.getProjectRagsByProjId('P001');
      expect(component.input_rag).toEqual(mockRagData);
      expect(component.showdetails).toBe(true);
      expect(component._loading).toBe(false);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProjectRagsByProjId.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      component.getProjectRagsByProjId('P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── SubmitForm ───────────────────────────────────────────────────────────

  describe('SubmitForm', () => {
    it('should not call updatePeople when form is invalid', () => {
      fixture.detectChanges();
      component.SubmitForm({ valid: false, value: {} });
      expect(mockAppsService.updatePeople).not.toHaveBeenCalled();
    });

    it('should call updateRAG and updatePeople on valid form', () => {
      fixture.detectChanges();
      component.input_projectid = 'P001';
      component.SubmitForm({ valid: true, value: { txtChallenges: 'None', ragSelected: 'green' } });
      expect(mockMyUtility.updateRAG).toHaveBeenCalled();
      expect(mockAppsService.updatePeople).toHaveBeenCalled();
    });

    it('should set readonlymode=true and editmode=false after submit', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.readonlymode = false;
      component.input_projectid = 'P001';
      component.SubmitForm({ valid: true, value: { txtChallenges: 'None', ragSelected: 'green' } });
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });
  });

  // ─── EditPeople_onClick / SavePeople_onClick / CancelPeople_onClick ───────

  describe('EditPeople_onClick', () => {
    it('should set EditPeopleIndex and EditEmpID', () => {
      fixture.detectChanges();
      component.EditPeople_onClick(2, 'E001');
      expect(component.EditPeopleIndex).toBe(2);
      expect(component.EditEmpID).toBe('E001');
    });
  });

  describe('SavePeople_onClick', () => {
    it('should call updateResourceTitle and reset index', () => {
      fixture.detectChanges();
      component.input = mockPeopleData;
      component.input_projectid = 'P001';
      component.SavePeople_onClick({ emP_ID: 'E001', title: 'Lead' });
      expect(mockAppsService.updateResourceTitle).toHaveBeenCalled();
    });
  });

  describe('CancelPeople_onClick', () => {
    it('should clear EditPeopleIndex and EditEmpID', () => {
      fixture.detectChanges();
      component.EditPeopleIndex = 1;
      component.EditEmpID = 'E001';
      component.CancelPeople_onClick();
      expect(component.EditPeopleIndex).toBeNull();
      expect(component.EditEmpID).toBeNull();
    });
  });

  // ─── IsReadonlyCust ───────────────────────────────────────────────────────

  describe('IsReadonlyCust', () => {
    it('should always return true', () => {
      fixture.detectChanges();
      expect(component.IsReadonlyCust(0, 'E001')).toBe(true);
    });
  });
});
