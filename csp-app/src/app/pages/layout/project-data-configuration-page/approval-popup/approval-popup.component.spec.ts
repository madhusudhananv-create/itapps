import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalPopupComponent } from './approval-popup.component';

describe('ApprovalPopupComponent', () => {
  let component: ApprovalPopupComponent;
  let fixture: ComponentFixture<ApprovalPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
