import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmCustomerDashboardComponent } from './csm-customer-dashboard.component';

describe('CsmCustomerDashboardComponent', () => {
  let component: CsmCustomerDashboardComponent;
  let fixture: ComponentFixture<CsmCustomerDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmCustomerDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmCustomerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
