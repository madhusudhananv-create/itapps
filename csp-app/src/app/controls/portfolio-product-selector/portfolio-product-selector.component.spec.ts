import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioProductSelectorComponent } from './portfolio-product-selector.component';

describe('PortfolioProductSelectorComponent', () => {
  let component: PortfolioProductSelectorComponent;
  let fixture: ComponentFixture<PortfolioProductSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioProductSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProductSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
