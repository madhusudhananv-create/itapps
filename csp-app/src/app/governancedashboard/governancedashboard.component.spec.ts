import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernancedashboardComponent } from './governancedashboard.component';

describe('GovernancedashboardComponent', () => {
  let component: GovernancedashboardComponent;
  let fixture: ComponentFixture<GovernancedashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GovernancedashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovernancedashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
