import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaBenefitSummaryComponent } from './idea-benefit-summary.component';

describe('IdeaBenefitSummaryComponent', () => {
  let component: IdeaBenefitSummaryComponent;
  let fixture: ComponentFixture<IdeaBenefitSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeaBenefitSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaBenefitSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
