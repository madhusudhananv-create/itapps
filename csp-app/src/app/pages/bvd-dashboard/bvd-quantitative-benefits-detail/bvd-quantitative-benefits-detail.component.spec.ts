import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdQuantitativeBenefitsDetailComponent } from './bvd-quantitative-benefits-detail.component';

describe('BvdQuantitativeBenefitsDetailComponent', () => {
  let component: BvdQuantitativeBenefitsDetailComponent;
  let fixture: ComponentFixture<BvdQuantitativeBenefitsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdQuantitativeBenefitsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQuantitativeBenefitsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
