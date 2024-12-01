import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistFindingsNewComponent } from './checklist-findings-new.component';

describe('ChecklistFindingsNewComponent', () => {
  let component: ChecklistFindingsNewComponent;
  let fixture: ComponentFixture<ChecklistFindingsNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistFindingsNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistFindingsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
