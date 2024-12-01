import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPortfolioAchievementDetailComponent } from './dashboard-portfolio-achievement-detail.component';

describe('DashboardPortfolioAchievementDetailComponent', () => {
  let component: DashboardPortfolioAchievementDetailComponent;
  let fixture: ComponentFixture<DashboardPortfolioAchievementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPortfolioAchievementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPortfolioAchievementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
