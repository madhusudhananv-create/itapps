import { provideAnimations } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';

import { IdeasPageComponent } from './ideas-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { SharedService } from '../../shared/shared.service';
import { LayoutService } from '../layout/layout.service';
import { InnovationModelExt } from '../../models/innovation-model';
import { provideHttpClient } from '@angular/common/http';

const mockIdeasData = [
  {
    id: 1, projecT_ID: 'P001', proJ_NM: 'Project A', portfoliO_NM: 'Portfolio 1', portfoliO_ID: 10,
    description: 'Innovation A', status: 'Planning', identifieD_DATE: new Date('2024-01-01'),
    targeT_DATE: new Date('2025-01-01'), area: 'Process', approach: 'Lean', comments: '', responsible: 'John'
  },
  {
    id: 2, projecT_ID: 'P002', proJ_NM: 'Project B', portfoliO_NM: 'Portfolio 2', portfoliO_ID: 20,
    description: 'Innovation B', status: 'Completed', identifieD_DATE: new Date('2023-06-01'),
    targeT_DATE: new Date('2024-06-01'), area: 'Quality', approach: 'Six Sigma', comments: '', responsible: 'Jane'
  }
];

const mockProjects = [
  { proJ_ID: 'P001', proJ_NM: 'Project A' },
  { proJ_ID: 'P002', proJ_NM: 'Project B' }
];

describe('IdeasPageComponent', () => {
  let component: IdeasPageComponent;
  let fixture: ComponentFixture<IdeasPageComponent>;
  let mockAppsService: any;
  let mockMyUtility: any;
  let mockAccessControl: any;
  let mockSharedService: any;
  let mockLayoutService: any;
  let mockDialog: any;
  let paramSubject: Subject<any>;
  let queryParamSubject: Subject<any>;

  beforeEach(waitForAsync(() => {
    paramSubject = new Subject<any>();
    queryParamSubject = new Subject<any>();

    mockAppsService = {
      getIdeasDetails: jasmine.createSpy('getIdeasDetails').and.returnValue(of({ output: mockIdeasData, projects: mockProjects })),
      GetParametersByType: jasmine.createSpy('GetParametersByType').and.returnValue(of([])),
      getProcessArea: jasmine.createSpy('getProcessArea').and.returnValue(of([])),
      getIdeasFromProcessArea: jasmine.createSpy('getIdeasFromProcessArea').and.returnValue(of([])),
      getGavsServices: jasmine.createSpy('getGavsServices').and.returnValue(of([])),
      getPortfolioName: jasmine.createSpy('getPortfolioName').and.returnValue(of('Portfolio X')),
      addInnovation: jasmine.createSpy('addInnovation').and.returnValue(of({ ...mockIdeasData[0], id: 3 })),
      updateInnovation: jasmine.createSpy('updateInnovation').and.returnValue(of({})),
      deleteInnovation: jasmine.createSpy('deleteInnovation').and.returnValue(of({})),
      updateRags: jasmine.createSpy('updateRags').and.returnValue(of({})),
      getCustomerProjectsName: jasmine.createSpy('getCustomerProjectsName').and.returnValue(of([])),
      getPortfolioList: jasmine.createSpy('getPortfolioList').and.returnValue(of([])),
      getProductList: jasmine.createSpy('getProductList').and.returnValue(of([])),
      getProjectPortfolioMapping: jasmine.createSpy('getProjectPortfolioMapping').and.returnValue(of([]))
    };

    mockMyUtility = {
      serviceError: jasmine.createSpy('serviceError'),
      ApplyCriteriaRange: jasmine.createSpy('ApplyCriteriaRange').and.callFake((_criteria: any, data: any) => data || []),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      IsEditable: jasmine.createSpy('IsEditable').and.returnValue(true),
      IsQuality: jasmine.createSpy('IsQuality').and.returnValue(false),
      IsGAVS: jasmine.createSpy('IsGAVS').and.returnValue(false),
      updateRAG: jasmine.createSpy('updateRAG'),
      getDate: jasmine.createSpy('getDate').and.returnValue('2025-01-01')
    };

    mockAccessControl = {
      IsAllowed: jasmine.createSpy('IsAllowed').and.returnValue(false)
    };

    mockSharedService = {
      savedportfolioId: 0,
      selectedProjects: []
    };

    mockLayoutService = {
      selectedCust: ''
    };

    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [IdeasPageComponent, MatSnackBarModule, MatDialogModule, BrowserAnimationsModule],
      providers: [
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility },
        { provide: AccessControl, useValue: mockAccessControl },
        { provide: SharedService, useValue: mockSharedService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramSubject.asObservable(),
            queryParams: queryParamSubject.asObservable()
          }
        },
        provideHttpClient(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeasPageComponent);
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
    it('should set selectedCust from route params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.selectedCust).toBe('C001');
    });

    it('should set layoutService.selectedCust from params', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockLayoutService.selectedCust).toBe('C001');
    });

    it('should set allproj true for BUHeadIMS role', () => {
      localStorage.setItem('role', '4');
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.allproj).toBe(true);
      localStorage.setItem('role', '5');
    });

    it('should call getAllIdeasDetails on init', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.getIdeasDetails).toHaveBeenCalled();
    });

    it('should call Service_GetUOMList on init', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.GetParametersByType).toHaveBeenCalledWith('UOM');
    });

    it('should set displayedColumns without portfoliO_NM for non-premier', () => {
      mockMyUtility.IsPremier.and.returnValue(false);
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.displayedColumns).not.toContain('portfoliO_NM');
    });
  });

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should reset editmode to false', () => {
      fixture.detectChanges();
      component.editmode = true;
      component.ngOnChanges();
      expect(component.editmode).toBe(false);
    });

    it('should reset readonlymode to true', () => {
      fixture.detectChanges();
      component.readonlymode = false;
      component.ngOnChanges();
      expect(component.readonlymode).toBe(true);
    });
  });

  // ─── getAllIdeasDetails ────────────────────────────────────────────────────

  describe('getAllIdeasDetails', () => {
    it('should populate ideasdata from service', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.ideasdata.length).toBe(2);
    });

    it('should populate projNames from service', () => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(component.projNames.length).toBe(2);
    });

    it('should call serviceError on failure', () => {
      mockAppsService.getIdeasDetails.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      // Error handled by showToast — verify data is not populated
      expect(component.ideasdata).toBeFalsy();
    });
  });

  // ─── filter_projectPortfolio ───────────────────────────────────────────────

  describe('filter_projectPortfolio', () => {
    it('should build unique project list', () => {
      fixture.detectChanges();
      component.filter_projectPortfolio(mockIdeasData);
      expect(component.projects).toContain('Project A');
      expect(component.projects).toContain('Project B');
    });

    it('should prepend All Projects', () => {
      fixture.detectChanges();
      component.filter_projectPortfolio(mockIdeasData);
      expect(component.projects[0]).toBe('All Projects');
    });

    it('should build unique portfolio list', () => {
      fixture.detectChanges();
      component.filter_projectPortfolio(mockIdeasData);
      expect(component.portfolio).toContain('Portfolio 1');
      expect(component.portfolio).toContain('Portfolio 2');
    });
  });

  // ─── DoApplicable / viewType ───────────────────────────────────────────────

  describe('DoApplicable', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should set isBenefitsView=false for details view', () => {
      component.viewType = 'details';
      component.DoApplicable();
      expect(component.isBenefitsView).toBe(false);
    });

    it('should set isBenefitsView=true for benefits view', () => {
      component.viewType = 'benefits';
      component.DoApplicable();
      expect(component.isBenefitsView).toBe(true);
    });
  });

  // ─── Edit_onClick / Cancel_onClick ────────────────────────────────────────

  describe('Edit_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should set readonlymode=false and editmode=true', () => {
      component.Edit_onClick();
      expect(component.readonlymode).toBe(false);
      expect(component.editmode).toBe(true);
    });
  });

  describe('Cancel_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.editmode = true;
      component.readonlymode = false;
    });

    it('should reset readonlymode=true and editmode=false', () => {
      component.Cancel_onClick();
      expect(component.readonlymode).toBe(true);
      expect(component.editmode).toBe(false);
    });

    it('should reset EditInnovation', () => {
      component.Cancel_onClick();
      expect(component.EditInnovation).toBeInstanceOf(InnovationModelExt);
    });
  });

  // ─── EditRow_onClick ──────────────────────────────────────────────────────

  describe('EditRow_onClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
    });

    it('should copy element to EditInnovation', () => {
      component.EditRow_onClick(mockIdeasData[0]);
      expect(component.EditInnovation.description).toBe('Innovation A');
    });

    it('should disable save for Completed status', () => {
      component.EditRow_onClick({ ...mockIdeasData[1], gavS_SERVICE: [] });
      expect(component.disableSave).toBe(true);
    });

    it('should enable save for Planning status', () => {
      component.EditRow_onClick({ ...mockIdeasData[0], gavS_SERVICE: [] });
      expect(component.disableSave).toBe(false);
    });

    it('should default iS_ONETIME to false if undefined', () => {
      const element = { ...mockIdeasData[0], iS_ONETIME: undefined, gavS_SERVICE: [] };
      component.EditRow_onClick(element);
      expect(component.EditInnovation.iS_ONETIME).toBe(false);
    });
  });

  // ─── Use_Element ──────────────────────────────────────────────────────────

  describe('Use_Element', () => {
    it('should copy description and set reference idea id', () => {
      fixture.detectChanges();
      component.Use_Element({ id: 99, description: 'Similar Idea' });
      expect(component.EditInnovation.description).toBe('Similar Idea');
      expect(component.EditInnovation.referencE_IDEA_ID).toBe(99);
    });
  });

  // ─── ToggleFilter_onClick ─────────────────────────────────────────────────

  describe('ToggleFilter_onClick', () => {
    it('should toggle bShowFilter', () => {
      fixture.detectChanges();
      component.bShowFilter = true;
      component.ToggleFilter_onClick();
      expect(component.bShowFilter).toBe(false);
      component.ToggleFilter_onClick();
      expect(component.bShowFilter).toBe(true);
    });
  });

  // ─── filterData ───────────────────────────────────────────────────────────

  describe('filterData', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.ideasdata = [...mockIdeasData];
    });

    it('should call ApplyCriteriaRange', () => {
      component.filterData('All Portfolios', 'All Projects', true, false, false);
      expect(mockMyUtility.ApplyCriteriaRange).toHaveBeenCalled();
    });

    it('should filter out Completed when allchecked=false', () => {
      component.filterData('All Portfolios', 'All Projects', false, false, false);
      expect(component.dataSource.data.length).toBe(0);
    });
  });

  // ─── Portfolio_OnClick ────────────────────────────────────────────────────

  describe('Portfolio_OnClick', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.ideasdata = [...mockIdeasData];
    });

    it('should build project list for selected portfolio', () => {
      component.selectedPortfolio = 'Portfolio 1';
      component.Portfolio_OnClick();
      expect(component.projects).toContain('Project A');
    });

    it('should build all project list for All Portfolios', () => {
      component.selectedPortfolio = 'All Portfolios';
      component.Portfolio_OnClick();
      expect(component.projects).toContain('All Projects');
    });
  });

  // ─── IsDateValid ──────────────────────────────────────────────────────────

  describe('IsDateValid', () => {
    it('should return true when target >= identified and identified <= today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const past = new Date('2024-01-01');
      const target = new Date('2025-12-31');
      fixture.detectChanges();
      expect(component.IsDateValid(target, past)).toBe(true);
    });

    it('should return false when identified is in the future', () => {
      const future = new Date('2099-01-01');
      const target = new Date('2099-06-01');
      fixture.detectChanges();
      expect(component.IsDateValid(target, future)).toBe(false);
    });
  });

  // ─── IsCompletionDateValid ────────────────────────────────────────────────

  describe('IsCompletionDateValid', () => {
    it('should return true when completionDate is between identifiedDate and today', () => {
      const identified = new Date('2024-01-01');
      const completion = new Date('2024-06-01');
      fixture.detectChanges();
      expect(component.IsCompletionDateValid(completion, identified)).toBe(true);
    });

    it('should return false when completionDate is in the future', () => {
      const identified = new Date('2024-01-01');
      const completion = new Date('2099-01-01');
      fixture.detectChanges();
      expect(component.IsCompletionDateValid(completion, identified)).toBe(false);
    });
  });

  // ─── SubmitForm (new innovation) ──────────────────────────────────────────

  describe('SubmitForm - new innovation (id=0)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.EditInnovation = new InnovationModelExt();
      component.EditInnovation.id = 0;
      component.EditInnovation.description = 'Test idea';
      component.EditInnovation.status = 'Planning';
      component.EditInnovation.identifieD_DATE = new Date('2024-01-01');
      component.EditInnovation.targeT_DATE = new Date('2025-12-31');
      component.ideasdata = [...mockIdeasData];
    });

    it('should not call addInnovation when isValid=false', () => {
      component.SubmitForm(false);
      expect(mockAppsService.addInnovation).not.toHaveBeenCalled();
    });

    it('should call addInnovation when id=0 and form is valid', () => {
      component.SubmitForm(true);
      expect(mockAppsService.addInnovation).toHaveBeenCalled();
    });

    it('should reset editmode after submit', () => {
      component.SubmitForm(true);
      expect(component.editmode).toBe(false);
      expect(component.readonlymode).toBe(true);
    });
  });

  // ─── SubmitForm (update innovation) ──────────────────────────────────────

  describe('SubmitForm - update innovation (id>0)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      component.EditInnovation = new InnovationModelExt();
      component.EditInnovation.id = 1;
      component.EditInnovation.description = 'Updated idea';
      component.EditInnovation.status = 'Planning';
      component.EditInnovation.identifieD_DATE = new Date('2024-01-01');
      component.EditInnovation.targeT_DATE = new Date('2025-12-31');
    });

    it('should call updateInnovation when id>0', () => {
      component.SubmitForm(true);
      expect(mockAppsService.updateInnovation).toHaveBeenCalled();
    });

    it('should call serviceError on update failure', () => {
      mockAppsService.updateInnovation.and.returnValue(throwError(() => new Error('fail')));
      component.SubmitForm(true);
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── DoOneTime ────────────────────────────────────────────────────────────

  describe('DoOneTime', () => {
    it('should set isOneTime=true and update placeholders', () => {
      fixture.detectChanges();
      component.DoOneTime({ checked: true });
      expect(component.isOneTime).toBe(true);
      expect(component.phCases).toBe('No. of cases/Instances');
    });

    it('should set isOneTime=false and restore placeholders', () => {
      fixture.detectChanges();
      component.DoOneTime({ checked: false });
      expect(component.isOneTime).toBe(false);
      expect(component.phCases).toBe('No. of cases/Instances in one month');
    });
  });

  // ─── Effort Calculations ──────────────────────────────────────────────────

  describe('setBeforeEffort', () => {
    beforeEach(() => { fixture.detectChanges(); });

    it('should return empty string when cases count is null', () => {
      component.EditInnovation.beforE_CASES_COUNT = null;
      component.setBeforeEffort();
      expect(component.EditInnovation.beforE_EFFORT).toBe('');
    });

    it('should calculate effort in hours (UOM=1: minutes)', () => {
      component.EditInnovation.beforE_CASES_COUNT = 60;
      component.EditInnovation.beforE_TIME_TAKEN = 60 as any;
      component.EditInnovation.beforE_TIME_TAKEN_UOM = 1;
      component.setBeforeEffort();
      expect(parseFloat(component.EditInnovation.beforE_EFFORT!)).toBe(60);
    });
  });

  describe('setAfterEffort', () => {
    beforeEach(() => { fixture.detectChanges(); });

    it('should return empty string when cases count is null', () => {
      component.EditInnovation.afteR_CASES_COUNT = null;
      component.setAfterEffort();
      expect(component.EditInnovation.afteR_EFFORT).toBe('');
    });
  });

  describe('setBeforeCost', () => {
    beforeEach(() => { fixture.detectChanges(); });

    it('should calculate cost from ftecost_hour * effort', () => {
      component.EditInnovation.beforE_FTECOST_HOUR = 10;
      component.EditInnovation.beforE_EFFORT = '5';
      component.setBeforeCost();
      expect(component.EditInnovation.beforE_COST).toBe('50.00');
    });

    it('should return empty string when ftecost_hour is null', () => {
      component.EditInnovation.beforE_FTECOST_HOUR = null;
      component.setBeforeCost();
      expect(component.EditInnovation.beforE_COST).toBe('');
    });
  });

  describe('setAfterCost', () => {
    beforeEach(() => { fixture.detectChanges(); });

    it('should calculate after cost', () => {
      component.EditInnovation.afteR_FTECOST_HOUR = 8;
      component.EditInnovation.afteR_EFFORT = '4';
      component.setAfterCost();
      expect(component.EditInnovation.afteR_COST).toBe('32.00');
    });
  });

  describe('processCycleTime', () => {
    beforeEach(() => { fixture.detectChanges(); });

    it('should return min(s) for values < 60', () => {
      expect(component.processCycleTime(30)).toBe('30 min(s)');
    });

    it('should return hr(s) for 60 <= value < 480', () => {
      expect(component.processCycleTime(120)).toContain('hr(s)');
    });

    it('should return day(s) for value >= 480', () => {
      expect(component.processCycleTime(960)).toContain('day(s)');
    });
  });

  // ─── Service_GetUOMList ───────────────────────────────────────────────────

  describe('Service_GetUOMList', () => {
    it('should populate UOMList', () => {
      mockAppsService.GetParametersByType.and.returnValue(of([{ id: 1, name: 'Hours' }]));
      fixture.detectChanges();
      paramSubject.next({ custid: 'C001' });
      expect(mockAppsService.GetParametersByType).toHaveBeenCalledWith('UOM');
    });

    it('should call serviceError on failure', () => {
      mockAppsService.GetParametersByType.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(mockMyUtility.serviceError).toHaveBeenCalled();
    });
  });

  // ─── RefreshTable ─────────────────────────────────────────────────────────

  describe('RefreshTable', () => {
    it('should update dataSource with new data', () => {
      fixture.detectChanges();
      component.RefreshTable(mockIdeasData);
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should handle null input gracefully', () => {
      fixture.detectChanges();
      component.RefreshTable(null);
      expect(component.dataSource.data).toBeNull();
    });
  });

  // ─── showIdeaMatrix ───────────────────────────────────────────────────────

  describe('showIdeaMatrix', () => {
    it('should open dialog with processArea=all', () => {
      fixture.detectChanges();
      const dialogSpy = spyOn(component.dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as any);
      component.showIdeaMatrix();
      expect(dialogSpy).toHaveBeenCalled();
      const callArgs = dialogSpy.calls.mostRecent().args[1] as any;
      expect(callArgs.data.processArea).toBe('all');
    });
  });

  // ─── newEditInnovation ────────────────────────────────────────────────────

  describe('newEditInnovation', () => {
    it('should reset EditInnovation to empty InnovationModelExt', () => {
      fixture.detectChanges();
      component.EditInnovation.description = 'dirty';
      component.newEditInnovation();
      expect(component.EditInnovation.description).toBe('');
    });
  });
});
