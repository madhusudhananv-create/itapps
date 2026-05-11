import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CiLeaderboardPageComponent } from './ci-leaderboard-page.component';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';

describe('CiLeaderboardPageComponent', () => {
  let component: CiLeaderboardPageComponent;
  let fixture: ComponentFixture<CiLeaderboardPageComponent>;

  const mockAppsService = {
    GetCILeaderboardData: jasmine.createSpy('GetCILeaderboardData').and.returnValue(of([])),
    getIdeaImprovementTypes: jasmine.createSpy('getIdeaImprovementTypes').and.returnValue(of([])),
    GetCITrackerNew: jasmine.createSpy('GetCITrackerNew').and.returnValue(of([])),
    GetDBConfigValue: jasmine.createSpy('GetDBConfigValue').and.returnValue(of('')),
    getUOM: jasmine.createSpy('getUOM').and.returnValue(of([]))
  };

  const mockMyUtility = {
    validateLogin: jasmine.createSpy('validateLogin'),
    serviceError: jasmine.createSpy('serviceError'),
    Month: jasmine.createSpy('Month').and.returnValue(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']),
    Year: jasmine.createSpy('Year').and.returnValue([2024, 2025, 2026]),
    getMonthNum: jasmine.createSpy('getMonthNum').and.returnValue(1)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CiLeaderboardPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AppsService, useValue: mockAppsService },
        { provide: MyUtility, useValue: mockMyUtility }
      ]
    }).overrideComponent(CiLeaderboardPageComponent, {
      set: { template: '<div></div>' }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CiLeaderboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise default property values', () => {
    expect(component.selectedCust).toBe('');
    expect(component.beneficiary).toBe(1);
    expect(component.uom).toBe(1);
    expect(component.menuToggleStatus).toBeFalsy();
    expect(component.allprojFlag).toBeTruthy();
    expect(component.projDisplayIndex).toBe(-1);
    expect(component.showPortprojIndex).toBe(-1);
  });

  it('should initialise ciCategory and ddlstatus as empty arrays', () => {
    expect(component.ddlstatus).toEqual([2, 3, 4, 8]);
    expect(component.allcust).toEqual([]);
    expect(component.allproj).toEqual([]);
  });
});
