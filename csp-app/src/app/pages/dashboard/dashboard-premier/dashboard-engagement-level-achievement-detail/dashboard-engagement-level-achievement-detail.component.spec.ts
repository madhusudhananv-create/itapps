import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEngagementLevelAchievementDetailComponent } from './dashboard-engagement-level-achievement-detail.component';

describe('DashboardEngagementLevelAchievementDetailComponent', () => {
  let component: DashboardEngagementLevelAchievementDetailComponent;
  let fixture: ComponentFixture<DashboardEngagementLevelAchievementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardEngagementLevelAchievementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardEngagementLevelAchievementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
