import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdQualitativeBenefitsComponent } from './bvd-qualitative-benefits.component';

describe('BvdQualitativeBenefitsComponent', () => {
  let component: BvdQualitativeBenefitsComponent;
  let fixture: ComponentFixture<BvdQualitativeBenefitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdQualitativeBenefitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQualitativeBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
