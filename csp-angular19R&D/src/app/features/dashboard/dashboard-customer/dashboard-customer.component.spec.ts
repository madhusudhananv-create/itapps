import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardCustomerComponent } from './dashboard-customer.component';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardCustomerComponent', () => {
  let component: DashboardCustomerComponent;
  let fixture: ComponentFixture<DashboardCustomerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ DashboardCustomerComponent ],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        provideHttpClient()
      ]
    })
    .overrideComponent(DashboardCustomerComponent, { set: { imports: [], template: '<div></div>' } })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
