import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdQuantitativeBenefitsComponent } from './bvd-quantitative-benefits.component';

describe('BvdQuantitativeBenefitsComponent', () => {
  let component: BvdQuantitativeBenefitsComponent;
  let fixture: ComponentFixture<BvdQuantitativeBenefitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdQuantitativeBenefitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQuantitativeBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
