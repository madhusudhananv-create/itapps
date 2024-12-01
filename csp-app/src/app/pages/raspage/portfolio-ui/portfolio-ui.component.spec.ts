import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioUiComponent } from './portfolio-ui.component';

describe('PortfolioUiComponent', () => {
  let component: PortfolioUiComponent;
  let fixture: ComponentFixture<PortfolioUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
