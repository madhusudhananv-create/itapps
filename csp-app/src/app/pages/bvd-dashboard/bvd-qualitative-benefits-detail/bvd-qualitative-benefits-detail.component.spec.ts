import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BvdQualitativeBenefitsDetailComponent } from './bvd-qualitative-benefits-detail.component';

describe('BvdQualitativeBenefitsDetailComponent', () => {
  let component: BvdQualitativeBenefitsDetailComponent;
  let fixture: ComponentFixture<BvdQualitativeBenefitsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BvdQualitativeBenefitsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BvdQualitativeBenefitsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
