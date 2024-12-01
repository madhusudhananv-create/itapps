import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskStatementGuidelineComponent } from './risk-statement-guideline.component';

describe('RiskStatementGuidelineComponent', () => {
  let component: RiskStatementGuidelineComponent;
  let fixture: ComponentFixture<RiskStatementGuidelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskStatementGuidelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskStatementGuidelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
