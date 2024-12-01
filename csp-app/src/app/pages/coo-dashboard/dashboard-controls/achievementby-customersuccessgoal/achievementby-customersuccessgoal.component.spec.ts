import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementByCustomerSuccessGoalComponent } from './achievementby-customersuccessgoal.component';

describe('AchievementByCustomerSuccessGoalComponent', () => {
  let component: AchievementByCustomerSuccessGoalComponent;
  let fixture: ComponentFixture<AchievementByCustomerSuccessGoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievementByCustomerSuccessGoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementByCustomerSuccessGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
