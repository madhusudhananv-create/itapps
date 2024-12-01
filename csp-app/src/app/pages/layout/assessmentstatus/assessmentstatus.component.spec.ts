import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentstatusComponent } from './assessmentstatus.component';

describe('AssessmentstatusComponent', () => {
  let component: AssessmentstatusComponent;
  let fixture: ComponentFixture<AssessmentstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
