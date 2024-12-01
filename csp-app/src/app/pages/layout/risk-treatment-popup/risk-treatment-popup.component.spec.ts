import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskTreatmentPopupComponent } from './risk-treatment-popup.component';

describe('RiskTreatmentPopupComponent', () => {
  let component: RiskTreatmentPopupComponent;
  let fixture: ComponentFixture<RiskTreatmentPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskTreatmentPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskTreatmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
