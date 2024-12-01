import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSuccessJourneyComponent } from './dashboard-success-journey.component';

describe('DashboardSuccessJourneyComponent', () => {
  let component: DashboardSuccessJourneyComponent;
  let fixture: ComponentFixture<DashboardSuccessJourneyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSuccessJourneyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSuccessJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
