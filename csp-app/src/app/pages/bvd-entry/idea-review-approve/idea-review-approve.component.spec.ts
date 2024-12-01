import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaReviewApproveComponent } from './idea-review-approve.component';

describe('IdeaReviewApproveComponent', () => {
  let component: IdeaReviewApproveComponent;
  let fixture: ComponentFixture<IdeaReviewApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeaReviewApproveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaReviewApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
