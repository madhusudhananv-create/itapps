import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingCriteriaRemarksComponent } from './rating-criteria-remarks.component';

describe('RatingCriteriaRemarksComponent', () => {
  let component: RatingCriteriaRemarksComponent;
  let fixture: ComponentFixture<RatingCriteriaRemarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingCriteriaRemarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingCriteriaRemarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
