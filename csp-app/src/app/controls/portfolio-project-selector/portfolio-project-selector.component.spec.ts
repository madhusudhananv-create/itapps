import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioProjectSelectorComponent } from './portfolio-project-selector.component';

describe('PortfolioProjectSelectorComponent', () => {
  let component: PortfolioProjectSelectorComponent;
  let fixture: ComponentFixture<PortfolioProjectSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioProjectSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
