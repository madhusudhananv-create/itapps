import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistFindingsComponent } from './checklist-findings.component';

describe('ChecklistFindingsComponent', () => {
  let component: ChecklistFindingsComponent;
  let fixture: ComponentFixture<ChecklistFindingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistFindingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistFindingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
