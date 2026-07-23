import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItopsComponent } from './dashboard-itops.component';

describe('DashboardItopsComponent', () => {
  let component: DashboardItopsComponent;
  let fixture: ComponentFixture<DashboardItopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardItopsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardItopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load Windows data when Windows service tower is selected', () => {
    component.selectedServiceTowers = ['windows'];
    component.loadDashboardData();
    expect(component.domainMaturityData.length).toBeGreaterThan(0);
    expect(component.parameterScoresData.length).toBeGreaterThan(0);
  });

  it('should load Linux data when Linux service tower is selected', () => {
    component.selectedServiceTowers = ['linux'];
    component.loadDashboardData();
    expect(component.domainMaturityData.length).toBeGreaterThan(0);
    expect(component.parameterScoresData.length).toBeGreaterThan(0);
  });

  it('should reset filters correctly', () => {
    component.selectedAccount = 'account1';
    component.selectedProject = 'project1';
    component.selectedServiceTowers = ['windows'];
    component.showDashboard = true;

    component.resetFilters();

    expect(component.selectedAccount).toBe('');
    expect(component.selectedProject).toBe('');
    expect(component.selectedServiceTowers).toEqual([]);
    expect(component.showDashboard).toBe(false);
  });

  it('should apply filters when service tower is selected', () => {
    component.selectedServiceTowers = ['windows'];
    component.applyFilters();

    expect(component.isLoading).toBe(true);
  });

  it('should not show dashboard when no service tower is selected', () => {
    component.selectedServiceTowers = [];
    component.applyFilters();

    expect(component.showDashboard).toBe(false);
  });
});
