import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssFeedbackComponent } from './css-feedback.component';

describe('CssFeedbackComponent', () => {
  let component: CssFeedbackComponent;
  let fixture: ComponentFixture<CssFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
