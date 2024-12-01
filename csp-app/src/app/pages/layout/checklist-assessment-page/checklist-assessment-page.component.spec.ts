import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistAssessmentPageComponent } from './checklist-assessment-page.component';

describe('ChecklistAssessmentPageComponent', () => {
  let component: ChecklistAssessmentPageComponent;
  let fixture: ComponentFixture<ChecklistAssessmentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistAssessmentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistAssessmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
