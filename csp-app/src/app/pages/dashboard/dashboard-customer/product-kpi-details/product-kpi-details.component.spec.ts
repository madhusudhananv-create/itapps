import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductKpiDetailsComponent } from './product-kpi-details.component';

describe('ProductKpiDetailsComponent', () => {
  let component: ProductKpiDetailsComponent;
  let fixture: ComponentFixture<ProductKpiDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductKpiDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductKpiDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
