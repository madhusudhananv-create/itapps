import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioProductSelectorComponent } from './portfolio-product-selector.component';
import { provideHttpClient } from '@angular/common/http';

describe('PortfolioProductSelectorComponent', () => {
  let component: PortfolioProductSelectorComponent;
  let fixture: ComponentFixture<PortfolioProductSelectorComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ PortfolioProductSelectorComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProductSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
