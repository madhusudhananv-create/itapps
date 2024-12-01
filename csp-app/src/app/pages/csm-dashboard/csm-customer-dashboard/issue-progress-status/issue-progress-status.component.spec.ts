import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueProgressStatusComponent } from './issue-progress-status.component';

describe('IssueProgressStatusComponent', () => {
  let component: IssueProgressStatusComponent;
  let fixture: ComponentFixture<IssueProgressStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueProgressStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueProgressStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
