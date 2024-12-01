import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssessmentFindingDetailsComponent } from './view-assessment-finding-details.component';

describe('ViewAssessmentFindingDetailsComponent', () => {
  let component: ViewAssessmentFindingDetailsComponent;
  let fixture: ComponentFixture<ViewAssessmentFindingDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAssessmentFindingDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssessmentFindingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
