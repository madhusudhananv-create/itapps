import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductResponsibleComponent } from './product-responsible.component';

describe('ProductResponsibleComponent', () => {
  let component: ProductResponsibleComponent;
  let fixture: ComponentFixture<ProductResponsibleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductResponsibleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductResponsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
