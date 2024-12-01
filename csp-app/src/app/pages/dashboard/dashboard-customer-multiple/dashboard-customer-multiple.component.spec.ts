import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCustomerMultipleComponent } from './dashboard-customer-multiple.component';

describe('DashboardCustomerMultipleComponent', () => {
  let component: DashboardCustomerMultipleComponent;
  let fixture: ComponentFixture<DashboardCustomerMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCustomerMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
