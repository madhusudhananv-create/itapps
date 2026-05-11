import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { CsmCustomerDashboardComponent } from './csm-customer-dashboard.component';

describe('CsmCustomerDashboardComponent', () => {
  let component: CsmCustomerDashboardComponent;
  let fixture: ComponentFixture<CsmCustomerDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ CsmCustomerDashboardComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
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
