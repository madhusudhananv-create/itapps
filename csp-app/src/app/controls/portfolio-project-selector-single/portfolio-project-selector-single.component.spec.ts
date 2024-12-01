import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioProjectSelectorSingleComponent } from './portfolio-project-selector-single.component';

describe('PortfolioProjectSelectorSingleComponent', () => {
  let component: PortfolioProjectSelectorSingleComponent;
  let fixture: ComponentFixture<PortfolioProjectSelectorSingleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioProjectSelectorSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProjectSelectorSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
