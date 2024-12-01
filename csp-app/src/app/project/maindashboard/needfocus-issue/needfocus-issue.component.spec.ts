import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedfocusIssueComponent } from './needfocus-issue.component';

describe('NeedfocusIssueComponent', () => {
  let component: NeedfocusIssueComponent;
  let fixture: ComponentFixture<NeedfocusIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedfocusIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedfocusIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
