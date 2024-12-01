import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCustomerNextPageComponent } from './dashboard-customer-next-page.component';

describe('DashboardCustomerNextPageComponent', () => {
  let component: DashboardCustomerNextPageComponent;
  let fixture: ComponentFixture<DashboardCustomerNextPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCustomerNextPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerNextPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
