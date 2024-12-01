import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlCustomerComponent } from './access-control-customer.component';

describe('AccessControlCustomerComponent', () => {
  let component: AccessControlCustomerComponent;
  let fixture: ComponentFixture<AccessControlCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessControlCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
