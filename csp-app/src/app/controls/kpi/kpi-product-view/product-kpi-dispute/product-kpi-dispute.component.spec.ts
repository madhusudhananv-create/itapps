import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductKpiDisputeComponent } from './product-kpi-dispute.component';

describe('ProductKpiDisputeComponent', () => {
  let component: ProductKpiDisputeComponent;
  let fixture: ComponentFixture<ProductKpiDisputeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductKpiDisputeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductKpiDisputeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
