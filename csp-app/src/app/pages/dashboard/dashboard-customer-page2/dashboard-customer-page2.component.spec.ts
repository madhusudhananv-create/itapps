import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCustomerPage2Component } from './dashboard-customer-page2.component';

describe('DashboardCustomerPage2Component', () => {
  let component: DashboardCustomerPage2Component;
  let fixture: ComponentFixture<DashboardCustomerPage2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCustomerPage2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerPage2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
