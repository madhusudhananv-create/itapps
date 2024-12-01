import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseServiceDeliveryHealthComponent } from './enterprise-service-delivery-health.component';

describe('EnterpriseServiceDeliveryHealthComponent', () => {
  let component: EnterpriseServiceDeliveryHealthComponent;
  let fixture: ComponentFixture<EnterpriseServiceDeliveryHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseServiceDeliveryHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseServiceDeliveryHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
