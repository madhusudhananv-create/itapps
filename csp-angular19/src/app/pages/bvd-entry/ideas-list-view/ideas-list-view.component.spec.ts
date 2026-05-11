import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IdeasListViewComponent } from './ideas-list-view.component';
import { BvdEntryService } from '../services/bvd-entry.service';
import { BvdDashboardService } from '../../bvd-dashboard/services/bvd-dashboard.service';
import { AppsService } from '../../../services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('IdeasListViewComponent', () => {
  let component: IdeasListViewComponent;
  let fixture: ComponentFixture<IdeasListViewComponent>;
  let mockBvdService: any;
  let mockBvdDashboardService: any;
  let mockAppsService: any;
  let mockUtil: any;
  let mockRoute: any;

  beforeEach(waitForAsync(() => {
    mockBvdService = {
      customerid: 0,
      projecT_ID: '',
      ideA_ID: 0,
      bvdidea: {},
      bvdbenefit: [],
      bvdimplementationschdules: [],
      isIdeaSubmitted: false,
      isIdeaApproved: false,
      getAllIdeas: jasmine.createSpy('getAllIdeas').and.returnValue(of([])),
      getAllIdeasByCustomer: jasmine.createSpy('getAllIdeasByCustomer').and.returnValue(of([])),
      getIdeaDetailsById: jasmine.createSpy('getIdeaDetailsById').and.returnValue(of(null)),
      updateIdeaStatus: jasmine.createSpy('updateIdeaStatus').and.returnValue(of({})),
      DeleteIdeaById: jasmine.createSpy('DeleteIdeaById').and.returnValue(of({}))
    };

    mockBvdDashboardService = {
      dashboardStartdate: null,
      dashboardEnddate: null
    };

    mockAppsService = {
      GetCustomerList: jasmine.createSpy('GetCustomerList').and.returnValue(of([]))
    };

    mockUtil = {
      IsCSM: jasmine.createSpy('IsCSM').and.returnValue(false),
      IsPremier: jasmine.createSpy('IsPremier').and.returnValue(false),
      serviceError: jasmine.createSpy('serviceError'),
      showSuccess: jasmine.createSpy('showSuccess'),
      showWarning: jasmine.createSpy('showWarning'),
      showWarningConfirmation: jasmine.createSpy('showWarningConfirmation').and.returnValue({
        afterClosed: () => of(false)
      })
    };

    mockRoute = {
      params: of({ customerid: '2', reset: '' }),
      queryParams: of({ projid: '5', Ideaid: '0' })
    };

    TestBed.configureTestingModule({
      imports: [
        IdeasListViewComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: BvdEntryService, useValue: mockBvdService },
        { provide: BvdDashboardService, useValue: mockBvdDashboardService },
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockUtil },
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.returnValue('');
    fixture = TestBed.createComponent(IdeasListViewComponent);
    component = fixture.componentInstance;
    spyOn(component, 'getAllIdeas').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default property values', () => {
    expect(component.ideas).toEqual([]);
    expect(component.dataSource).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.isNavigating).toBe(false);
    expect(component.forApproval).toBe(false);
    expect(component.searchText).toBe('');
    expect(component.pageSize).toBe(5);
  });

  it('should call getAllIdeas when customerid > 0 on ngOnInit', () => {
    expect(component.getAllIdeas).toHaveBeenCalled();
  });

  it('should set ideas and dataSource when getAllIdeas returns data', () => {
    const ideas = [
      { id: 1, description: 'Idea 1', status: 'Draft' },
      { id: 2, description: 'Idea 2', status: 'Submitted' }
    ];
    mockBvdService.getAllIdeasByCustomer.and.returnValue(of(ideas));
    component.customerid = 2;
    component.getAllIdeas();
    expect(component.ideas.length).toBe(2);
    expect(component.dataSource.length).toBe(2);
  });

  it('should set ideas to empty when getAllIdeas returns empty', () => {
    mockBvdService.getAllIdeasByCustomer.and.returnValue(of([]));
    component.customerid = 2;
    component.getAllIdeas();
    expect(component.ideas).toEqual([]);
    expect(component.dataSource).toEqual([]);
  });

  it('should call serviceError on getAllIdeas error', () => {
    mockBvdService.getAllIdeasByCustomer.and.returnValue(throwError(() => new Error('err')));
    component.customerid = 2;
    component.getAllIdeas();
    expect(mockUtil.serviceError).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should load customers via GetCustomerList when IsCSM is true', () => {
    mockUtil.IsCSM.and.returnValue(true);
    mockAppsService.GetCustomerList.and.returnValue(of([{ id: 1, name: 'Cust A' }]));
    component.getCustomerList();
    expect(component.customers.length).toBe(1);
  });

  it('should reset bvdService properties on resetValues', () => {
    component.resetValues();
    expect(mockBvdService.bvdbenefit).toEqual([]);
    expect(mockBvdService.bvdimplementationschdules).toEqual([]);
  });

  it('should filter to submitted ideas only when forApproval is true', () => {
    component.ideas = [
      { id: 1, status: 'Draft' } as any,
      { id: 2, status: 'Submitted' } as any
    ];
    component.forApproval = true;
    component.onForApprovalChange();
    expect(component.dataSource.length).toBe(1);
    expect(component.dataSource[0].status).toBe('Submitted');
  });

  it('should restore all ideas when forApproval is false', () => {
    component.ideas = [
      { id: 1, status: 'Draft' } as any,
      { id: 2, status: 'Submitted' } as any
    ];
    component.forApproval = false;
    component.onForApprovalChange();
    expect(component.dataSource.length).toBe(2);
  });

  it('should filter dataSource based on search text in applySearch', () => {
    component.ideas = [
      { id: 1, description: 'Angular upgrade', projecT_NAME: 'P1', type: 'Idea', identified_By: '', responsible: '' } as any,
      { id: 2, description: 'React migration', projecT_NAME: 'P2', type: 'Risk', identified_By: '', responsible: '' } as any
    ];
    component.searchText = 'angular';
    component.applySearch();
    expect(component.dataSource.length).toBe(1);
  });

  it('should restore all ideas on clearSearch', () => {
    component.ideas = [{ id: 1 } as any, { id: 2 } as any];
    component.searchText = 'test';
    component.clearSearch();
    expect(component.searchText).toBe('');
    expect(component.dataSource.length).toBe(2);
  });

  it('should toggle filterOpen on toggleFilter', () => {
    component.filterOpen = false;
    component.toggleFilter();
    expect(component.filterOpen).toBe(true);
    component.toggleFilter();
    expect(component.filterOpen).toBe(false);
  });

  it('should return correct status class from getStatusClass', () => {
    expect(component.getStatusClass('draft')).toBe('Draft');
    expect(component.getStatusClass('')).toBe('');
  });

  it('should return pending count correctly', () => {
    component.ideas = [
      { id: 1, status: 'Submitted' } as any,
      { id: 2, status: 'Draft' } as any
    ];
    expect(component.getPendingCount()).toBe(1);
  });

  it('should return approved count correctly', () => {
    component.ideas = [
      { id: 1, status: 'Approved' } as any,
      { id: 2, status: 'Draft' } as any
    ];
    expect(component.getApprovedCount()).toBe(1);
  });

  it('should return under review count correctly', () => {
    component.ideas = [
      { id: 1, status: 'Under Review' } as any,
      { id: 2, status: 'Planned' } as any,
      { id: 3, status: 'Draft' } as any
    ];
    expect(component.getUnderReviewCount()).toBe(2);
  });

  it('should return correct type badge class from getTypeBadgeClass', () => {
    expect(component.getTypeBadgeClass('improvement')).toBe('ilv-badge--improvement');
    expect(component.getTypeBadgeClass('idea')).toBe('ilv-badge--idea');
    expect(component.getTypeBadgeClass('risk')).toBe('ilv-badge--risk');
    expect(component.getTypeBadgeClass('')).toBe('');
  });

  it('should return correct initials from getInitials', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Alice')).toBe('AL');
    expect(component.getInitials('')).toBe('?');
  });

  it('should paginate correctly via pagedData', () => {
    component.dataSource = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 } as any));
    component.currentPage = 0;
    component.pageSize = 5;
    expect(component.pagedData().length).toBe(5);
  });

  it('should increment page on nextPage', () => {
    component.dataSource = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 } as any));
    component.currentPage = 0;
    component.pageSize = 5;
    component.nextPage();
    expect(component.currentPage).toBe(1);
  });

  it('should decrement page on prevPage', () => {
    component.currentPage = 2;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should not go below 0 on prevPage when at first page', () => {
    component.currentPage = 0;
    component.prevPage();
    expect(component.currentPage).toBe(0);
  });

  it('should reset currentPage on onPageSizeChange', () => {
    component.currentPage = 3;
    component.onPageSizeChange();
    expect(component.currentPage).toBe(0);
  });

  it('should load customer ideas on onCustomerChange when selectedCustomer > 0', () => {
    const data = [{ id: 1, status: 'Draft' }];
    mockBvdService.getAllIdeasByCustomer.and.returnValue(of(data));
    component.selectedCustomer = 3;
    component.onCustomerChange();
    expect(mockBvdService.getAllIdeasByCustomer).toHaveBeenCalledWith(3);
    expect(component.ideas.length).toBe(1);
  });

  it('should return isRowCheckboxDisabled=true for draft rows', () => {
    const row = { status: 'Draft' } as any;
    expect(component.isRowCheckboxDisabled(row)).toBe(true);
  });

  it('should return isRowCheckboxDisabled=false for submitted rows', () => {
    const row = { status: 'Submitted' } as any;
    expect(component.isRowCheckboxDisabled(row)).toBe(false);
  });
});
