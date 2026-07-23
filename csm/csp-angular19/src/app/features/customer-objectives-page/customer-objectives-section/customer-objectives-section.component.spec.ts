import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { CustomerObjectivesSectionComponent } from './customer-objectives-section.component';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { ScopeModel, modelRow, projectScopes } from '../../../models/scope.model';
import { ServiceAreaModelNew } from '../../../models/service-area.model';

const mockServiceAreas: ServiceAreaModelNew[] = [
  { id: 1, title: 'Cloud Services', description: 'Cloud infra', createD_BY: '', createD_DATE: new Date(), updateD_BY: '', updateD_DATE: new Date(), isactive: true, isMapped: false },
  { id: 2, title: 'DevOps', description: 'CI/CD pipelines', createD_BY: '', createD_DATE: new Date(), updateD_BY: '', updateD_DATE: new Date(), isactive: true, isMapped: false }
];

const mockInScopeDetails = [
  { id: 10, servicE_AREA_ID: 1, tools: 'Terraform', technology: 'AWS', projecT_ID: 'P001', cusT_ID: 'CUST01' },
  { id: 11, servicE_AREA_ID: 2, tools: 'Jenkins', technology: 'Docker', projecT_ID: 'P001', cusT_ID: 'CUST01' }
];

const mockScope: ScopeModel = Object.assign(new ScopeModel(), {
  id: 1,
  projecT_ID: 'P001',
  rag: 'Green',
  description: 'Project description',
  scope: 'Full delivery scope',
  objectives: 'Key objectives',
  deliverables: 'Key deliverables',
  inScope_Id: 5,
  serviceTower: 1,
  tools: 'Terraform',
  technologY_USED: 'AWS',
  constraints: 'Budget constraints',
  assumptions: 'Resource assumptions',
  ouT_SCOPE: 'Out-of-scope items'
});

describe('CustomerObjectivesSectionComponent', () => {
  let component: CustomerObjectivesSectionComponent;
  let fixture: ComponentFixture<CustomerObjectivesSectionComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;

  beforeEach(waitForAsync(() => {
    mockAppsService = {
      getProjectScopeByProjId: jasmine.createSpy('getProjectScopeByProjId').and.returnValue(of(mockScope)),
      getServiceAreaList: jasmine.createSpy('getServiceAreaList').and.returnValue(of(mockServiceAreas)),
      GetProjectInScope: jasmine.createSpy('GetProjectInScope').and.returnValue(of(mockInScopeDetails)),
      updateScope: jasmine.createSpy('updateScope').and.returnValue(of({})),
      DeleteInScope: jasmine.createSpy('DeleteInScope').and.returnValue(of({}))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    mockAccessControl = {};

    TestBed.configureTestingModule({
      imports: [
        CustomerObjectivesSectionComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerObjectivesSectionComponent);
    component = fixture.componentInstance;
    component.input_projectid = 'P001';
    component.input_customerid = 'CUST01';
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- ngOnInit / ngOnChanges -----------------------------------------------

  describe('ngOnInit', () => {
    it('should call ResetScope on init', () => {
      spyOn(component, 'ResetScope');
      fixture.detectChanges();
      expect(component.ResetScope).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should call ResetScope when input changes', () => {
      fixture.detectChanges();
      spyOn(component, 'ResetScope');
      component.ngOnChanges();
      expect(component.ResetScope).toHaveBeenCalled();
    });
  });

  // --- GetProjectScopeByProjId ----------------------------------------------

  describe('GetProjectScopeByProjId', () => {
    it('should populate selectedDatanew with scope data', () => {
      component.GetProjectScopeByProjId('P001');
      expect(mockAppsService.getProjectScopeByProjId).toHaveBeenCalledWith('P001');
      expect(component.selectedDatanew).toEqual(mockScope);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getProjectScopeByProjId.and.returnValue(throwError(() => new Error('fail')));
      component.GetProjectScopeByProjId('P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // --- Service_GetServiceAreaList -------------------------------------------

  describe('Service_GetServiceAreaList', () => {
    it('should populate ServiceAreaList', () => {
      component.Service_GetServiceAreaList();
      expect(mockAppsService.getServiceAreaList).toHaveBeenCalled();
      expect(component.ServiceAreaList.length).toBe(2);
      expect(component.ServiceAreaList[0].title).toBe('Cloud Services');
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getServiceAreaList.and.returnValue(throwError(() => new Error('fail')));
      component.Service_GetServiceAreaList();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // --- GetProjectInScope ----------------------------------------------------

  describe('GetProjectInScope', () => {
    beforeEach(() => {
      component.ServiceAreaList = mockServiceAreas;
    });

    it('should add rows to dataSource for matched service areas', () => {
      component.GetProjectInScope('P001');
      expect(mockAppsService.GetProjectInScope).toHaveBeenCalledWith('P001');
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should correctly map service tower title from ServiceAreaList', () => {
      component.GetProjectInScope('P001');
      expect(component.dataSource.data[0].ServiceTower).toBe('Cloud Services');
      expect(component.dataSource.data[1].ServiceTower).toBe('DevOps');
    });

    it('should not add row when service area is not found in list', () => {
      const unknownItem = [{ id: 20, servicE_AREA_ID: 99, tools: 'X', technology: 'Y', projecT_ID: 'P001', cusT_ID: 'CUST01' }];
      mockAppsService.GetProjectInScope.and.returnValue(of(unknownItem));
      component.dataSource.data = [];
      component.GetProjectInScope('P001');
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetProjectInScope.and.returnValue(throwError(() => new Error('fail')));
      component.GetProjectInScope('P001');
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // --- editRow --------------------------------------------------------------

  describe('editRow', () => {
    it('should set isEditing[rowIndex] to true and others to false', () => {
      component.dataSource.data = [
        { ID: 1, SERVICE_AREA_ID: 1, ServiceTower: 'Cloud', Tools: 'T1', Technology: 'AWS', Project_Id: 'P001', Cust_Id: 'CUST01' },
        { ID: 2, SERVICE_AREA_ID: 2, ServiceTower: 'DevOps', Tools: 'T2', Technology: 'Docker', Project_Id: 'P001', Cust_Id: 'CUST01' }
      ];
      component.editRow(component.dataSource.data[1]);
      expect(component.isEditing[0]).toBe(false);
      expect(component.isEditing[1]).toBe(true);
    });
  });

  // --- DeleteRow_onClick ----------------------------------------------------

  describe('DeleteRow_onClick', () => {
    let row: modelRow;

    beforeEach(() => {
      row = { ID: 10, SERVICE_AREA_ID: 1, ServiceTower: 'Cloud', Tools: 'Terraform', Technology: 'AWS', Project_Id: 'P001', Cust_Id: 'CUST01' };
      component.dataSource.data = [row];
    });

    it('should call DeleteInScope and remove row from dataSource on success', () => {
      mockMyUtility.showWarningConfirmation.and.returnValue({ afterClosed: () => of(true) });
      component.DeleteRow_onClick(row);
      expect(mockAppsService.DeleteInScope).toHaveBeenCalledWith(row);
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should call serviceError on delete failure', () => {
      mockMyUtility.showWarningConfirmation.and.returnValue({ afterClosed: () => of(true) });
      mockAppsService.DeleteInScope.and.returnValue(throwError(() => new Error('fail')));
      component.DeleteRow_onClick(row);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });

    it('should not call DeleteInScope when confirm returns false', () => {
      mockMyUtility.showWarningConfirmation.and.returnValue({ afterClosed: () => of(false) });
      mockAppsService.DeleteInScope.calls.reset();
      component.DeleteRow_onClick(row);
      expect(mockAppsService.DeleteInScope).not.toHaveBeenCalled();
    });
  });

  // --- AddInScope -----------------------------------------------------------

  describe('AddInScope', () => {
    beforeEach(() => {
      component.ServiceAreaList = mockServiceAreas;
      component.dataSource.data = [];
      component.selectedDatanew = { ...mockScope };
    });

    it('should add a new row to dataSource when valid inputs provided', () => {
      component.AddInScope(1, 'Terraform', 'AWS');
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].ServiceTower).toBe('Cloud Services');
    });

    it('should not add row when all inputs are empty/null/undefined', () => {
      component.AddInScope(null as any, '', undefined as any);
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should not add duplicate service tower', () => {
      component.dataSource.data = [
        { ID: 1, SERVICE_AREA_ID: 1, ServiceTower: 'Cloud Services', Tools: 'T', Technology: 'AWS', Project_Id: 'P001', Cust_Id: 'CUST01' }
      ];
      component.AddInScope(1, 'OtherTool', 'OtherTech');
      expect(component.dataSource.data.length).toBe(1);
    });

    it('should clear selectedDatanew fields after adding', () => {
      component.AddInScope(2, 'Jenkins', 'Docker');
      expect(component.selectedDatanew.tools).toBe('');
      expect(component.selectedDatanew.technologY_USED).toBe('');
    });
  });

  // --- ResetInscope ---------------------------------------------------------

  describe('ResetInscope', () => {
    it('should call Service_GetServiceAreaList and GetProjectInScope', () => {
      spyOn(component, 'Service_GetServiceAreaList');
      spyOn(component, 'GetProjectInScope');
      component.ResetInscope();
      expect(component.Service_GetServiceAreaList).toHaveBeenCalled();
      expect(component.GetProjectInScope).toHaveBeenCalledWith('P001');
    });

    it('should not call GetProjectInScope when input_projectid is empty', () => {
      component.input_projectid = '';
      spyOn(component, 'Service_GetServiceAreaList');
      spyOn(component, 'GetProjectInScope');
      component.ResetInscope();
      expect(component.GetProjectInScope).not.toHaveBeenCalled();
    });
  });

  // --- EditonClick ----------------------------------------------------------

  describe('EditonClick', () => {
    it('should set scope_edit to true and scope_read to false', () => {
      component.EditonClick();
      expect(component.scope_edit).toBe(true);
      expect(component.scope_read).toBe(false);
    });

    it('should clear dataSource.data', () => {
      component.dataSource.data = [
        { ID: 1, SERVICE_AREA_ID: 1, ServiceTower: 'Cloud', Tools: 'T', Technology: 'AWS', Project_Id: 'P001', Cust_Id: 'CUST01' }
      ];
      spyOn(component, 'ResetInscope');
      component.EditonClick();
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should call ResetInscope', () => {
      spyOn(component, 'ResetInscope');
      component.EditonClick();
      expect(component.ResetInscope).toHaveBeenCalled();
    });
  });

  // --- ResetScope -----------------------------------------------------------

  describe('ResetScope', () => {
    it('should set scope_read to true and scope_edit to false', () => {
      component.scope_edit = true;
      component.ResetScope();
      expect(component.scope_read).toBe(true);
      expect(component.scope_edit).toBe(false);
    });

    it('should clear selectedDatanew and dataSource', () => {
      component.selectedDatanew = mockScope;
      component.dataSource.data = [
        { ID: 1, SERVICE_AREA_ID: 1, ServiceTower: 'Cloud', Tools: 'T', Technology: 'AWS', Project_Id: 'P001', Cust_Id: 'CUST01' }
      ];
      spyOn(component, 'GetProjectScopeByProjId');
      spyOn(component, 'ResetInscope');
      component.ResetScope();
      expect(component.selectedDatanew).toBeNull();
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should call GetProjectScopeByProjId when input_projectid is set', () => {
      spyOn(component, 'GetProjectScopeByProjId');
      component.ResetScope();
      expect(component.GetProjectScopeByProjId).toHaveBeenCalledWith('P001');
    });

    it('should not call GetProjectScopeByProjId when input_projectid is empty', () => {
      component.input_projectid = '';
      spyOn(component, 'GetProjectScopeByProjId');
      component.ResetScope();
      expect(component.GetProjectScopeByProjId).not.toHaveBeenCalled();
    });
  });

  // --- SaveScope ------------------------------------------------------------

  describe('SaveScope', () => {
    beforeEach(() => {
      component.selectedDatanew = { ...mockScope };
      component.dataSource.data = [];
      localStorage.setItem('empid', 'EMP01');
    });

    afterEach(() => {
      localStorage.removeItem('empid');
    });

    it('should call updateScope with correct projectScopes model', () => {
      component.SaveScope();
      expect(mockAppsService.updateScope).toHaveBeenCalled();
      const call = mockAppsService.updateScope.calls.mostRecent().args[0] as projectScopes;
      expect(call.PROJECT_SCOPE.projecT_ID).toBe('P001');
      expect(call.PROJECT_SCOPE.description).toBe('Project description');
      expect(call.PROJECT_SCOPE.updateD_BY).toBe('EMP01');
    });

    it('should call ResetScope on success', () => {
      spyOn(component, 'ResetScope');
      component.SaveScope();
      expect(component.ResetScope).toHaveBeenCalled();
    });

    it('should call serviceError on save failure', () => {
      mockAppsService.updateScope.and.returnValue(throwError(() => new Error('fail')));
      component.SaveScope();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });

    it('should not call updateScope when description is empty', () => {
      component.selectedDatanew.description = '';
      component.SaveScope();
      expect(mockAppsService.updateScope).not.toHaveBeenCalled();
    });

    it('should not call updateScope when description is only special characters', () => {
      component.selectedDatanew.description = '!@#$%^&*()';
      component.SaveScope();
      expect(mockAppsService.updateScope).not.toHaveBeenCalled();
    });

    it('should not call updateScope when description is only numbers', () => {
      component.selectedDatanew.description = '1234567890';
      component.SaveScope();
      expect(mockAppsService.updateScope).not.toHaveBeenCalled();
    });
  });

  // --- onSelectionChange ----------------------------------------------------

  describe('onSelectionChange', () => {
    it('should set selectedServiceAreaToAdd to the provided value', () => {
      component.onSelectionChange(mockServiceAreas[0]);
      expect(component.selectedServiceAreaToAdd).toEqual(mockServiceAreas[0]);
    });
  });
});
